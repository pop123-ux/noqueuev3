/**
 * Secure LLM Gateway — the ONLY authorised path to InvokeLLM.
 *
 * Architecture:
 *   Component → secureLLMGateway → sanitizeLLMPayload → InvokeLLM → responseValidator
 *
 * Guarantees:
 *  ✓ No raw PII reaches the LLM
 *  ✓ No raw file URLs / base64 images reach the LLM
 *  ✓ Prompt injection checked before dispatch
 *  ✓ Rate limiting enforced
 *  ✓ All calls audited
 *  ✓ Response validated for unexpected data leakage
 */

import { secureAiClient } from '@/lib/ai/secureAiClient';
import { buildSanitizedPrompt, detectPromptInjection } from './llmSanitizer';
import { checkRateLimit } from './rateLimiter';
import { audit } from './auditLogger';

/**
 * Send a request to the LLM through the secure gateway.
 *
 * @param {object} opts
 * @param {string}  opts.userId       - Authenticated user ID
 * @param {string}  opts.userMessage  - Raw user message (will be injection-checked)
 * @param {object}  [opts.profile]    - User profile (will be sanitized)
 * @param {object}  [opts.context]    - Workflow context (non-sensitive only)
 * @param {object}  [opts.responseSchema] - JSON schema for structured response
 * @param {string}  [opts.model]      - Optional model override
 * @returns {Promise<object|string>}  Validated LLM response
 */
export async function secureLLMGateway({
  userId,
  userMessage,
  profile    = {},
  context    = {},
  responseSchema = null,
  model      = undefined,
}) {
  // 1. Rate limit check
  const rateCheck = checkRateLimit('ai_generation', userId);
  if (!rateCheck.allowed) {
    await audit.rateLimitHit(userId, 'ai_generation');
    throw new Error(rateCheck.message);
  }

  // 2. Injection detection on user message
  const injectionCheck = detectPromptInjection(userMessage || '');
  if (!injectionCheck.safe) {
    await audit.injectionDetected(userId, 'user_message');
    throw new Error('Mesajul conține conținut neautorizat și nu poate fi procesat.');
  }

  // 3. Build sanitized prompt — NO raw PII
  const sanitizedPayload = buildSanitizedPrompt({
    procedure: context?.procedure_key,
    userMessage,
    profile,
    context,
  });

  // 4. Construct the actual prompt string from sanitized structured data
  const prompt = buildPromptString(sanitizedPayload);

  // 5. Dispatch to LLM
  const invocationParams = { prompt };
  if (responseSchema) invocationParams.response_json_schema = responseSchema;
  if (model)          invocationParams.model = model;

  // Defense in depth: even after local sanitization, route through the backend
  // tokenization gateway so the AI provider receives only placeholders for any
  // residual PII (and DB-persisted TokenMap rows are produced for audit).
  const response = await secureAiClient.invoke(invocationParams);

  // 6. Validate response — reject if it contains data that looks like it leaked
  validateLLMResponse(response);

  return response;
}

// ── Internal helpers ──────────────────────────────────────────────────────────

function buildPromptString(sanitizedPayload) {
  return [
    `You are NoQueue AI, a civic assistant specialized in Cluj-Napoca public administration procedures.`,
    ``,
    `User intent: ${sanitizedPayload.user_intent}`,
    `Procedure type: ${sanitizedPayload.procedure_type}`,
    `Location: ${sanitizedPayload.profile_summary?.city || 'Cluj-Napoca'}`,
    ``,
    `Context: ${JSON.stringify(sanitizedPayload.profile_summary, null, 2)}`,
    ``,
    `Provide accurate, helpful guidance. Reference only official Cluj-Napoca institutions.`,
    `Never ask for or repeat personal identity numbers.`,
  ].join('\n');
}

/**
 * Scan LLM response for unexpected PII leakage.
 * Throws if suspicious patterns are found.
 */
function validateLLMResponse(response) {
  const text = typeof response === 'string' ? response : JSON.stringify(response);

  // Check for 13-digit CNP pattern in response
  if (/\b\d{13}\b/.test(text)) {
    throw new Error('[Security] LLM response contained a potential CNP — request blocked.');
  }

  // Check for Romanian ID series pattern
  if (/\b[A-Z]{2}\s?\d{6}\b/.test(text)) {
    throw new Error('[Security] LLM response contained a potential ID number — request blocked.');
  }
}