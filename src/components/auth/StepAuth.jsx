/**
 * StepAuth — Step 1 (Email) + Step 2 (OTP verification)
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Loader2, ArrowRight, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { checkRateLimit } from '@/lib/security/rateLimiter';

export default function StepAuth({ user, onComplete, startAtOTP = false }) {
  // If platform already handled auth, we can skip to OTP or skip both steps entirely
  const [subStep, setSubStep] = useState(startAtOTP ? 1 : 0); // 0=email, 1=otp
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef([]);
  const cooldownRef = useRef(null);

  useEffect(() => () => clearInterval(cooldownRef.current), []);

  const startCooldown = () => {
    setCooldown(30);
    cooldownRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    const rl = checkRateLimit('auth', email || 'anon');
    if (!rl.allowed) { setError(rl.message); return; }
    setLoading(true);
    setError('');
    try {
      // base44.auth.sendMagicLink sends a one-time code to the email
      await base44.auth.sendMagicLink(email);
      setSubStep(1);
      startCooldown();
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (e) {
      setError('Nu s-a putut trimite codul. Încearcă din nou.');
    }
    setLoading(false);
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setDigits(['', '', '', '', '', '']);
    await handleSendCode();
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleDigitChange = async (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus();
    if (next.every(d => d !== '') && val) {
      const code = next.join('');
      await verifyCode(code);
    }
  };

  const handleDigitKey = (e, idx) => {
    if (e.key === 'Backspace' && !digits[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  const verifyCode = async (code) => {
    const rl = checkRateLimit('auth', email || 'anon');
    if (!rl.allowed) { setError(rl.message); triggerShake(); return; }
    setLoading(true);
    setError('');
    try {
      // Verify the OTP via base44 auth
      await base44.auth.verifyMagicLink(code);
      onComplete();
    } catch (e) {
      setError('Cod invalid. Încearcă din nou.');
      setDigits(['', '', '', '', '', '']);
      triggerShake();
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
    setLoading(false);
  };

  if (subStep === 0) {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
            <Mail className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Intră în cont</h1>
          <p className="text-slate-400 text-sm">Introduci adresa ta de email pentru a primi un cod de acces.</p>
        </div>

        <div className="space-y-3 mb-6">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendCode()}
            placeholder="adresa@email.ro"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <Button onClick={handleSendCode} disabled={loading || !email} className="w-full h-11 rounded-xl bg-primary">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />}
          Trimite cod de acces
        </Button>
        <p className="text-center text-xs text-slate-600 mt-6">
          <a href="mailto:support@noqueue.ro" className="hover:text-slate-400 transition-colors">Ai nevoie de ajutor?</a>
        </p>
      </div>
    );
  }

  return (
    <motion.div animate={shake ? { x: [0, -10, 10, -8, 8, -4, 0] } : {}} transition={{ duration: 0.5 }}>
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
          <Mail className="w-7 h-7 text-primary" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Verifică-ți emailul</h1>
        <p className="text-slate-400 text-sm">Am trimis un cod de 6 cifre la <span className="text-white font-medium">{email}</span></p>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={el => inputRefs.current[i] = el}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={e => handleDigitChange(e.target.value, i)}
            onKeyDown={e => handleDigitKey(e, i)}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-primary/60 transition-colors"
          />
        ))}
      </div>

      {error && <p className="text-xs text-destructive text-center mb-4">{error}</p>}

      {loading && (
        <div className="flex justify-center mb-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      <button
        onClick={handleResend}
        disabled={cooldown > 0}
        className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-40 mt-2"
      >
        <RotateCcw className="w-3 h-3" />
        {cooldown > 0 ? `Retrimite codul (${cooldown}s)` : 'Retrimite codul'}
      </button>
      <p className="text-center text-xs text-slate-600 mt-4">
        <a href="mailto:support@noqueue.ro" className="hover:text-slate-400 transition-colors">Ai nevoie de ajutor?</a>
      </p>
    </motion.div>
  );
}