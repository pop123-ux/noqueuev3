/**
 * Client-side in-memory rate limiter using a sliding window.
 *
 * NOTE: This supplements server-side rate limiting — it provides UX feedback
 * and prevents accidental rapid-fire calls. True enforcement must be server-side.
 */

import { RATE_LIMITS } from './config';

// Store: key → array of timestamps
const windows = new Map();

/**
 * Check and record a rate-limited action.
 * @param {string} actionKey  - Key from RATE_LIMITS (e.g. 'file_upload', 'ai_generation')
 * @param {string} userId     - User identifier for isolation
 * @returns {{ allowed: boolean, remaining: number, resetInMs: number }}
 */
export function checkRateLimit(actionKey, userId = 'anonymous') {
  const config = RATE_LIMITS[actionKey];
  if (!config) return { allowed: true, remaining: 999, resetInMs: 0 };

  const storageKey = `${actionKey}:${userId}`;
  const now        = Date.now();
  const windowStart = now - config.windowMs;

  // Retrieve + prune old timestamps
  const timestamps = (windows.get(storageKey) || []).filter(t => t > windowStart);

  if (timestamps.length >= config.limit) {
    const oldest   = timestamps[0];
    const resetInMs = config.windowMs - (now - oldest);
    return {
      allowed: false,
      remaining: 0,
      resetInMs,
      message: buildRateLimitMessage(actionKey, resetInMs),
    };
  }

  timestamps.push(now);
  windows.set(storageKey, timestamps);

  return {
    allowed: true,
    remaining: config.limit - timestamps.length,
    resetInMs: 0,
  };
}

function buildRateLimitMessage(actionKey, resetInMs) {
  const seconds = Math.ceil(resetInMs / 1000);
  const minutes = Math.ceil(seconds / 60);

  const labels = {
    auth:              `Prea multe încercări de autentificare. Încearcă din nou în ${seconds}s.`,
    file_upload:       `Limita de încărcări a fost atinsă. Resetare în ${minutes} minute.`,
    ai_generation:     `Limita de generări AI a fost atinsă. Resetare în ${minutes} minute.`,
    document_generate: `Prea multe documente generate. Resetare în ${minutes} minute.`,
    ocr:               `Limita de procesare OCR atinsă. Resetare în ${minutes} minute.`,
  };

  return labels[actionKey] || `Limita de utilizare atinsă. Resetare în ${minutes} minute.`;
}

/** Reset a specific user's window for an action (e.g. on logout) */
export function resetRateLimit(actionKey, userId) {
  windows.delete(`${actionKey}:${userId}`);
}

/** Reset all windows (on logout) */
export function resetAllRateLimits(userId) {
  for (const key of Object.keys(RATE_LIMITS)) {
    windows.delete(`${key}:${userId}`);
  }
}