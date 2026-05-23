/**
 * ImmutableTimeline — pseudo-ledger civic history feed.
 * Visual hash chain + timestamps to convey auditability (UI-only, not crypto).
 */
import React from 'react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import {
  ShieldCheck, FileCheck2, Briefcase, Upload, PenTool, MapPin,
  Clock, FileDown, Sparkles, Zap, Hash,
} from 'lucide-react';

const ICONS = {
  identity_verified: ShieldCheck,
  life_event_started: Sparkles,
  life_event_completed: Sparkles,
  case_created: Briefcase,
  case_completed: Briefcase,
  document_uploaded: Upload,
  document_generated: FileCheck2,
  signature_approved: PenTool,
  institution_selected: MapPin,
  queue_estimated: Clock,
  form_exported: FileDown,
  demo_run: Zap,
};

const COLORS = {
  identity_verified: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  signature_approved: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
  demo_run: 'text-amber-300 bg-amber-500/10 border-amber-500/30',
};

export default function ImmutableTimeline({ events = [], emptyHint }) {
  if (!events.length) {
    return (
      <div className="text-center py-10 text-sm text-slate-500">
        <Hash className="w-6 h-6 mx-auto mb-2 text-slate-700" />
        {emptyHint || 'No civic events yet. Start a life event to begin your timeline.'}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical rail */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-white/5 to-transparent" />

      <ol className="space-y-3">
        {events.map((e, i) => {
          const Icon = ICONS[e.event_type] || Sparkles;
          const colorClass =
            COLORS[e.event_type] || 'text-primary bg-primary/10 border-primary/30';
          const ts = e.created_date ? new Date(e.created_date) : null;
          return (
            <motion.li
              key={e.id || i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="relative pl-10"
            >
              {/* Node */}
              <div
                className={`absolute left-0 top-1.5 w-8 h-8 rounded-full border flex items-center justify-center ${colorClass}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Card */}
              <div className="rounded-xl p-3 bg-white/[0.03] border border-white/8">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white leading-tight">{e.title}</p>
                    {e.description && (
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {e.description}
                      </p>
                    )}
                  </div>
                  {ts && (
                    <span
                      className="text-[10px] text-slate-500 shrink-0 tabular-nums"
                      title={format(ts, 'PPpp')}
                    >
                      {formatDistanceToNow(ts, { addSuffix: true })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5 text-[9px] font-mono text-slate-500">
                  <span className="flex items-center gap-1">
                    <Hash className="w-2.5 h-2.5" />
                    {e.action_hash || '----'}
                  </span>
                  {e.prev_hash && (
                    <span className="text-slate-700">← {e.prev_hash.slice(0, 6)}</span>
                  )}
                  {e.source && (
                    <span className="ml-auto uppercase tracking-wider text-slate-600">{e.source}</span>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <p className="text-[9px] text-slate-700 text-center mt-4 tracking-wider">
        🧪 SIMULATED LEDGER • Hash chain shown for UI demonstration only
      </p>
    </div>
  );
}