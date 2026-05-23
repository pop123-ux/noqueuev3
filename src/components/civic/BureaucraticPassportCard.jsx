/**
 * BureaucraticPassportCard — premium "Digital Bureaucratic Passport".
 *
 * NOT an official ID. This is NoQueue's trust/profile summary layer.
 * Visual: futuristic civic identity card, glassmorphism, holographic accents.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, FileCheck2, Zap, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';

function Metric({ label, value, accent }) {
  return (
    <div>
      <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400/80">{label}</p>
      <p className={`text-base font-bold ${accent || 'text-white'} tabular-nums mt-0.5`}>{value}</p>
    </div>
  );
}

export default function BureaucraticPassportCard({
  fullName = 'Cetățean NoQueue',
  verified = false,
  completionPct = 0,
  trustScore = 0,
  verifiedDocs = 0,
  autofillReady = false,
  activeCases = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* Outer glow */}
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20 blur-2xl opacity-60" />

      <div
        className="relative rounded-3xl overflow-hidden border border-white/10"
        style={{
          background:
            'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(17,28,51,0.95) 50%, rgba(8,15,32,0.95) 100%)',
        }}
      >
        {/* Holographic shimmer */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 20% 0%, rgba(34,211,238,0.3), transparent 40%), radial-gradient(circle at 80% 100%, rgba(59,130,246,0.3), transparent 40%)',
          }}
        />

        {/* Top strip */}
        <div className="relative flex items-center justify-between px-5 pt-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-400">NoQueue</p>
              <p className="text-[10px] font-bold text-white -mt-0.5">Digital Bureaucratic Passport</p>
            </div>
          </div>
          <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${
              verified
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            <ShieldCheck className="w-2.5 h-2.5" />
            {verified ? 'Verified' : 'Pending'}
          </div>
        </div>

        {/* Identity row */}
        <div className="relative px-5 mt-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 border border-white/10 flex items-center justify-center shrink-0">
            <span className="text-lg font-black text-white">
              {fullName
                .split(' ')
                .map(s => s[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || '?'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-white truncate">{fullName}</p>
            <p className="text-[10px] text-slate-400">Reusable civic identity • prototype</p>
          </div>
        </div>

        {/* Trust score bar */}
        <div className="relative px-5 mt-5">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold text-white uppercase tracking-wider">Safe Trust Score</p>
            <p className="text-xs font-bold text-primary tabular-nums">{trustScore}/100</p>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, trustScore)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary via-accent to-emerald-400"
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="relative px-5 mt-5 grid grid-cols-3 gap-3">
          <Metric label="Profile" value={`${completionPct}%`} accent="text-primary" />
          <Metric label="Verified docs" value={verifiedDocs} accent="text-accent" />
          <Metric label="Active cases" value={activeCases} accent="text-white" />
        </div>

        {/* Footer */}
        <div className="relative mt-5 px-5 py-3 border-t border-white/5 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2 text-[10px] text-slate-300">
            {autofillReady ? (
              <>
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>Autofill ready</span>
              </>
            ) : (
              <>
                <FileCheck2 className="w-3 h-3 text-amber-400" />
                <span>Autofill incomplete</span>
              </>
            )}
          </div>
          <Link
            to="/os"
            className="inline-flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary/80"
          >
            <Layers className="w-3 h-3" /> Open NoQueue OS
          </Link>
        </div>

        {/* Prototype watermark */}
        <p className="relative px-5 pb-3 pt-1 text-[8px] text-slate-600 text-center tracking-wider">
          🧪 SIMULATION • NOT AN OFFICIAL GOVERNMENT DOCUMENT
        </p>
      </div>
    </motion.div>
  );
}