/**
 * Two-Factor Service — Simulated ROeID-style 2FA
 *
 * MVP/Hackathon Demo:
 * - Generates 6-digit OTP
 * - Stores in sessionStorage (short-lived)
 * - Simulates email delivery
 * - Verifies code with 5-minute expiry
 *
 * NOT a production authentication system — clearly labeled as simulation.
 */

const STORAGE_KEY = 'noqueue_2fa_simulation';
const OTP_TTL_MS = 5 * 60 * 1000;

/** Generate a 6-digit numeric OTP */
function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** Send a simulated OTP. Returns the code so the demo can display it. */
export async function sendTwoFactorCode({ email }) {
  const code = generateOtp();
  const payload = {
    email,
    code,
    issued_at: Date.now(),
    expires_at: Date.now() + OTP_TTL_MS,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

  // Simulated network delay
  await new Promise(r => setTimeout(r, 800));

  return {
    success: true,
    delivered_to: email,
    // In demo mode, return code so user/judges can see it.
    // In production this would NEVER be returned.
    demo_code: code,
    expires_at: payload.expires_at,
  };
}

/** Verify the entered OTP */
export async function verifyTwoFactorCode({ code }) {
  await new Promise(r => setTimeout(r, 500));

  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return { success: false, error: 'Niciun cod activ — solicită unul nou.' };

  const payload = JSON.parse(raw);
  if (Date.now() > payload.expires_at) {
    sessionStorage.removeItem(STORAGE_KEY);
    return { success: false, error: 'Codul a expirat — solicită unul nou.' };
  }
  if (String(code).trim() !== payload.code) {
    return { success: false, error: 'Cod incorect. Verifică și încearcă din nou.' };
  }

  sessionStorage.removeItem(STORAGE_KEY);
  return { success: true, verified_at: new Date().toISOString() };
}

/** Clear pending OTP */
export function clearPendingCode() {
  sessionStorage.removeItem(STORAGE_KEY);
}