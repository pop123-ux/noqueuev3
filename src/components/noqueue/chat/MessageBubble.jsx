import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, Circle, AlertTriangle, Globe, Clock, MapPin, ChevronDown, ChevronUp, Building2, ArrowRight, FileText } from 'lucide-react';
import { clujInstitutions, getQueueStatus } from '@/lib/data/clujInstitutions';
import workflows from '@/lib/data/workflows';
import DocumentCard from '@/components/noqueue/documents/DocumentCard';

function InstitutionCard({ institutionId }) {
  const inst = clujInstitutions.find(i => i.id === institutionId);
  if (!inst) return null;
  const status = getQueueStatus(inst.queue);

  return (
    <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Building2 className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">Recommended Office</span>
          </div>
          <h4 className="text-sm font-semibold text-white">{inst.name}</h4>
          <div className="flex items-center gap-1 mt-1 text-xs text-slate-400">
            <MapPin className="w-3 h-3" />
            <span>{inst.address}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-xs font-medium" style={{ color: status.color }}>
            {status.label}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
            <Clock className="w-3 h-3" />
            ~{inst.queue.current} min
          </div>
        </div>
      </div>
      {inst.onlineServices && (
        <div className="mt-2 flex items-center gap-1 text-xs text-accent">
          <Globe className="w-3 h-3" /> Online services available
        </div>
      )}
    </div>
  );
}

function DocumentChecklist({ documents }) {
  const [checked, setChecked] = useState({});
  const total = documents.length;
  const done = Object.values(checked).filter(Boolean).length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white">Document Checklist</span>
        <span className="text-xs font-medium text-primary">{done}/{total} ready</span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full mb-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>
      <div className="space-y-2">
        {documents.map((doc, i) => (
          <label key={i} className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              className="sr-only"
              checked={!!checked[i]}
              onChange={() => setChecked(p => ({ ...p, [i]: !p[i] }))}
            />
            {checked[i]
              ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
              : <Circle className="w-4 h-4 text-slate-600 shrink-0 group-hover:text-slate-400 transition-colors" />
            }
            <span className={`text-xs ${checked[i] ? 'line-through text-slate-500' : 'text-slate-300'}`}>{doc}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function WorkflowInfo({ workflowId }) {
  const [expanded, setExpanded] = useState(false);
  const wf = workflows.find(w => w.id === workflowId);
  if (!wf) return null;

  return (
    <div className="mt-3 rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-xs font-semibold text-white hover:bg-white/5 transition-colors"
      >
        <span>⏱ Process: {wf.processingTime} • Best time: {wf.bestTime}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      {expanded && (
        <div className="px-4 pb-3 space-y-2">
          {wf.nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" />
              <span>{step}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MessageBubble({ message, largerText = false }) {
  const isUser = message.role === 'user';
  const textSize = largerText ? 'text-base' : 'text-sm';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      {!isUser && (
        <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white">
          N
        </div>
      )}

      <div className={`max-w-[88%] ${isUser ? '' : 'w-full'}`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary text-white rounded-br-md ml-auto'
            : 'bg-white/[0.04] border border-white/8 rounded-bl-md'
        }`}>
          {isUser ? (
            <p className={textSize}>{message.content}</p>
          ) : (
            <ReactMarkdown
              className={`${textSize} prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-primary [&_p]:text-slate-200 [&_p]:leading-relaxed [&_li]:text-slate-300 [&_h4]:text-white [&_hr]:border-white/10`}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Rich components for AI messages */}
        {!isUser && (
          <>
            {message.documents && message.documents.length > 0 && (
              <DocumentChecklist documents={message.documents} />
            )}
            {message.institutionId && (
              <InstitutionCard institutionId={message.institutionId} />
            )}
            {message.workflowId && (
              <WorkflowInfo workflowId={message.workflowId} />
            )}
            {message.warnings && message.warnings.length > 0 && (
              <div className="mt-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-warning/8 border border-warning/20 text-xs text-warning">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{message.warnings[0]}</span>
              </div>
            )}
            {message.followUpQuestion && (
              <div className="mt-2 px-3 py-2 rounded-xl bg-primary/8 border border-primary/20 text-xs text-primary italic">
                💬 {message.followUpQuestion}
              </div>
            )}
            {message.retrievedDocuments?.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-slate-300">Official Forms Retrieved</span>
                  <span className="text-[10px] text-slate-500">({message.retrievedDocuments.length})</span>
                </div>
                <div className="space-y-2">
                  {message.retrievedDocuments.slice(0, 3).map(doc => (
                    <DocumentCard key={doc.id} doc={doc} compact />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {isUser && (
        <div className="w-7 h-7 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold text-primary">
          U
        </div>
      )}
    </motion.div>
  );
}