/**
 * TwoFactorStep — Google Authenticator (TOTP) setup + verification.
 *
 * Flow:
 *   1) SETUP: show QR code (otpauth://) + manual secret, ask user to add it
 *      to Google Authenticator.
 *   2) VERIFY: user enters the 6-digit TOTP code from the app; we validate
 *      against the secret with a ±30s window.
 *   3) BACKUP: show recovery codes the user must save before continuing.
 *
 * Prototype-only: secret + backup codes live in component state. In production
 * the secret must be generated and stored server-side.
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Smartphone, AlertCircle, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  generateBase32Secret,
  buildOtpAuthUri,
  verifyTotp,
  generateBackupCodes,
} from '@/services/auth/totpService';
import BackupCodesPanel from './BackupCodesPanel';

const LEN = 6;
const PHASE = { SETUP: 'setup', VERIFY: 'verify', BACKUP: 'backup' };

export default function TwoFactorStep({ email, onVerified }) {
  const [phase, setPhase] = useState(PHASE.SETUP);
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const inputs = useRef([]);

  // Generate the TOTP secret + backup codes once per mount.
  const secret = useMemo(() => generateBase32Secret(), []);
  const backupCodes = useMemo(() => generateBackupCodes(8), []);
  const otpUri = useMemo(
    () => buildOtpAuthUri({ secret, accountName: email || 'user', issuer: 'NoQueue AI' }),
    [secret, email]
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(otpUri)}`;

  useEffect(() => {
    if (phase === PHASE.VERIFY) setTimeout(() => inputs.current[0]?.focus(), 100);
  }, [phase]);

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
    setVerifying(true);
    setError('');
    const ok = await verifyTotp(secret, code);
    setVerifying(false);
    if (ok) {
      setPhase(PHASE.BACKUP);
    } else {
      setError('Cod incorect. Verifică ceasul telefonului și încearcă din nou.');
      setDigits(Array(LEN).fill(''));
      setTimeout(() => inputs.current[0]?.focus(), 100);
    }
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

          <div className="flex justify-center mb-5">
            <div className="p-3 rounded-2xl bg-white">
              <img src={qrUrl} alt="QR code Google Authenticator" width={220} height={220} className="block" />
            </div>
          </div>

          <div className="mb-5 px-4 py-3 rounded-2xl"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.20)' }}>
            <p className="text-[10px] uppercase tracking-wider font-bold text-accent mb-1.5">Cheie manuală</p>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-sm font-mono tracking-wider text-white break-all">{formattedSecret}</p>
              <button
                onClick={handleCopySecret}
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

          <div className="mt-5 pt-4 border-t border-white/5 flex items-start gap-2 text-[10px] text-slate-600">
            <Smartphone className="w-3 h-3 text-accent shrink-0 mt-0.5" />
            <span>Compatibil cu Google Authenticator, Microsoft Authenticator, Authy și 1Password. Simulare prototip — nu este sistem oficial.</span>
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
              Deschide <span className="text-white font-semibold">Google Authenticator</span> și introdu codul de 6 cifre afișat pentru NoQueue AI.
            </p>
          </div>

          <div className="flex justify-center gap-2 mb-5" onPaste={handlePaste}>
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
                animate={{ scale: d ? 1.05 : 1 }}
                className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl sm:text-2xl font-bold rounded-2xl bg-white/[0.04] border-2 text-white focus:outline-none transition-all"
                style={{
                  borderColor: error ? '#ef4444' : d ? 'rgb(37,99,235)' : 'rgba(255,255,255,0.10)',
                }}
              />
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-xs text-destructive"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <AlertCircle className="w-3.5 h-3.5" />
              {error}
            </div>
          )}

          {verifying && (
            <div className="flex items-center justify-center gap-2 text-sm text-primary mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verificăm codul...
            </div>
          )}

          <div className="text-center">
            <button
              onClick={() => { setPhase(PHASE.SETUP); setError(''); setDigits(Array(LEN).fill('')); }}
              className="text-xs text-slate-400 hover:text-white transition-colors"
            >
              ← Înapoi la codul QR
            </button>
          </div>
        </motion.div>
      )}

      {phase === PHASE.BACKUP && (
        <BackupCodesPanel codes={backupCodes} onContinue={onVerified} />
      )}
    </AnimatePresence>
  );
}