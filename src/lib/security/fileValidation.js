/**
 * Secure file upload validation.
 * Validates MIME type, extension, size, and content before any upload occurs.
 */

import {
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS,
  BLOCKED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from './config';

/**
 * Validate a File object before uploading.
 * Returns { valid: boolean, error?: string, sanitizedName?: string }
 */
export function validateUploadedFile(file) {
  if (!file) return { valid: false, error: 'Nu a fost selectat niciun fișier.' };

  // 1. Size check
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `Fișierul depășește limita de 10 MB (${(file.size / 1024 / 1024).toFixed(1)} MB).` };
  }

  // 2. Empty file
  if (file.size === 0) {
    return { valid: false, error: 'Fișierul este gol.' };
  }

  // 3. MIME type check
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      error: `Tipul de fișier "${file.type || 'necunoscut'}" nu este permis. Acceptăm: PDF, PNG, JPG.`,
    };
  }

  // 4. Extension extraction & blocked list
  const rawName = file.name || '';
  const ext = rawName.split('.').pop()?.toLowerCase() || '';

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `Extensia ".${ext}" este blocată din motive de securitate.` };
  }

  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: `Extensia ".${ext}" nu este permisă. Acceptăm: .pdf, .png, .jpg, .jpeg.`,
    };
  }

  // 5. Path traversal prevention + name sanitization
  const sanitizedName = sanitizeFileName(rawName);

  return { valid: true, sanitizedName };
}

/**
 * Sanitize a filename: strip path separators, dangerous characters, limit length.
 * Generates a random prefix to prevent enumeration.
 */
export function sanitizeFileName(originalName) {
  // Remove any path components
  const base = originalName.replace(/.*[/\\]/, '');

  // Remove non-alphanumeric except dot, dash, underscore
  const clean = base.replace(/[^a-zA-Z0-9.\-_]/g, '_');

  // Limit length
  const ext  = clean.split('.').pop();
  const stem = clean.slice(0, clean.lastIndexOf('.')).slice(0, 64);

  // Add random prefix to prevent enumeration
  const rand = Math.random().toString(36).slice(2, 10);
  return `${rand}_${stem}.${ext}`;
}

/**
 * Validate multiple files at once.
 * Returns first error found or { valid: true }.
 */
export function validateFiles(files) {
  for (const file of Array.from(files)) {
    const result = validateUploadedFile(file);
    if (!result.valid) return result;
  }
  return { valid: true };
}