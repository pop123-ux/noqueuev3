/**
 * LLM Payload Sanitization + Prompt Injection Detection
 *
 * PRINCIPLE: The LLM must NEVER receive raw identity data.
 * All user data is replaced with structural placeholders before hitting the AI.
 */

import {
  LLM_FIELD_PLACEHOLDER_MAP,
  LLM_ALLOWED_FIELDS,
  INJECTION_PATTERNS,
  MAX_OCR_FIELD_LENGTH,
} from './config';

/**
 * Sanitize a user profile object before any LLM interaction.
 * Returns a safe payload with placeholders instead of real PII.
 *
 * @param {object} profile  - UserPrivateProfile or IdentitySecret record
 * @param {object} context  - Non-sensitive workflow context to pass through
 * @returns {object} sanitizedPayload
 */
export function sanitizeLLMPayload(profile = {}, context = {}) {
  const sanitized = {};

  // Pass through allowed non-sensitive fields
  for (const field of LLM_ALLOWED_FIELDS) {
    if (profile[field] !== undefined && profile[field] !== null && profile[field] !== '') {
      sanitized[field] = profile[field];
    }
  }

  // Replace sensitive fields with placeholders
  for (const [field, placeholder] of Object.entries(LLM_FIELD_PLACEHOLDER_MAP)) {
    if (profile[field] !== undefined && profile[field] !== null && profile[field] !== '') {
      sanitized[field] = placeholder;
    }
  }

  // Strip any remaining file URLs entirely
  for (const key of Object.keys(sanitized)) {
    if (typeof sanitized[key] === 'string' && /https?:\/\//.test(sanitized[key])) {
      sanitized[key] = '[FILE_URL_REDACTED]';
    }
  }

  // Merge non-sensitive context (procedure type, workflow metadata)
  return { ...sanitized, ...sanitizeContext(context) };
}

/**
 * Sanitize context object (workflow/procedure metadata).
 * Ensures no raw data bleeds into context fields.
 */
export function sanitizeContext(context = {}) {
  const safe = {};
  const SAFE_CONTEXT_KEYS = [
    'procedure', 'procedure_key', 'workflow_id', 'institution_id',
    'document_categories', 'channel', 'urgency', 'city', 'county',
  ];
  for (const key of SAFE_CONTEXT_KEYS) {
    if (context[key] !== undefined) safe[key] = context[key];
  }
  return safe;
}

/**
 * Detect prompt injection attempts in user-supplied text or OCR output.
 * Returns { safe: boolean, reason?: string }
 */
export function detectPromptInjection(text) {
  if (typeof text !== 'string') return { safe: true };

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(text)) {
      return {
        safe: false,
        reason: `Conținut suspicios detectat: modelul a identificat o posibilă tentativă de injecție ("${pattern.source.slice(0, 40)}...").`,
      };
    }
  }
  return { safe: true };
}

/**
 * Validate and sanitize an OCR-extracted field string.
 * Truncates to safe length, checks for injection, strips control chars.
 */
export function sanitizeOCRField(value, fieldName = 'field') {
  if (typeof value !== 'string') return '';

  // Truncate
  let clean = value.slice(0, MAX_OCR_FIELD_LENGTH);

  // Strip control characters
  clean = clean.replace(/[\x00-\x1F\x7F]/g, ' ').trim();

  // Injection check
  const check = detectPromptInjection(clean);
  if (!check.safe) {
    console.warn(`[Security] OCR field "${fieldName}" rejected: ${check.reason}`);
    return `[${fieldName.toUpperCase()}_SANITIZED]`;
  }

  return clean;
}

/**
 * Build a sanitized structured prompt object for the AI layer.
 * The LLM receives this — never raw user text.
 */
export function buildSanitizedPrompt({ procedure, userMessage, profile, context }) {
  // Sanitize any user-supplied message
  const injection = detectPromptInjection(userMessage || '');
  const safeMessage = injection.safe
    ? (userMessage || '').slice(0, 512)
    : '[MESSAGE_SANITIZED_INJECTION_DETECTED]';

  return {
    procedure_type: context?.procedure_key || 'unknown',
    institution_city: 'Cluj-Napoca',
    user_intent: safeMessage,
    profile_summary: sanitizeLLMPayload(profile || {}, context || {}),
    metadata: {
      timestamp: new Date().toISOString(),
      app: 'noqueue-civic-assistant',
    },
  };
}