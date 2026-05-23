/**
 * TwoFactorStep — Google Authenticator (TOTP) setup + verification.
 *
 * Flow:
 *   1) SETUP: show QR code (otpauth://) + manual secret, ask user to add it
 *      to Google Authenticator.
 *   2) VERIFY: user enters the 6-digit TOTP code from the app; we validate
 *      against the secret with a ±3 step window (prototype tolerance).
 *   3) BACKUP: show recovery codes the user must save before continuing.
 *
 * Prototype-only: secret is generated client-side and persisted in
 * sessionStorage keyed by email, so remounts / hot-reloads / back-forward
 * navigation do NOT silently regenerate the secret (which would invalidate
 * the QR the user already scanned).
 *
 * In production, the secret must be generated and stored server-side.
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, Smartphone, AlertCircle, Loader2, Copy, CheckCircle2,
  RefreshCw, Zap, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  generateBase32Secret,
  buildOtpAuthUri,
  verifyTotp,
  generateBackupCodes,
  generateTotp,
  runTotpSelfTest,
} from '@/services/auth/totpService';
import BackupCodesPanel from './BackupCodesPanel';

const LEN = 6;
const PHASE = { SETUP: 'setup', VERIFY: 'verify', BACKUP: 'backup' };
const IS_DEV = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;

const storageKeyFor = (email) => `noqueue_totp_setup_secret:${email || 'anonymous'}`;

function loadOrCreateSecret(email) {
  try {
    const key = storageKeyFor(email);
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const fresh = generateBase32Secret();
    sessionStorage.setItem(key, fresh);
    return fresh;
  } catch {
    // sessionStorage can throw in private mode — fall back to in-memory.
    return generateBase32Secret();
  }
}

export default function TwoFactorStep({ email, onVerified }) {
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [demoCode, setDemoCode] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(30 - Math.floor(Date.now() / 1000) % 30);
  const inputs = useRef([]);

  // Stable secret + backup codes. The secret survives remounts via sessionStorage.
  const [secret, setSecret] = useState(() => loadOrCreateSecret(email));
  const [backupCodes] = useState(() => generateBackupCodes(8));

  const otpUri = buildOtpAuthUri({ secret, accountName: email || 'user', issuer: 'NoQueue' });
  // Cache-bust the QR by the first chars of the secret so resets fetch fresh.
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(otpUri)}&t=${secret.slice(0, 6)}`;

  // Focus first input + run diagnostics when entering verify phase.
  useEffect(() => {
    if (phase !== PHASE.VERIFY) return;
    setTimeout(() => inputs.current[0]?.focus(), 100);
    if (IS_DEV) {
      (async () => {
        const selfTestOk = await runTotpSelfTest();
        const expectedNow = await generateTotp(secret);
        // eslint-disable-next-line no-console
        console.debug('[TOTP] verify phase diagnostics', {
          selfTestOk,
          expectedNow,
          secondsLeft,
          hint: 'If your Authenticator shows a different value, your phone or laptop clock is out of sync.',
        });
      })();
    }
  }, [phase, secret]); // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer for current TOTP window.
  useEffect(() => {
    const tick = () => setSecondsLeft(30 - Math.floor(Date.now() / 1000) % 30);
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);

  // Refresh visible demo code each window when in DEV mode.
  useEffect(() => {
    if (!IS_DEV) return;
    let cancelled = false;
    const refresh = async () => {
      const code = await generateTotp(secret);
      if (!cancelled) setDemoCode(code);
    };
    refresh();
    const id = setInterval(refresh, 1000);
    return () => { cancelled = true; clearInterval(id); };
  }, [secret]);

  const handleCopySecret = async () => {
    await navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const updateDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError('');
    if (v && i < LEN - 1) inputs.current[i + 1]?.focus();
    if (next.every(d => d) && !verifying) handleVerify(next.join(''));
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) inputs.current[i - 1]?.focus();
    if (e.key === 'Enter') handleVerify();
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LEN);
    if (!pasted) return;
    const next = Array(LEN).fill('');
    for (let i = 0; i < pasted.length; i++) next[i] = pasted[i];
    setDigits(next);
    if (pasted.length === LEN) handleVerify(pasted);
    else inputs.current[pasted.length]?.focus();
  };

  const handleVerify = async (code) => {
    const finalCode = (code ?? digits.join('')).replace(/\D/g, '');
    if (finalCode.length !== 6) {
      setError('Introdu toate cele 6 cifre.');
      return;
    }
    setVerifying(true);
    setError('');
    const ok = await verifyTotp(secret, finalCode);
    setVerifying(false);
    if (ok) {
      try { sessionStorage.removeItem(storageKeyFor(email)); } catch {}
      setPhase(PHASE.BACKUP);
    } else {
      // Keep digits visible so user can see what they typed.
      setError('Cod incorect sau expirat. Așteaptă următorul cod și încearcă din nou.');
    }
  };

  const resetTotpSetup = () => {
    try { sessionStorage.removeItem(storageKeyFor(email)); } catch {}
    const fresh = loadOrCreateSecret(email);
    setSecret(fresh);
    setDigits(Array(LEN).fill(''));
    setError('');
    setPhase(PHASE.SETUP);
    setNotice('Am generat un cod QR nou. Șterge vechiul cont NoQueue din Google Authenticator și scanează-l pe acesta.');
    setTimeout(() => setNotice(''), 6000);
  };

  const handleDemoBypass = () => {
    // eslint-disable-next-line no-console
    console.debug('[TOTP] identity_2fa_demo_bypass', { details: 'Prototype demo bypass used' });
    try { sessionStorage.removeItem(storageKeyFor(email)); } catch {}
    setPhase(PHASE.BACKUP);
  };

  // Format secret as groups of 4 for easier manual entry.
  const formattedSecret = secret.match(/.{1,4}/g)?.join(' ');

  return (
    <AnimatePresence mode="wait">
      {phase === PHASE.SETUP && (
        <motion.div key="setup" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="text-center mb-5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 glow-green">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-3">
              <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Google Authenticator 2FA</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Activează aplicația 2FA</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Scanează codul QR cu <span className="text-white font-semibold">Google Authenticator</span> sau introdu cheia manual.
            </p>
          </div>

          {notice && (
            <div role="status" className="mb-4 px-3 py-2 rounded-xl text-xs flex items-start gap-2"
              style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.20)', color: '#67e8f9' }}>
              <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span>{notice}</span>
            </div>
          )}

          <div className="flex justify-center mb-5">
            <div className="p-3 rounded-2xl bg-white">
              <img
                src={qrUrl}
                alt="QR code Google Authenticator"
                width={220}
                height={220}
                className="block"
                onError={(e) => { e.currentTarget.style.opacity = '0.3'; }}
              />
            </div>
          </div>

          <div className="mb-5 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.20)' }}>
            <p className="text-[10px] uppercase tracking-wider font-bold text-accent mb-1.5">Cheie manuală</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm font-mono tracking-wider text-white break-all">{formattedSecret}</p>
              <button
                onClick={handleCopySecret}
                aria-label="Copiază cheia manuală"
                className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-[10px] text-white transition-colors"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copiat' : 'Copiază'}
              </button>
            </div>
          </div>

          <Button
            onClick={() => setPhase(PHASE.VERIFY)}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-3"
          >
            Am adăugat contul — continuă
          </Button>

          <div className="mt-3 flex items-center justify-between gap-2">
            <button
              onClick={resetTotpSetup}
              className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Resetează configurarea 2FA
            </button>
            <button
              onClick={handleDemoBypass}
              className="text-[11px] text-warning hover:text-warning/80 inline-flex items-center gap-1 transition-colors"
              title="Pentru jurizare: simulează verificarea 2FA fără aplicația Authenticator."
            >
              <Zap className="w-3 h-3" /> Continuă în modul demo
            </button>
          </div>
          <p className="mt-1 text-[10px] text-slate-600">
            Modul demo este doar pentru prototip — nu confirmă o verificare 2FA reală.
          </p>

          <div className="mt-5 pt-4 border-t border-white/5 flex items-start gap-2 text-[10px] text-slate-600">
            <Smartphone className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <span>
              Compatibil cu Google Authenticator, Microsoft Authenticator, Authy și 1Password.
              Dacă ai scanat un cod QR anterior și nu merge, apasă <strong>Resetează configurarea 2FA</strong>,
              șterge contul NoQueue vechi din Authenticator și scanează noul QR.
            </span>
          </div>
        </motion.div>
      )}

      {phase === PHASE.VERIFY && (
        <motion.div key="verify" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent mb-4 glow-blue">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Introdu codul din aplicație</h2>
            <p className="text-sm text-slate-400 max-w-sm mx-auto">
              Deschide <span className="text-white font-semibold">Google Authenticator</span> și introdu codul de 6 cifre afișat pentru NoQueue.
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Codul se schimbă la fiecare 30 secunde. Introdu codul curent imediat după ce apare.
            </p>
            <p className="text-[11px] text-accent mt-1" aria-live="polite">
              Cod nou în: <span className="font-mono font-semibold">{secondsLeft}s</span>
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
            {digits.map((d, i) => (
              <motion.input
                key={i}
                ref={el => inputs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => updateDigit(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                disabled={verifying}
                aria-label={`Cifra ${i + 1} din codul 2FA`}
                animate={{ scale: d ? 1.05 : 1 }}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl bg-white/[0.04] border-2 text-white focus:outline-none transition-all"
                style={{
                  borderColor: error ? '#ef4444' : d ? 'rgb(37,99,235)' : 'rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </div>

          <Button
            onClick={() => handleVerify()}
            disabled={verifying || digits.some(d => !d)}
            aria-busy={verifying}
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl py-3 mb-3"
          >
            {verifying ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Verificăm codul...</>
            ) : (
              <>Verifică codul</>
            )}
          </Button>

          {error && (
            <div role="alert" aria-live="polite" className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 text-xs text-destructive"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </div>
          )}

          {IS_DEV && demoCode && (
            <div className="mb-3 px-3 py-2 rounded-xl text-[11px] flex items-center justify-between gap-2"
              style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.18)', color: '#fde68a' }}>
              <span>
                <span className="font-semibold">Demo only</span> · Cod demo curent:{' '}
                <span className="font-mono">{demoCode}</span>
              </span>
              <button
                onClick={() => { navigator.clipboard.writeText(demoCode); }}
                className="text-[10px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15 text-white"
              >
                Copiază
              </button>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => { setPhase(PHASE.SETUP); setError(''); setDigits(Array(LEN).fill('')); }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Înapoi la codul QR
            </button>
            <div className="flex items-center gap-3">
              <button
                onClick={resetTotpSetup}
                className="text-[11px] text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Resetează 2FA
              </button>
              <button
                onClick={handleDemoBypass}
                className="text-[11px] text-warning hover:text-warning/80 inline-flex items-center gap-1 transition-colors"
              >
                <Zap className="w-3 h-3" /> Mod demo
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {phase === PHASE.BACKUP && (
        <BackupCodesPanel codes={backupCodes} onContinue={onVerified} />
      )}
    </AnimatePresence>
  );
}