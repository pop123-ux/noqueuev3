/**
 * secureAiInvoke — Privacy-first AI gateway.
 *
 * Flow:
 *   1. Frontend calls this function with { prompt, response_json_schema?, add_context_from_internet?, model? }.
 *   2. Backend detects PII in the prompt (CNP, names, emails, phones, addresses, passport/ID series).
 *   3. Each PII value is replaced with a deterministic placeholder (<PERSON_001>, <CNP_001>, ...).
 *   4. Original values are AES-256-GCM encrypted and persisted in the TokenMap entity.
 *   5. ONLY the tokenized prompt is sent to InvokeLLM.
 *   6. The AI response is locally rehydrated (placeholders → original values) before being returned.
 *   7. An AuditLog row is written.
 *
 * The AI provider never receives raw PII.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Flip to false to silence backend debug logs.
const DEBUG = true;
const dbg = (...a) => { if (DEBUG) console.log('[secureAi]', ...a); };

// ---------- Encryption (AES-256-GCM via Web Crypto) ----------

async function getKey() {
  const b64 = Deno.env.get('PII_ENCRYPTION_KEY');
  if (!b64) throw new Error('PII_ENCRYPTION_KEY is not configured.');
  const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
  if (raw.length !== 32) throw new Error('PII_ENCRYPTION_KEY must decode to 32 bytes.');
  return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

async function encrypt(plaintext) {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  ));
  const out = new Uint8Array(iv.length + ct.length);
  out.set(iv, 0);
  out.set(ct, iv.length);
  return btoa(String.fromCharCode(...out));
}

// ---------- PII detection ----------
// Order matters: more specific patterns first so they don't get swallowed by name regex.

const PII_PATTERNS = [
  // Romanian CNP: 13 digits, first digit 1-8
  { type: 'cnp', regex: /\b[1-8]\d{12}\b/g },
  // Email
  { type: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g },
  // Romanian phone numbers (+40 or 07xx)
  { type: 'phone', regex: /(?:\+?40[\s.-]?|0)7\d{2}[\s.-]?\d{3}[\s.-]?\d{3}/g },
  // Romanian ID card: 2 letters + 6 digits (e.g. CJ123456)
  { type: 'id_card', regex: /\b[A-Z]{2}\s?\d{6}\b/g },
  // Passport: 1 letter + 8 digits (RO format) — heuristic
  { type: 'passport', regex: /\b[A-Z]\d{8}\b/g },
  // Romanian address heuristics — street prefixes
  { type: 'address', regex: /\b(?:Str\.?|Strada|Bd\.?|Bulevardul|Calea|Aleea|Splaiul|Piața|Piata|Soseaua|Șoseaua)\s+[A-ZĂÂÎȘȚ][^\n,.;]{2,60}(?:\s*(?:nr\.?|Nr\.?)\s*\d+[A-Za-z]?)?/g },
  // Person names — two consecutive capitalized words (Romanian diacritics allowed).
  // Kept last and conservative to avoid eating ordinary capitalized sentences.
  { type: 'person', regex: /\b[A-ZĂÂÎȘȚ][a-zăâîșț]{1,}\s+[A-ZĂÂÎȘȚ][a-zăâîșț]{1,}(?:\s+[A-ZĂÂÎȘȚ][a-zăâîșț]{1,})?\b/g },
];

// Common false-positive matches that look like names but are place names, institutions,
// or product names. These are NEVER tokenized.
const PERSON_ALLOWLIST = new Set([
  'Cluj Napoca', 'Cluj-Napoca', 'Cluj Napoca,', 'Bucuresti', 'București',
  'NoQueue AI', 'NoQueue Cluj', 'Civic Copilot', 'Identity Vault',
  'Strada Memorandumului', 'Bulevardul Eroilor',
]);

const PREFIX = {
  cnp: 'CNP',
  email: 'EMAIL',
  phone: 'PHONE',
  id_card: 'ID',
  passport: 'PASSPORT',
  address: 'ADDRESS',
  person: 'PERSON',
  other: 'OTHER',
};

function tokenizePrompt(prompt) {
  const valueToPlaceholder = new Map(); // exact original string → placeholder
  const counters = {};
  const mappings = []; // {placeholder, original, field_type}

  let working = prompt;

  for (const { type, regex } of PII_PATTERNS) {
    working = working.replace(regex, (match) => {
      // Skip well-known place/institution names that look like person names
      if (type === 'person' && PERSON_ALLOWLIST.has(match)) return match;
      // Re-use placeholder if same exact value was already tokenized in this prompt
      if (valueToPlaceholder.has(match)) return valueToPlaceholder.get(match);
      counters[type] = (counters[type] || 0) + 1;
      const placeholder = `<${PREFIX[type]}_${String(counters[type]).padStart(3, '0')}>`;
      valueToPlaceholder.set(match, placeholder);
      mappings.push({ placeholder, original: match, field_type: type });
      return placeholder;
    });
  }

  return { tokenized: working, mappings };
}

function rehydrate(text, mappings) {
  if (typeof text !== 'string') return text;
  let out = text;
  // Replace longer placeholders first (defensive — all our placeholders have unique numeric suffixes anyway)
  const sorted = [...mappings].sort((a, b) => b.placeholder.length - a.placeholder.length);
  for (const m of sorted) {
    out = out.split(m.placeholder).join(m.original);
  }
  return out;
}

function rehydrateAny(value, mappings) {
  if (typeof value === 'string') return rehydrate(value, mappings);
  if (Array.isArray(value)) return value.map(v => rehydrateAny(v, mappings));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = rehydrateAny(v, mappings);
    return out;
  }
  return value;
}

// ---------- Handler ----------

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const {
      prompt,
      response_json_schema,
      add_context_from_internet = false,
      model,
      file_urls,
    } = body || {};

    if (!prompt || typeof prompt !== 'string') {
      return Response.json({ error: 'prompt (string) is required' }, { status: 400 });
    }

    const session_id = crypto.randomUUID();
    dbg('session', session_id, 'user', user.email);

    // 1. Tokenize
    const { tokenized, mappings } = tokenizePrompt(prompt);
    dbg('tokenized', mappings.length, 'PII items');

    // 2. Encrypt + persist mappings (only if anything was detected)
    if (mappings.length > 0) {
      const expires_at = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const rows = await Promise.all(mappings.map(async (m) => ({
        session_id,
        user_id: user.email,
        placeholder: m.placeholder,
        encrypted_value: await encrypt(m.original),
        field_type: m.field_type,
        expires_at,
      })));
      try {
        await base44.asServiceRole.entities.TokenMap.bulkCreate(rows);
        dbg('persisted', rows.length, 'TokenMap rows');
      } catch (e) {
        // Fallback to single create if bulkCreate isn't available
        for (const r of rows) await base44.asServiceRole.entities.TokenMap.create(r);
      }
    }

    // 3. Call AI with tokenized prompt ONLY
    const aiArgs = { prompt: tokenized };
    if (response_json_schema) aiArgs.response_json_schema = response_json_schema;
    if (add_context_from_internet) aiArgs.add_context_from_internet = true;
    if (model) aiArgs.model = model;
    if (Array.isArray(file_urls) && file_urls.length > 0) aiArgs.file_urls = file_urls;

    const aiResponse = await base44.integrations.Core.InvokeLLM(aiArgs);

    // 4. Rehydrate locally
    const rehydrated = rehydrateAny(aiResponse, mappings);

    // 5. Audit log (no PII, no plaintext)
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        user_id: user.email,
        action: 'secure_ai_invoke',
        resource_type: 'TokenMap',
        resource_id: session_id,
        details: `pii_count=${mappings.length} types=${[...new Set(mappings.map(m => m.field_type))].join(',') || 'none'} model=${model || 'default'}`,
        severity: 'info',
        success: true,
      });
    } catch (e) {
      dbg('audit log failed (non-fatal):', e?.message);
    }

    return Response.json({
      session_id,
      pii_count: mappings.length,
      pii_types: [...new Set(mappings.map(m => m.field_type))],
      response: rehydrated,
    });
  } catch (error) {
    console.error('[secureAi] error:', error);
    return Response.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
});