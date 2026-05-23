/**
 * TwoFactorStep — Step 5: Premium 6-digit OTP input with paste support
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, RefreshCw, Mail, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { sendTwoFactorCode, verifyTwoFactorCode } from '@/services/auth/twoFactorService';

const LEN = 6;

export default function TwoFactorStep({ email, onVerified }) {
  const [digits, setDigits] = useState(Array(LEN).fill(''));
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState(null);
  const [sent, setSent] = useState(false);
  const inputs = useRef([]);

  // Auto-send on mount
  useEffect(() => { handleSend(); /* eslint-disable-next-line */ }, []);

  const handleSend = async () => {
    setSending(true);
    setError('');
    setDigits(Array(LEN).fill(''));
    const res = await sendTwoFactorCode({ email });
    setSending(false);
    if (res.success) {
      setSent(true);
      setDemoCode(res.demo_code); // demo mode only
      setTimeout(() => inputs.current[0]?.focus(), 100);
    } else {
      setError('Eroare la trimiterea codului.');
    }
  };

  const updateDigit = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    setError('');
    if (v && i < LEN - 1) inputs.current[i + 1]?.focus();
    if (next.every(d => d) && !verifying) {
      handleVerify(next.join(''));
    }
  };

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
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
    const res = await verifyTwoFactorCode({ code });
    setVerifying(false);
    if (res.success) {
      onVerified();
    } else {
      setError(res.error);
      setDigits(Array(LEN).fill(''));
      setTimeout(() => inputs.current[0]?.focus(), 100);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 mb-4 glow-green">
          <ShieldCheck className="w-8 h-8 text-white" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-3">
          <span className="text-[9px] font-bold text-accent uppercase tracking-wider">ROeID-style 2FA</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Confirmare în 2 pași</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Am trimis un cod de 6 cifre la <span className="text-white font-semibold">{email}</span>
        </p>
      </div>

      {/* Demo code banner */}
      {demoCode && (
        <div className="mb-5 px-4 py-3 rounded-2xl text-center"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.25)' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold text-accent mb-1">🧪 Cod demo (simulare hackathon)</p>
          <p className="text-2xl font-bold font-mono tracking-[0.4em] text-white">{demoCode}</p>
          <p className="text-[10px] text-slate-500 mt-1">În producție, codul ar fi livrat doar pe email</p>
        </div>
      )}

      {/* OTP boxes */}
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
            disabled={verifying || sending}
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
          onClick={handleSend}
          disabled={sending || verifying}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white disabled:opacity-40 transition-colors"
        >
          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          {sending ? 'Se trimite...' : sent ? 'Retrimite codul' : 'Trimite codul'}
        </button>
      </div>

      <div className="mt-5 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-slate-600">
        <Mail className="w-3 h-3 text-accent shrink-0" />
        <span>Simulare 2FA pentru demo MVP — nu este sistem oficial de autentificare guvernamentală.</span>
      </div>
    </motion.div>
  );
}