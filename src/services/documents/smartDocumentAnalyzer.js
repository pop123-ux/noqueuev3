/**
 * Smart Document Analyzer — NoQueue AI 2.0
 *
 * Pipeline:
 *  1. Upload file to storage  (UploadFile)
 *  2. Extract raw structured data  (ExtractDataFromUploadedFile)
 *  3. AI validation + plain-Romanian explanation  (InvokeLLM, web-grounded)
 *
 * Returns a single normalized AnalysisReport for the UI.
 */
import { base44 } from '@/api/base44Client';
import { secureAiClient } from '@/lib/ai/secureAiClient';

/** JSON schema we ask the extractor to fill. Generic across RO civic docs. */
const EXTRACTION_SCHEMA = {
  type: 'object',
  properties: {
    document_type: { type: 'string', description: 'e.g. carte_identitate, pasaport, permis_conducere, certificat_nastere, certificat_fiscal, cazier, contract, alt_document' },
    document_title: { type: 'string' },
    issuing_authority: { type: 'string' },
    series: { type: 'string' },
    number: { type: 'string' },
    full_name: { type: 'string' },
    cnp: { type: 'string' },
    issue_date: { type: 'string', description: 'YYYY-MM-DD if possible' },
    expiry_date: { type: 'string', description: 'YYYY-MM-DD if possible' },
    address: { type: 'string' },
    additional_fields: {
      type: 'array',
      items: {
        type: 'object',
        properties: { label: { type: 'string' }, value: { type: 'string' } },
      },
    },
    raw_text_excerpt: { type: 'string', description: 'short excerpt of visible text' },
  },
};

/** Validation + explanation schema returned by LLM */
const ANALYSIS_SCHEMA = {
  type: 'object',
  properties: {
    document_kind_ro: { type: 'string', description: 'Tipul documentului în română' },
    one_line_summary: { type: 'string', description: '1 propoziție în română' },
    plain_explanation: { type: 'string', description: 'Explicație în română simplă, 3-5 paragrafe' },
    validity_status: {
      type: 'string',
      enum: ['valid', 'expiring_soon', 'expired', 'unknown'],
    },
    days_until_expiry: { type: 'number' },
    issues: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          severity: { type: 'string', enum: ['critical', 'warning', 'info'] },
          title: { type: 'string' },
          description: { type: 'string' },
          how_to_fix: { type: 'string' },
        },
      },
    },
    glossary: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          term: { type: 'string' },
          meaning: { type: 'string' },
        },
      },
    },
    next_actions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          why: { type: 'string' },
          urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
          workflow_hint: { type: 'string', description: 'matching workflow id if applicable' },
        },
      },
    },
    suggested_workflow_id: { type: 'string' },
    confidence: { type: 'number', description: '0-1' },
  },
};

/** Compute days until expiry (positive if future, negative if past) */
function daysUntil(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return Math.floor((d.getTime() - Date.now()) / 86400000);
}

/**
 * Analyze a document.
 * @param {File} file
 * @param {(stepIndex: number, stepLabel: string) => void} onProgress
 * @returns {Promise<AnalysisReport>}
 */
export async function analyzeDocument(file, onProgress = () => {}) {
  // ── 1. Upload ──────────────────────────────────────────────────────
  onProgress(0, 'Încarcă document...');
  const { file_url } = await base44.integrations.Core.UploadFile({ file });

  // ── 2. Extract structured data ─────────────────────────────────────
  onProgress(1, 'Extrage datele cu OCR...');
  const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
    file_url,
    json_schema: EXTRACTION_SCHEMA,
  });
  const extracted = extractResult?.status === 'success' ? (extractResult.output || {}) : {};

  // ── 3. AI validation & plain-language report ───────────────────────
  onProgress(2, 'Verifică legislația în vigoare...');
  const today = new Date().toISOString().slice(0, 10);
  const prompt = `Esti un asistent civic pentru cetateni romani. Analizezi un document oficial extras prin OCR.

DATA DE AZI: ${today}

DATELE EXTRASE DIN DOCUMENT:
${JSON.stringify(extracted, null, 2)}

Sarcina ta:
1. Identifica clar tipul documentului (în română).
2. Scrie o explicatie pe intelesul oricui (3-5 paragrafe scurte) despre ce reprezinta documentul, ce drepturi/obligatii confera si la ce se foloseste.
3. Verifica validitatea: data expirarii vs azi. Marcheaza "expired", "expiring_soon" (sub 90 zile), "valid", sau "unknown".
4. Identifica probleme (campuri lipsa, date inconsistente, document deteriorat, expirat) — fiecare cu severitate si pas de remediere.
5. Construieste un GLOSAR cu 3-6 termeni tehnici/juridici care apar in document, explicati simplu.
6. Recomanda 2-4 actiuni concrete pentru utilizator (innoire, depunere cerere, etc.), cu urgenta si workflow_hint daca se potriveste cu o procedura cunoscuta (ex: passport-renewal, id-renewal, change-address, driving-license, criminal-record).
7. Sugereaza un suggested_workflow_id daca documentul deschide o procedura urmatoare.
8. Pune confidence intre 0 si 1 in functie de cat de complete sunt datele extrase.

Verifica cerintele actuale conform legislatiei romanesti in vigoare. Foloseste un ton clar, prietenos, fara jargon.`;

  // Privacy: prompt contains OCR-extracted PII (CNP, name, address, doc series).
  // Route through secureAiClient — the backend tokenizes before calling the AI
  // and rehydrates placeholders in the response.
  const analysis = await secureAiClient.invoke({
    prompt,
    add_context_from_internet: true,
    response_json_schema: ANALYSIS_SCHEMA,
    model: 'gemini_3_flash',
  });

  // ── 4. Normalize ───────────────────────────────────────────────────
  onProgress(3, 'Finalizează raportul...');
  const computedDays = daysUntil(extracted.expiry_date);
  let validity = analysis.validity_status || 'unknown';
  if (computedDays !== null) {
    if (computedDays < 0) validity = 'expired';
    else if (computedDays <= 90) validity = 'expiring_soon';
    else validity = 'valid';
  }

  return {
    file_url,
    file_name: file.name,
    extracted,
    analysis: {
      ...analysis,
      validity_status: validity,
      days_until_expiry: computedDays ?? analysis.days_until_expiry ?? null,
    },
    generated_at: new Date().toISOString(),
  };
}

export const ANALYSIS_STEPS = [
  { label: 'Încărcare', icon: '📤' },
  { label: 'OCR & extragere', icon: '🔍' },
  { label: 'Verificare legală', icon: '⚖️' },
  { label: 'Raport final', icon: '✨' },
];