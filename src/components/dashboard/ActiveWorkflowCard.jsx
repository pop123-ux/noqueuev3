import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function ActiveWorkflowCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-xl p-4"
      style={{
        background: 'rgba(37,99,235,0.06)',
        border: '1px solid rgba(37,99,235,0.18)',
        boxShadow: '0 0 24px rgba(37,99,235,0.08)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {/* Live pulse */}
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Activ</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-white/[0.04] border border-white/[0.08] rounded-full px-2 py-0.5">
          Pasul 2/4
        </span>
      </div>

      {/* Title */}
      <div className="mb-1">
        <span className="text-base font-bold text-white leading-snug">⚠️ Pașaport Pierdut</span>
      </div>

      {/* Subtitle */}
      <p className="text-xs text-slate-400 leading-relaxed mb-4">
        Generare automată cerere nouă &amp; analiză biometrie selfie.
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            transition={{ duration: 0.7, delay: 0.3, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-slate-600">Progres</span>
          <span className="text-[10px] text-primary font-semibold">50%</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to="/demo/passport"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
      >
        Continuă Fluxul Pașaport
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}