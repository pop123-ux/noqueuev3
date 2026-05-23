/**
 * PredictionCard — single proactive prediction tile
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileWarning, UserPlus, Home, Calendar, AlertCircle } from 'lucide-react';
import { SEVERITY } from '@/services/anticipatory/lifeEventPredictor';

const ICONS = { FileWarning, UserPlus, Home, Calendar, AlertCircle };

const SEV_STYLES = {
  [SEVERITY.CRITICAL]: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)', label: 'URGENT' },
  [SEVERITY.WARNING]: { color: '#facc15', bg: 'rgba(250,204,21,0.10)', border: 'rgba(250,204,21,0.30)', label: 'Atenție' },
  [SEVERITY.INFO]: { color: '#06b6d4', bg: 'rgba(6,182,212,0.10)', border: 'rgba(6,182,212,0.25)', label: 'Info' },
  [SEVERITY.OPPORTUNITY]: { color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)', label: 'Oportunitate' },
};

export default function PredictionCard({ prediction, index = 0 }) {
  const style = SEV_STYLES[prediction.severity] || SEV_STYLES[SEVERITY.INFO];
  const Icon = ICONS[prediction.icon] || AlertCircle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl p-4 backdrop-blur"
      style={{ background: style.bg, border: `1px solid ${style.border}` }}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${style.color}20` }}>
          <Icon className="w-5 h-5" style={{ color: style.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ background: `${style.color}25`, color: style.color }}>
              {style.label}
            </span>
            <span className="text-[10px] text-slate-500">{prediction.urgency_label}</span>
          </div>
          <p className="text-sm font-semibold text-white mb-1">{prediction.title}</p>
          <p className="text-xs text-slate-400 leading-relaxed mb-3">{prediction.description}</p>
          <Link to={prediction.action_route}
            className="inline-flex items-center gap-1 text-xs font-semibold transition-colors"
            style={{ color: style.color }}>
            {prediction.action_label} <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}