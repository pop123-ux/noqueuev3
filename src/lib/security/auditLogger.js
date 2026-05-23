/**
 * Audit Logger — writes immutable event records to the AuditLog entity.
 *
 * Rules:
 *  - NEVER log sensitive field values (CNP, ID numbers, signatures)
 *  - Only log actions, resource types, and non-sensitive descriptions
 *  - Fire-and-forget (non-blocking) — audit failures must not block user flows
 */

import { base44 } from '@/api/base44Client';

/**
 * Log a security/compliance event.
 *
 * @param {object} opts
 * @param {string} opts.userId        - User email (required)
 * @param {string} opts.action        - Action key (e.g. 'vault_secret_save')
 * @param {string} [opts.resourceType] - Entity type affected
 * @param {string} [opts.resourceId]   - Entity ID affected
 * @param {string} [opts.details]      - Non-sensitive description
 * @param {'info'|'warning'|'critical'} [opts.severity]
 * @param {boolean} [opts.success]
 */
export async function logAuditEvent({
  userId,
  action,
  resourceType = '',
  resourceId   = '',
  details      = '',
  severity     = 'info',
  success      = true,
}) {
  // Validate inputs — never throw, just silently skip
  if (!userId || !action) return;

  // Sanitize details — strip anything that looks like sensitive data
  const safeDetails = redactSensitivePatterns(details);

  const payload = {
    user_id:           userId,
    action,
    resource_type:     resourceType,
    resource_id:       resourceId,
    details:           safeDetails,
    user_agent_short:  navigator?.userAgent?.slice(0, 80) || '',
    severity,
    success,
  };

  // Fire and forget — never await, never block
  base44.entities.AuditLog.create(payload).catch(err => {
    console.warn('[AuditLog] Failed to write audit event:', err?.message);
  });
}

/** Convenience helpers for common events */
export const audit = {
  vaultSave:        (userId, resourceType) =>
    logAuditEvent({ userId, action: 'vault_save', resourceType, details: 'Vault data encrypted and saved' }),

  fileUploaded:     (userId, mimeType) =>
    logAuditEvent({ userId, action: 'file_upload', resourceType: 'UploadedFile', details: `File type: ${mimeType}` }),

  fileRejected:     (userId, reason) =>
    logAuditEvent({ userId, action: 'file_rejected', severity: 'warning', details: reason, success: false }),

  documentGenerated:(userId, docKey) =>
    logAuditEvent({ userId, action: 'document_generate', resourceType: 'GeneratedDocument', resourceId: docKey }),

  injectionDetected:(userId, context) =>
    logAuditEvent({ userId, action: 'injection_attempt', severity: 'critical', success: false, details: `Context: ${context}` }),

  rateLimitHit:     (userId, actionKey) =>
    logAuditEvent({ userId, action: 'rate_limit_hit', severity: 'warning', details: `Action: ${actionKey}`, success: false }),

  vaultDeleted:     (userId) =>
    logAuditEvent({ userId, action: 'vault_delete', severity: 'warning', details: 'User deleted vault data' }),

  dataExported:     (userId) =>
    logAuditEvent({ userId, action: 'data_export', details: 'User exported personal data' }),
};

// ── Internal helpers ──────────────────────────────────────────────────────────

const SENSITIVE_PATTERNS = [
  /\b\d{13}\b/g,                         // 13-digit CNP
  /\b[A-Z]{2}\s?\d{6}\b/g,              // ID series + number
  /\b[A-Z]{2}\d{7}\b/g,                 // Passport number
  /\+?\d[\d\s\-()]{8,14}\d/g,           // Phone numbers
  /[\w.-]+@[\w-]+\.[a-z]{2,}/gi,        // Email addresses
];

function redactSensitivePatterns(text = '') {
  let clean = String(text);
  for (const pattern of SENSITIVE_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED]');
  }
  return clean.slice(0, 512); // hard cap
}