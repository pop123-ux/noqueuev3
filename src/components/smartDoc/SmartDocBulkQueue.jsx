/**
 * SmartDocBulkQueue — Per-file status panel during bulk analysis
 */
import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

const STATUS_STYLES = {
  pending: { color: '#64748b', label: 'În așteptare', icon: Clock },
  analyzing: { color: '#3b82f6', label: 'Se analizează...', icon: Loader2 },
  done: { color: '#22c55e', label: 'Gata', icon: CheckCircle2 },
  error: { color: '#ef4444', label: 'Eroare', icon: AlertCircle },
};

const VALIDITY_BADGE = {
  valid: { color: '#22c55e', text: 'Valid' },
  expiring_soon: { color: '#facc15', text: 'Expiră curând' },
  expired: { color: '#ef4444', text: 'Expirat' },
  unknown: { color: '#64748b', text: 'Necunoscut' },
};

export default function SmartDocBulkQueue({ items, currentIndex, currentLabel }) {
  const total = items.length;
  const done = items.filter(i => i.status === 'done' || i.status === 'error').length;
  const overallPct = Math.round((done / total) * 100);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Overall progress */}
      <div className="rounded-2xl p-5 mb-4"
        style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-bold text-white">Analizez {total} documente</p>
            <p className="text-xs text-slate-400 mt-0.5">{done} / {total} terminate · {currentLabel || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{overallPct}%</p>
          </div>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={false}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      </div>

      {/* Per-file list */}
      <div className="space-y-2">
        {items.map((item, idx) => {
          const status = STATUS_STYLES[item.status] || STATUS_STYLES.pending;
          const Icon = status.icon;
          const isActive = idx === currentIndex && item.status === 'analyzing';
          const validity = item.report?.analysis?.validity_status;
          const vBadge = validity ? VALIDITY_BADGE[validity] : null;

          return (
            <motion.div
              key={idx}
              layout
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: isActive ? 'rgba(37,99,235,0.10)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? 'rgba(37,99,235,0.30)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(255,255,255,0.04)' }}>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.file.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px]" style={{ color: status.color }}>{status.label}</span>
                  {vBadge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
                      style={{ background: `${vBadge.color}20`, color: vBadge.color }}>
                      {vBadge.text}
                    </span>
                  )}
                  {item.error && (
                    <span className="text-[10px] text-destructive truncate">{item.error}</span>
                  )}
                </div>
              </div>

              <Icon
                className={`w-4 h-4 shrink-0 ${item.status === 'analyzing' ? 'animate-spin' : ''}`}
                style={{ color: status.color }}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}