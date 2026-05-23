/**
 * Move to Romania — visual progress card with stats
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, FileCheck, Building2, Clock } from 'lucide-react';
import { tr } from '@/lib/moveToRomania/translations';

function Ring({ percent, size = 100, stroke = 8 }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <motion.circle
        cx={size/2} cy={size/2} r={radius} fill="none"
        stroke="url(#progressGrad)" strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
      <defs>
        <linearGradient id="progressGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function ProgressCard({ progress, lang }) {
  const { percent, completed, total, ready, remaining, timeSaved } = progress;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-3xl p-5 sm:p-6 glow-blue"
    >
      <div className="flex items-center gap-5">
        {/* Ring */}
        <div className="relative shrink-0">
          <Ring percent={percent} size={110} stroke={9} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-black text-white leading-none">{percent}%</span>
            <span className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{completed}/{total}</span>
          </div>
        </div>
        {/* Stats */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-1.5">
            <Trophy className="w-3 h-3" />{tr('progress_label', lang)}
          </p>
          <h3 className="text-lg font-bold text-white mb-3">
            {percent === 100 ? '🎉 Complete!' : `${remaining} step${remaining !== 1 ? 's' : ''} to go`}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            <Stat icon={FileCheck} value={ready} label={tr('docs_ready', lang)} color="#22c55e" />
            <Stat icon={Building2} value={remaining} label={tr('institutions_left', lang)} color="#facc15" />
            <Stat icon={Clock} value={timeSaved} label={tr('time_saved', lang)} color="#06b6d4" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ icon: Icon, value, label, color }) {
  return (
    <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <Icon className="w-3 h-3 mx-auto mb-1" style={{ color }} />
      <div className="text-sm font-bold text-white truncate">{value}</div>
      <div className="text-[9px] text-slate-500 leading-tight">{label}</div>
    </div>
  );
}