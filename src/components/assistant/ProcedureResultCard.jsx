/**
 * ProcedureResultCard — Instant workflow result card, not a chat bubble.
 * Shows checklist, documents, institution, actions.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Clock, MapPin, Globe, AlertTriangle,
  ExternalLink, ChevronDown, ChevronUp, FileText, Zap
} from 'lucide-react';
import { clujInstitutions } from '@/lib/data/clujInstitutions';

function DocItem({ label, done }) {
  return (
    <div className="flex items-center gap-2.5 py-1.5">
      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-all ${
        done ? 'bg-success border-success' : 'border-white/20'
      }`}>
        {done && <CheckCircle2 className="w-3 h-3 text-white" />}
      </div>
      <span className="text-xs text-slate-300">{label}</span>
    </div>
  );
}

function StepBadge({ index, text }) {
  return (
    <li className="flex items-start gap-3">
      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{index + 1}</span>
      <span className="text-xs text-slate-300 leading-relaxed">{text}</span>
    </li>
  );
}

export default function ProcedureResultCard({ workflow, onBookAppointment }) {
  const [docsExpanded, setDocsExpanded] = useState(true);
  const [stepsExpanded, setStepsExpanded] = useState(false);

  const institution = clujInstitutions.find(i =>
    i.id === workflow.institutionId || i.workflowIds?.includes(workflow.id)
  );

  const queueMin = institution?.queue?.current || workflow.queue || 30;
  const queueColor = queueMin <= 20 ? '#22c55e' : queueMin <= 35 ? '#facc15' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="space-y-3"
    >
      {/* Header card */}
      <div className="rounded-2xl p-4 border border-primary/20 bg-primary/5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Workflow lansat</span>
            </div>
            <h3 className="text-base font-bold text-white">{workflow.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{workflow.description}</p>
          </div>
          <div className="flex flex-col items-end shrink-0 gap-1">
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={{
                background: workflow.online ? 'rgba(6,182,212,0.12)' : 'rgba(255,255,255,0.05)',
                color: workflow.online ? '#06b6d4' : '#94a3b8',
                border: `1px solid ${workflow.online ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.1)'}`,
              }}>
              {workflow.online ? '🌐 Online disponibil' : '🏛️ Prezenta fizica'}
            </span>
            <span className="text-[10px] text-slate-500">⏳ {workflow.processingTime}</span>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-sm font-bold" style={{ color: queueColor }}>~{queueMin} min</div>
            <div className="text-[10px] text-slate-500">Coadă</div>
          </div>
          <div className="rounded-xl p-2 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="text-sm font-bold text-white">{workflow.documents.length}</div>
            <div className="text-[10px] text-slate-500">Documente</div>
          </div>
          <div className="rounded-xl p-2 text-center" style={{ background: workflow.urgency === 'critical' ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${workflow.urgency === 'critical' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.06)'}` }}>
            <div className="text-sm font-bold" style={{ color: workflow.urgency === 'critical' ? '#ef4444' : workflow.urgency === 'high' ? '#facc15' : '#94a3b8' }}>
              {workflow.urgency === 'critical' ? 'Critic' : workflow.urgency === 'high' ? 'Urgent' : 'Normal'}
            </div>
            <div className="text-[10px] text-slate-500">Urgenta</div>
          </div>
        </div>
      </div>

      {/* Required Documents */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setDocsExpanded(!docsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-accent" />
            <span className="text-xs font-semibold text-white">Documente necesare</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">{workflow.documents.length}</span>
          </div>
          {docsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>
        {docsExpanded && (
          <div className="px-4 pb-3 border-t border-white/5 pt-1">
            {workflow.documents.map((doc, i) => <DocItem key={i} label={doc} done={false} />)}
          </div>
        )}
      </div>

      {/* Institution card */}
      {institution && (
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-white">Institutie</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">{institution.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{institution.address}</p>
              {institution.hours?.weekdays && <p className="text-[10px] text-slate-500 mt-1">{institution.hours.weekdays}</p>}
              <p className="text-[10px] text-warning mt-1">⏰ Cel mai bun moment: {workflow.bestTime}</p>
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(institution.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 px-3 py-1.5 rounded-xl text-xs text-primary border border-primary/20 bg-primary/5 hover:bg-primary/15 transition-colors flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              Harta
            </a>
          </div>
        </div>
      )}

      {/* Warning */}
      {workflow.commonMistake && (
        <div className="rounded-2xl p-3 flex items-start gap-2.5" style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-0.5">Greseala frecventa</p>
            <p className="text-xs text-slate-300">{workflow.commonMistake}</p>
          </div>
        </div>
      )}

      {/* Next steps (collapsible) */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <button
          onClick={() => setStepsExpanded(!stepsExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.02] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-green-400" />
            <span className="text-xs font-semibold text-white">Pasi urmatori</span>
          </div>
          {stepsExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
        </button>
        {stepsExpanded && (
          <ol className="px-4 pb-4 border-t border-white/5 pt-3 space-y-2.5">
            {workflow.nextSteps.map((step, i) => <StepBadge key={i} index={i} text={step} />)}
          </ol>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {workflow.online && (
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-accent/15 text-accent border border-accent/25 hover:bg-accent/25 transition-colors"
          >
            <Globe className="w-3.5 h-3.5" />
            Rezolva online
          </a>
        )}
        <a
          href="https://programari.interne.mai.gov.ro/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Programare online
        </a>
      </div>

      <p className="text-[10px] text-slate-600 text-center">
        ⚖️ Informatii orientative — Verifica cerintele finale la institutie
      </p>
    </motion.div>
  );
}