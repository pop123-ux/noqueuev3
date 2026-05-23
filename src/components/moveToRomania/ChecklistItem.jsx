/**
 * Move to Romania — checklist item card
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, MapPin, Clock, Coins, FileText, Upload, Sparkles, CheckCircle2 } from 'lucide-react';
import { clujInstitutions } from '@/lib/data/clujInstitutions';
import { tr } from '@/lib/moveToRomania/translations';

const STATUS_STYLES = {
  not_started: { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' },
  missing_docs: { color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.25)' },
  ready: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.25)' },
  appointment: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
  completed: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.25)' },
};

export default function ChecklistItem({ item, lang, index, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const institution = item.institutionId
    ? clujInstitutions.find(i => i.id === item.institutionId)
    : (item.institutionFallback ? clujInstitutions.find(i => i.id === item.institutionFallback) : null);
  const style = STATUS_STYLES[item.status] || STATUS_STYLES.not_started;

  const cycleStatus = () => {
    const cycle = ['not_started', 'missing_docs', 'ready', 'appointment', 'completed'];
    const idx = cycle.indexOf(item.status);
    onStatusChange?.(cycle[(idx + 1) % cycle.length]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-start gap-3 p-4 hover:bg-white/[0.02] transition-colors text-left"
      >
        <div className="text-2xl shrink-0 mt-0.5">{item.icon}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-white">{item.title[lang] || item.title.en}</h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize"
              style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
              {tr(item.status, lang)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-500">
            {item.estimatedTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.estimatedTime}</span>}
            {item.cost && <span className="flex items-center gap-1"><Coins className="w-3 h-3" />{item.cost}</span>}
            {institution && <span className="flex items-center gap-1 truncate"><MapPin className="w-3 h-3" />{institution.name}</span>}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
      </button>

      {/* Expanded */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-4 space-y-4">
              {/* Why it matters */}
              <div>
                <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1.5">{tr('why_it_matters', lang)}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{item.why[lang] || item.why.en}</p>
              </div>

              {/* What you need */}
              <div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-2 flex items-center gap-1">
                  <FileText className="w-3 h-3" />{tr('what_you_need', lang)}
                </p>
                <div className="space-y-1">
                  {item.docs.map((doc, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
                      <span className="text-slate-600 mt-1">•</span>
                      <span>{doc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution */}
              {institution && (
                <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />{tr('where_to_go', lang)}
                  </p>
                  <p className="text-xs font-semibold text-white">{institution.name}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{institution.address}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px]">
                    <span className="text-slate-500">⏱ ~{institution.queue.current} min queue</span>
                    <span className="text-slate-500">{institution.hours.weekdays}</span>
                  </div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(institution.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-[11px] text-primary hover:text-primary/80"
                  >
                    <MapPin className="w-3 h-3" />{tr('view_map', lang)}
                  </a>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                {item.requireDocs && (
                  <>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors">
                      <Sparkles className="w-3 h-3" />{tr('autofill', lang)}
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors">
                      <Upload className="w-3 h-3" />{tr('upload', lang)}
                    </button>
                  </>
                )}
                <button
                  onClick={cycleStatus}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold border transition-colors ml-auto"
                  style={{ background: style.bg, color: style.color, borderColor: style.border }}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {tr(item.status, lang)} →
                </button>
              </div>

              <p className="text-[9px] text-slate-600 text-center pt-1">
                ⚖️ Auto-fill uses official templates only — never generates fake documents
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}