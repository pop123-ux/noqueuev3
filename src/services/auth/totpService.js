/**
 * totpService.js — RFC 6238 TOTP (Google Authenticator compatible)
 *
 * Prototype-only: secret is generated client-side and kept in component state.
 * In production, the secret must be generated and stored server-side.
 */

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

/** Generate a random Base32 secret (default 20 bytes → 32 chars, recommended for TOTP). */
export function generateBase32Secret(byteLength = 20) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  let bits = '';
  for (const b of bytes) bits += b.toString(2).padStart(8, '0');
  let out = '';
  for (let i = 0; i < bits.length; i += 5) {
    const chunk = bits.slice(i, i + 5).padEnd(5, '0');
    out += BASE32_ALPHABET[parseInt(chunk, 2)];
  }
  return out;
}

/** Decode a Base32 string into a Uint8Array. */
function base32ToBytes(b32) {
  const clean = b32.replace(/=+$/, '').toUpperCase().replace(/\s+/g, '');
  let bits = '';
  for (const c of clean) {
    const idx = BASE32_ALPHABET.indexOf(c);
    if (idx === -1) throw new Error('Invalid Base32 char: ' + c);
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

/**
 * Build the otpauth:// URI consumed by Google Authenticator.
 * Issuer is kept without spaces ("NoQueue") for maximum compatibility — some
 * authenticator apps mis-handle whitespace in the label/issuer pair.
 */
export function buildOtpAuthUri({ secret, accountName = 'user', issuer = 'NoQueue' }) {
  const cleanSecret = String(secret).replace(/\s+/g, '').toUpperCase();
  const cleanIssuer = (issuer || 'NoQueue').replace(/\s+/g, '');
  const label = `${cleanIssuer}:${accountName}`;
  const params = new URLSearchParams({
    secret: cleanSecret,
    issuer: cleanIssuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${encodeURIComponent(label)}?${params.toString()}`;
}

/** Compute the 6-digit TOTP for a given secret + timestamp (ms). */
export async function generateTotp(secret, timestampMs = Date.now(), period = 30, digits = 6) {
  // RFC 6238: counter is a 64-bit big-endian integer. We build it byte-by-byte
  // to avoid float/Uint32 precision issues for the high word.
  let counter = Math.floor(timestampMs / 1000 / period);
  const counterBytes = new Uint8Array(8);
  for (let i = 7; i >= 0; i--) {
    counterBytes[i] = counter & 0xff;
    counter = Math.floor(counter / 256);
  }

  const keyBytes = base32ToBytes(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const hmac = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, counterBytes.buffer));
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  return String(code % 10 ** digits).padStart(digits, '0');
}

/**
 * Verify a user-entered code with a ±3 step window (≈±90s tolerance).
 * Wide window used only for prototype/demo reliability; production should use ±1.
 * Clock drift between the user's phone and laptop is by far the most common
 * cause of "correct code rejected" in the wild.
 */
export async function verifyTotp(secret, code, timestampMs = Date.now()) {
  const clean = String(code).replace(/\D/g, '');
  if (clean.length !== 6) return false;
  for (const offset of [-3, -2, -1, 0, 1, 2, 3]) {
    const expected = await generateTotp(secret, timestampMs + offset * 30_000);
    if (expected === clean) {
      // eslint-disable-next-line no-console
      console.debug('[TOTP] verified', { offsetSteps: offset });
      return true;
    }
  }
  // eslint-disable-next-line no-console
  console.debug('[TOTP] code did not match any step in window', { entered: clean });
  return false;
}

/**
 * Self-test against well-known RFC 6238 / Google Authenticator test vectors.
 * Runs in dev only via console.debug — does NOT throw. Use to confirm the
 * TOTP math is correct independent of the user's device clock.
 *
 * Vector: secret "JBSWY3DPEHPK3PXP" at unix time 1234567890s → "005924".
 */
export async function runTotpSelfTest() {
  const vectors = [
    { secret: 'JBSWY3DPEHPK3PXP', timeSec: 1234567890, expected: '005924' },
    { secret: 'JBSWY3DPEHPK3PXP', timeSec: 59,          expected: '287082' },
  ];
  const results = [];
  for (const v of vectors) {
    const got = await generateTotp(v.secret, v.timeSec * 1000);
    results.push({ ...v, got, pass: got === v.expected });
  }
  // eslint-disable-next-line no-console
  console.debug('[TOTP self-test]', results);
  return results.every(r => r.pass);
}

/** Generate N human-friendly backup codes (e.g. "A1B2-C3D4"). */
export function generateBackupCodes(count = 8) {
  const codes = [];
  const bytes = new Uint8Array(count * 4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0').toUpperCase()).join('');
  for (let i = 0; i < count; i++) {
    const chunk = hex.slice(i * 8, i * 8 + 8);
    codes.push(`${chunk.slice(0, 4)}-${chunk.slice(4)}`);
  }
  return codes;
}