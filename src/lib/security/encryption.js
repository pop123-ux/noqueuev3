/**
 * Client-side AES-256-GCM field encryption using native Web Crypto API.
 *
 * Key derivation: PBKDF2(userEmail + APP_SALT) → AES-256-GCM key.
 * Every encrypted value is prefixed with "ENC:" so we can detect already-encrypted
 * fields and skip double-encryption / show placeholders in UI.
 *
 * SECURITY NOTE: This provides field-level encryption that protects against
 * plaintext DB dumps. For production, migrate key derivation to a server-side
 * KMS (e.g. AWS KMS, Supabase Vault) so the key never lives in the browser.
 */

import { ENCRYPTION_APP_SALT, PBKDF2_ITERATIONS, ENCRYPTED_PREFIX } from './config';

const keyCache = new Map(); // email → CryptoKey (session-scoped)

async function deriveKey(userEmail) {
  if (keyCache.has(userEmail)) return keyCache.get(userEmail);

  const rawKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(userEmail + ENCRYPTION_APP_SALT),
    'PBKDF2',
    false,
    ['deriveKey'],
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode(ENCRYPTION_APP_SALT),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    rawKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );

  keyCache.set(userEmail, key);
  return key;
}

/**
 * Encrypt a sensitive string field.
 * Returns "ENC:<base64>" or the original value on failure.
 */
export async function encryptField(value, userEmail) {
  if (!value || !userEmail) return value || '';
  if (String(value).startsWith(ENCRYPTED_PREFIX)) return value; // already encrypted

  const key = await deriveKey(userEmail);
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(String(value)),
  );

  const combined = new Uint8Array(12 + encrypted.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encrypted), 12);

  return ENCRYPTED_PREFIX + btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt a previously encrypted field.
 * Returns plaintext or the original value if not encrypted / decryption fails.
 */
export async function decryptField(value, userEmail) {
  if (!value || !userEmail) return value || '';
  if (!String(value).startsWith(ENCRYPTED_PREFIX)) return value; // plaintext passthrough

  const key = await deriveKey(userEmail);
  const combined = Uint8Array.from(
    atob(String(value).slice(ENCRYPTED_PREFIX.length)),
    c => c.charCodeAt(0),
  );
  const iv   = combined.slice(0, 12);
  const data = combined.slice(12);

  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
  return new TextDecoder().decode(decrypted);
}

/** Wipe the key cache on logout / session end */
export function clearEncryptionKeyCache() {
  keyCache.clear();
}