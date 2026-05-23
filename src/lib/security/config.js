/**
 * Centralized security configuration for NoQueue civic platform.
 * All security constants live here — never scatter magic values in components.
 */

// ── Field encryption ─────────────────────────────────────────────────────────
export const ENCRYPTION_APP_SALT = 'noqueue-vault-2024-secure-salt-v1';
export const PBKDF2_ITERATIONS   = 100_000;
export const ENCRYPTED_PREFIX    = 'ENC:';

// Sensitive fields that MUST be encrypted before persistence
export const SENSITIVE_FIELDS = [
  'cnp_raw', 'id_series', 'id_number',
  'passport_number', 'legal_address_full',
  'signature_hash',
];

// ── File upload ───────────────────────────────────────────────────────────────
export const ALLOWED_MIME_TYPES = new Set([
  'image/png', 'image/jpeg', 'image/jpg', 'application/pdf',
]);
export const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'pdf']);
export const BLOCKED_EXTENSIONS  = new Set([
  'exe', 'js', 'mjs', 'cjs', 'sh', 'bat', 'cmd', 'php',
  'svg', 'html', 'htm', 'xml', 'py', 'rb', 'pl', 'ps1',
]);
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

// ── Rate limiting ─────────────────────────────────────────────────────────────
// key → { limit, windowMs }
export const RATE_LIMITS = {
  auth:             { limit: 5,  windowMs: 60_000 },          // 5 / minute
  file_upload:      { limit: 10, windowMs: 60 * 60_000 },     // 10 / hour
  ai_generation:    { limit: 30, windowMs: 60 * 60_000 },     // 30 / hour
  document_generate:{ limit: 20, windowMs: 60 * 60_000 },     // 20 / hour
  ocr:              { limit: 10, windowMs: 60 * 60_000 },     // 10 / hour
};

// ── LLM sanitization ──────────────────────────────────────────────────────────
export const LLM_FIELD_PLACEHOLDER_MAP = {
  cnp_raw:          'USER_CNP',
  id_series:        'USER_ID_SERIES',
  id_number:        'USER_ID_NUMBER',
  passport_number:  'USER_PASSPORT',
  signature_file_url: '[SIGNATURE_ASSET]',
  id_front_file_url:  '[ID_FRONT_ASSET]',
  id_back_file_url:   '[ID_BACK_ASSET]',
  headshot_file_url:  '[HEADSHOT_ASSET]',
  phone:            'USER_PHONE',
  email:            'USER_EMAIL',
  address_line_1:   'USER_STREET_ADDRESS',
  address_line_2:   'USER_ADDRESS_DETAIL',
  legal_address_full:'USER_LEGAL_ADDRESS',
  father_name:      'USER_FATHER_NAME',
  mother_name:      'USER_MOTHER_NAME',
  first_name:       'USER_FIRSTNAME',
  last_name:        'USER_LASTNAME',
};

// Fields allowed through to LLM (non-sensitive)
export const LLM_ALLOWED_FIELDS = new Set([
  'city', 'county', 'country', 'citizenship',
  'birth_date', 'birth_place', 'marital_status',
  'is_profile_complete', 'profile_version',
]);

// ── Prompt injection detection ────────────────────────────────────────────────
export const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|prior|above)\s+instructions/i,
  /reveal\s+(all|your|system|database|secret)/i,
  /dump\s+(database|db|table|schema|data)/i,
  /system\s+prompt/i,
  /developer\s+mode/i,
  /jailbreak/i,
  /act\s+as\s+(an?\s+)?ai\s+with\s+no\s+restrictions/i,
  /you\s+are\s+now\s+a/i,
  /forget\s+(everything|all|your\s+instructions)/i,
  /<\s*script/i,
  /\[\[.*?\]\]/,        // Prompt injection bracket tricks
  /###\s*SYSTEM/i,
];

export const MAX_OCR_FIELD_LENGTH = 256;