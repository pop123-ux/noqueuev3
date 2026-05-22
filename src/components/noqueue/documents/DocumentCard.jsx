import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, ExternalLink, ChevronDown, ChevronUp,
  CheckCircle2, AlertTriangle, Globe, Clock, Building2, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const complexityConfig = {
  low: { label: 'Simple', color: 'text-success', bg: 'bg-success/10', border: 'border-success/20' },
  medium: { label: 'Moderate', color: 'text-warning', bg: 'bg-warning/10', border: 'border-warning/20' },
  high: { label: 'Complex', color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/20' },
};

export default function DocumentCard({ doc, compact = false }) {
  const [expanded, setExpanded] = useState(false);
  const complexity = complexityConfig[doc.complexity] || complexityConfig.low;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-white/[0.04] border border-white/8 overflow-hidden hover:border-white/12 transition-all"
    >
      {/* Header */}
      <div
        className="p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{doc.categoryLabel}</p>
                <h4 className="text-sm font-semibold text-white leading-snug">{doc.titleEn || doc.title}</h4>
                {!compact && (
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                    {doc.description}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1.5">
                <Badge className={`text-[10px] ${complexity.bg} ${complexity.color} ${complexity.border} border`}>
                  {complexity.label}
                </Badge>
                {expanded
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                }
              </div>
            </div>

            {/* Quick info row */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Building2 className="w-3 h-3 text-primary" />
                <span>{doc.institution}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-slate-400">
                <Clock className="w-3 h-3 text-accent" />
                <span>{doc.estimatedTime}</span>
              </div>
              {doc.canDoOnline && (
                <span className="flex items-center gap-1 text-[10px] text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                  <Globe className="w-3 h-3" /> Online
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4 border-t border-white/5 pt-4">

              {/* Description */}
              <p className="text-xs text-slate-300 leading-relaxed">{doc.description}</p>

              {/* Eligibility */}
              {doc.eligibility?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Eligibility</p>
                  <ul className="space-y-1">
                    {doc.eligibility.map((e, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0 mt-0.5" />
                        {e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required attachments */}
              {doc.attachments?.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Required Documents</p>
                  <ul className="space-y-1">
                    {doc.attachments.map((a, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                        <span className="text-primary text-[10px] mt-0.5 font-bold shrink-0">{i + 1}.</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Who signs / where */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <p className="text-[10px] font-semibold text-slate-400 mb-1">Who Signs</p>
                  <p className="text-xs text-slate-300">{doc.whoSigns}</p>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3">
                  <p className="text-[10px] font-semibold text-slate-400 mb-1">Where to Submit</p>
                  <p className="text-xs text-slate-300">{doc.whereSubmit}</p>
                </div>
              </div>

              {/* Common mistakes */}
              {doc.commonMistakes?.length > 0 && (
                <div className="rounded-xl bg-warning/6 border border-warning/15 p-3">
                  <p className="text-[10px] font-semibold text-warning mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Common Mistakes
                  </p>
                  <ul className="space-y-1">
                    {doc.commonMistakes.map((m, i) => (
                      <li key={i} className="text-xs text-slate-300">• {m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Legal basis */}
              {doc.legalBasis && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Info className="w-3 h-3" />
                  <span>Legal basis: {doc.legalBasis}</span>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                {doc.templateUrl ? (
                  <a
                    href={doc.templateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Template
                  </a>
                ) : (
                  <div className="flex-1 py-2.5 rounded-xl bg-white/[0.03] border border-white/8 text-center text-xs text-slate-500">
                    {doc.templateNote || 'Template available at institution'}
                  </div>
                )}
                {doc.canDoOnline && doc.onlineUrl && (
                  <a
                    href={doc.onlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-success/10 text-success text-xs font-semibold hover:bg-success/20 transition-colors border border-success/20"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Online
                  </a>
                )}
              </div>

              <p className="text-[9px] text-slate-600 text-center">
                Source: {doc.sourceLabel} · Verify at official institution before submitting.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}