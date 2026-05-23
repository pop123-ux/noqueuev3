/**
 * CaseWorkspace — Full AI civic workspace for a single case.
 * Shows: AI plan, requirements, generated docs, institution, queue, official sources.
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles, Globe, MapPin, Clock, AlertTriangle, CheckCircle2,
  ChevronDown, ChevronUp, ExternalLink, FileText, Loader2,
  Shield, ArrowRight, Building2, FileOutput, Navigation
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { buildRagAnswer } from '@/lib/rag/ragAnswerBuilder';
import { matchRequirements, getReadinessScore } from '@/lib/rag/requirementMatcher';
import GeneratedDocumentsPanel from '@/components/documents/GeneratedDocumentsPanel';

function Section({ title, icon: SectionIcon, color = 'text-primary', children, defaultOpen = true }) {
  const Icon = SectionIcon;
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-white">{title}</span>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function CaseWorkspace({ cas, profile, onClose }) {
  const queryClient = useQueryClient();
  const [ragData, setRagData] = useState(null);
  const [ragLoading, setRagLoading] = useState(false);
  const [ragLoaded, setRagLoaded] = useState(false);

  const { data: uploadedDocs = [] } = useQuery({
    queryKey: ['gov-docs-for-case', profile?.user_id],
    queryFn: () => base44.entities.GovDocument.filter({ user_id: profile?.user_id }, '-created_date', 50),
    enabled: !!profile?.user_id,
  });

  const loadRag = async () => {
    if (ragLoaded || ragLoading) return;
    setRagLoading(true);
    try {
      const data = await buildRagAnswer(cas.user_description || cas.procedure_title, profile);
      setRagData(data);
      setRagLoaded(true);
    } finally {
      setRagLoading(false);
    }
  };

  const procedure = ragData?.procedure;
  const reqMatch = procedure ? matchRequirements(procedure, profile, uploadedDocs) : null;
  const readiness = reqMatch ? getReadinessScore(reqMatch.available, reqMatch.missing, reqMatch.warnings) : null;
  const institution = ragData?.institution;

  const readinessColor = readiness >= 80 ? '#22c55e' : readiness >= 50 ? '#facc15' : '#ef4444';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">AI Civic Workspace</span>
            </div>
            <h2 className="text-lg font-bold text-white leading-snug">{cas.procedure_title}</h2>
            {cas.institution_name && (
              <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                <Building2 className="w-3 h-3" /> {cas.institution_name}
              </p>
            )}
          </div>
          {readiness !== null && (
            <div className="text-center shrink-0">
              <div className="text-2xl font-bold" style={{ color: readinessColor }}>{readiness}%</div>
              <div className="text-[10px] text-slate-500">Ready</div>
            </div>
          )}
        </div>

        {!ragLoaded && (
          <button
            onClick={loadRag}
            disabled={ragLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-semibold hover:bg-primary/20 transition-all disabled:opacity-60"
          >
            {ragLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {ragLoading ? 'Loading AI case plan…' : 'Load AI Case Plan & Requirements'}
          </button>
        )}
      </div>

      {/* AI Plan */}
      {ragData?.aiPlan && (
        <Section title="AI Case Plan" icon={Sparkles} color="text-primary">
          <div className="space-y-4">
            <div className="rounded-xl bg-primary/5 border border-primary/15 p-4">
              <p className="text-sm text-slate-200 leading-relaxed">{ragData.aiPlan.summary}</p>
            </div>

            {ragData.aiPlan.immediate_action && (
              <div className="flex items-start gap-3 rounded-xl bg-success/8 border border-success/20 p-3">
                <ArrowRight className="w-4 h-4 text-success mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-1">Do this first</p>
                  <p className="text-xs text-slate-300">{ragData.aiPlan.immediate_action}</p>
                </div>
              </div>
            )}

            {ragData.aiPlan.online_shortcut && ragData.onlineAvailable && (
              <div className="flex items-start gap-3 rounded-xl bg-accent/8 border border-accent/20 p-3">
                <Globe className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-semibold text-accent uppercase tracking-wider mb-1">Online shortcut</p>
                  <p className="text-xs text-slate-300 mb-2">{ragData.aiPlan.online_shortcut}</p>
                  {ragData.onlineUrl && (
                    <a
                      href={ragData.onlineUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Open official portal
                    </a>
                  )}
                </div>
              </div>
            )}

            {ragData.aiPlan.next_steps?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-2">Step-by-step plan</p>
                <ol className="space-y-2">
                  {ragData.aiPlan.next_steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-xs text-slate-300">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {ragData.aiPlan.time_estimate && (
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {ragData.aiPlan.time_estimate}</span>
              )}
              {ragData.aiPlan.cost_estimate && (
                <span>💰 {ragData.aiPlan.cost_estimate}</span>
              )}
            </div>

            {ragData.aiPlan.important_warnings?.length > 0 && (
              <div className="rounded-xl bg-warning/6 border border-warning/15 p-3 space-y-1">
                {ragData.aiPlan.important_warnings.map((w, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-warning">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w}</span>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-slate-600 italic border-t border-white/5 pt-3">
              ⚖️ Plan generat de AI — Verifică cerințele finale la instituție înainte de depunere.
            </p>
          </div>
        </Section>
      )}

      {/* Requirement Matcher */}
      {reqMatch && (
        <Section title="Seif Compatibility Check" icon={Shield} color="text-success">
          <div className="space-y-4">
            {/* Readiness bar */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500">Profile readiness</span>
                <span className="font-semibold" style={{ color: readinessColor }}>{readiness}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${readiness}%` }}
                  style={{ backgroundColor: readinessColor }}
                />
              </div>
            </div>

            {reqMatch.available.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-success uppercase tracking-wider mb-2">✓ Available from Seif</p>
                <div className="space-y-1">
                  {reqMatch.available.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                      <span className="text-slate-300">{item.label}</span>
                      <span className="text-slate-600 text-[10px]">({item.source})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reqMatch.missing.length > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-2">⚠ Missing from Seif</p>
                <div className="space-y-1">
                  {reqMatch.missing.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                      <span className="text-slate-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {reqMatch.warnings.length > 0 && (
              <div>
                {reqMatch.warnings.map((w, i) => (
                  <div key={i} className="rounded-xl bg-destructive/8 border border-destructive/20 p-3 text-xs text-destructive flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{w.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}

      {/* Required documents */}
      {(procedure?.requiredDocuments || cas.required_documents)?.length > 0 && (
        <Section title="Required Documents" icon={FileText} color="text-accent">
          <div className="space-y-1.5">
            {(procedure?.requiredDocuments || cas.required_documents).map((doc, i) => {
              const done = cas.completed_documents?.includes(doc);
              return (
                <div key={i} className="flex items-center gap-2.5 py-1">
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${done ? 'bg-success border-success' : 'border-white/20'}`}>
                    {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </div>
                  <span className={`text-xs ${done ? 'line-through text-slate-600' : 'text-slate-300'}`}>{doc}</span>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* Institution & Queue */}
      {(institution || cas.institution_name) && (
        <Section title="Institution & Queue" icon={MapPin} color="text-primary">
          <div className="space-y-3">
            {institution && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-white">{institution.name}</span>
                  <span className="text-sm font-bold" style={{ color: institution.queue.current <= 20 ? '#22c55e' : institution.queue.current <= 40 ? '#facc15' : '#ef4444' }}>
                    ~{institution.queue.current} min
                  </span>
                </div>
                <p className="text-xs text-slate-400">{institution.address}</p>
                <p className="text-xs text-slate-500">{institution.hours?.weekdays}</p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(institution.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-primary hover:text-primary/80"
                >
                  <Navigation className="w-3.5 h-3.5" /> Get directions
                </a>
              </>
            )}
          </div>
        </Section>
      )}

      {/* Official Sources */}
      {ragData?.officialSources?.length > 0 && (
        <Section title="Official Sources" icon={Globe} color="text-accent" defaultOpen={false}>
          <div className="space-y-2">
            {ragData.officialSources.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] transition-colors group"
              >
                <span className="text-xs text-slate-300 group-hover:text-white">{source.label}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent shrink-0" />
              </a>
            ))}
          </div>
        </Section>
      )}

      {/* Generated Documents */}
      <Section title="Generated Draft Documents" icon={FileOutput} color="text-warning" defaultOpen={false}>
        <GeneratedDocumentsPanel caseId={cas.id} procedureKey={cas.procedure_key} currentProfile={profile} />
      </Section>
    </motion.div>
  );
}