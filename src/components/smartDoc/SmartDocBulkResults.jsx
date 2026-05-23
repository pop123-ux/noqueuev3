/**
 * SmartDocBulkResults — Overview of bulk analysis results with drill-down
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle2, AlertCircle, ChevronRight, RotateCcw, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SmartDocReport from './SmartDocReport';

const VALIDITY_META = {
  valid: { color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.25)', text: 'Valid', icon: CheckCircle2 },
  expiring_soon: { color: '#facc15', bg: 'rgba(250,204,21,0.10)', border: 'rgba(250,204,21,0.25)', text: 'Expiră curând', icon: Clock },
  expired: { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.25)', text: 'Expirat', icon: AlertTriangle },
  unknown: { color: '#64748b', bg: 'rgba(100,116,139,0.10)', border: 'rgba(100,116,139,0.25)', text: 'Necunoscut', icon: AlertCircle },
};

export default function SmartDocBulkResults({ items, onReset }) {
  const [activeIndex, setActiveIndex] = useState(null);

  // Summary counts
  const successItems = items.filter(i => i.status === 'done' && i.report);
  const errorItems = items.filter(i => i.status === 'error');
  const counts = {
    total: items.length,
    expired: successItems.filter(i => i.report.analysis.validity_status === 'expired').length,
    expiring: successItems.filter(i => i.report.analysis.validity_status === 'expiring_soon').length,
    valid: successItems.filter(i => i.report.analysis.validity_status === 'valid').length,
    errors: errorItems.length,
  };

  // Drill-down view
  if (activeIndex !== null && items[activeIndex]?.report) {
    return (
      <div>
        <button
          onClick={() => setActiveIndex(null)}
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4 transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Înapoi la toate documentele
        </button>
        <SmartDocReport report={items[activeIndex].report} onReset={onReset} />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent mb-3 glow-blue">
          <CheckCircle2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">Analiză completă</h2>
        <p className="text-sm text-slate-400">
          {counts.total} documente analizate · apasă pe oricare pentru raport detaliat
        </p>
      </div>

      {/* Summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
        {[
          { label: 'Total', value: counts.total, color: '#cbd5e1' },
          { label: 'Valide', value: counts.valid, color: '#22c55e' },
          { label: 'Atenție', value: counts.expiring, color: '#facc15' },
          { label: 'Expirate', value: counts.expired + counts.errors, color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-3 py-2.5 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Document list */}
      <div className="space-y-2 mb-5">
        {items.map((item, idx) => {
          const isError = item.status === 'error';
          const validity = item.report?.analysis?.validity_status || 'unknown';
          const meta = isError ? VALIDITY_META.unknown : VALIDITY_META[validity];
          const Icon = meta.icon;
          const docKind = item.report?.analysis?.document_kind_ro;
          const summary = item.report?.analysis?.one_line_summary;
          const issuesCount = item.report?.analysis?.issues?.length || 0;

          return (
            <motion.button
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              onClick={() => !isError && setActiveIndex(idx)}
              disabled={isError}
              className={`group w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all ${
                isError ? 'opacity-60 cursor-default' : 'hover:scale-[1.005] cursor-pointer'
              }`}
              style={{ background: meta.bg, border: `1px solid ${meta.border}` }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `${meta.color}15` }}>
                <FileText className="w-5 h-5" style={{ color: meta.color }} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-white truncate">
                    {docKind || item.file.name}
                  </p>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                    style={{ background: `${meta.color}25`, color: meta.color }}>
                    {meta.text}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {isError ? item.error : (summary || item.file.name)}
                </p>
                {!isError && issuesCount > 0 && (
                  <p className="text-[10px] text-warning mt-0.5">
                    ⚠ {issuesCount} {issuesCount === 1 ? 'problemă identificată' : 'probleme identificate'}
                  </p>
                )}
              </div>

              {!isError && (
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 transition-colors" />
              )}
              {isError && <Icon className="w-4 h-4 shrink-0" style={{ color: meta.color }} />}
            </motion.button>
          );
        })}
      </div>

      {/* Reset */}
      <Button onClick={onReset} variant="outline" className="w-full h-11 rounded-2xl border-white/15 text-slate-300">
        <RotateCcw className="w-4 h-4 mr-2" />
        Analizează alte documente
      </Button>
    </motion.div>
  );
}