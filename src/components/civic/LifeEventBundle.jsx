/**
 * LifeEventBundle — generated "bureaucracy package" preview for a selected event.
 * Shows the cases / institutions / documents / next actions the user gets in one click.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, MapPin, FileText, Sparkles, ArrowRight, Clock } from 'lucide-react';
import workflows from '@/lib/data/workflows';
import { Button } from '@/components/ui/button';

function Section({ icon: Icon, title, children }) {
  return (
    <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/8">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <p className="text-[11px] font-bold text-white uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  );
}

export default function LifeEventBundle({ event, onLaunch, launching }) {
  if (!event) return null;
  const wfs = (event.workflowIds || [])
    .map(id => workflows.find(w => w.id === id))
    .filter(Boolean);

  const allInstitutions = [...new Set(wfs.map(w => w.institution).filter(Boolean))];
  const allDocs = [...new Set(wfs.flatMap(w => w.documents || []))];
  const totalQueueMin = wfs.reduce((s, w) => s + (w.queue || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-3"
    >
      {/* Headline */}
      <div className="rounded-2xl p-4 border"
        style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.12), rgba(6,182,212,0.06))', borderColor: 'rgba(37,99,235,0.25)' }}>
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Bureaucracy bundle assembled</p>
        </div>
        <h3 className="text-lg font-bold text-white">{event.title}</h3>
        <p className="text-xs text-slate-400 mt-1">{event.description}</p>
        <div className="flex items-center gap-4 mt-3 text-[11px]">
          <span className="flex items-center gap-1 text-emerald-300"><Clock className="w-3 h-3" /> ~{Math.round((event.estimatedSavedMin || 0) / 60)}h saved</span>
          <span className="flex items-center gap-1 text-slate-400">{wfs.length} workflow{wfs.length !== 1 ? 's' : ''}</span>
          {totalQueueMin > 0 && (
            <span className="flex items-center gap-1 text-amber-300">~{totalQueueMin} min queue avoided</span>
          )}
        </div>
      </div>

      {/* Next actions */}
      {event.nextActions?.length > 0 && (
        <Section icon={CheckCircle2} title="Next actions">
          <ul className="space-y-1.5">
            {event.nextActions.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                <div className="w-4 h-4 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-primary">{i + 1}</span>
                </div>
                {a}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Institutions */}
      {allInstitutions.length > 0 && (
        <Section icon={MapPin} title="Institutions">
          <ul className="space-y-1.5">
            {allInstitutions.map(inst => (
              <li key={inst} className="text-xs text-slate-300 flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent" /> {inst}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* Documents */}
      {allDocs.length > 0 && (
        <Section icon={FileText} title={`Documents needed (${allDocs.length})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {allDocs.slice(0, 10).map(d => (
              <div key={d} className="text-[11px] text-slate-300 px-2 py-1 rounded bg-white/[0.03] border border-white/5">
                {d}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Launch */}
      <Button
        onClick={() => onLaunch?.(event)}
        disabled={launching}
        className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 text-base font-bold"
      >
        {launching ? 'Assembling…' : <>Launch bundle <ArrowRight className="w-4 h-4 ml-1.5" /></>}
      </Button>
    </motion.div>
  );
}