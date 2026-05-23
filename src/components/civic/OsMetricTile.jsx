/**
 * OsMetricTile — single animated KPI tile for the NoQueue OS dashboard.
 */
import React from 'react';
import { motion } from 'framer-motion';
import AnimatedCounter from './AnimatedCounter';

export default function OsMetricTile({ icon: Icon, label, value, suffix = '', accent = 'primary', hint }) {
  const accentMap = {
    primary: 'text-primary bg-primary/10 border-primary/30',
    accent:  'text-accent bg-accent/10 border-accent/30',
    success: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    warning: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-2xl p-4 bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all"
    >
      <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-3 ${accentMap[accent]}`}>
        {Icon && <Icon className="w-4 h-4" />}
      </div>
      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">{label}</p>
      <p className="text-2xl font-black text-white mt-0.5">
        <AnimatedCounter value={value} suffix={suffix} />
      </p>
      {hint && <p className="text-[10px] text-slate-500 mt-1 leading-snug">{hint}</p>}
    </motion.div>
  );
}