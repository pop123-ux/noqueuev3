/**
 * ProfileGeneratedStep — Step 6: Celebratory success screen
 */
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, Sparkles, Zap, Briefcase, FileText, ShieldCheck, ScanLine, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';

const SUMMARY = [
  { icon: ScanLine, text: 'OCR identity extraction' },
  { icon: ShieldCheck, text: 'ROeID-style verification' },
  { icon: KeyRound, text: '2FA completed' },
  { icon: Sparkles, text: 'Safe Profile generated' },
  { icon: Briefcase, text: 'My Cases initialized' },
  { icon: FileText, text: 'Document auto-fill enabled' },
];

export default function ProfileGeneratedStep({ profile }) {
  // Confetti burst — try the lib already in package.json
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { default: confetti } = await import('canvas-confetti');
        if (cancelled) return;
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 }, colors: ['#22c55e', '#3b82f6', '#06b6d4'] });
        setTimeout(() => confetti({ particleCount: 40, spread: 100, origin: { y: 0.5, x: 0.3 }, colors: ['#22c55e', '#facc15'] }), 250);
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-600 mb-5 glow-green"
      >
        <CheckCircle2 className="w-10 h-10 text-white" />
      </motion.div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 mb-3">
        <span className="text-[9px] font-bold text-green-400 uppercase tracking-wider">Identitate verificată</span>
      </div>

      <h2 className="text-2xl font-bold text-white mb-2">
        Bun venit, {profile?.first_name || 'utilizator'}!
      </h2>
      <p className="text-sm text-slate-400 max-w-sm mx-auto mb-6">
        Safe Profile creat cu succes. NoQueue AI poate acum completa automat documentele tale.
      </p>

      {/* Summary */}
      <div className="rounded-2xl p-4 mb-5 text-left"
        style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {SUMMARY.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
              <Icon className="w-3 h-3 text-slate-500 shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Profile snapshot */}
      {profile && (
        <div className="rounded-2xl p-4 mb-5 text-left"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.10), rgba(6,182,212,0.06))', border: '1px solid rgba(37,99,235,0.25)' }}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-primary mb-2">Safe Profile</p>
          <p className="text-base font-bold text-white">{profile.full_name}</p>
          {profile.cnp_masked && <p className="text-xs text-slate-400 font-mono mt-0.5">CNP: {profile.cnp_masked}</p>}
          {profile.address && <p className="text-xs text-slate-400 mt-1 truncate">{profile.address}</p>}
        </div>
      )}

      {/* CTAs */}
      <div className="space-y-2">
        <Link to="/">
          <Button className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 font-semibold">
            <Zap className="w-4 h-4 mr-2" />
            Deschide NoQueue AI
          </Button>
        </Link>
        <div className="grid grid-cols-2 gap-2">
          <Link to="/cases">
            <Button variant="outline" className="w-full h-10 rounded-2xl border-white/15 text-slate-300">
              <Briefcase className="w-3.5 h-3.5 mr-1.5" /> My Cases
            </Button>
          </Link>
          <Link to="/start?workflow=passport-renewal">
            <Button variant="outline" className="w-full h-10 rounded-2xl border-white/15 text-slate-300">
              <FileText className="w-3.5 h-3.5 mr-1.5" /> Pașaport
            </Button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}