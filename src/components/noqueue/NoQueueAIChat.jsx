/**
 * NoQueue AI — Deterministic pipeline with LLM fallback for unknown intents
 */
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  routeByQuickAction, routeByText, detectSpecialIntent, detectPassportIntent
} from '@/lib/assistant/procedureRouter';
import { detectLostIdIntent } from '@/lib/documents/documentRouter';
import { clujInstitutions } from '@/lib/data/clujInstitutions';
import { base44 } from '@/api/base44Client';
import ProcedureResultCard from '@/components/assistant/ProcedureResultCard';
import QuickActionCarousel from '@/components/assistant/QuickActionCarousel';
import VoiceInputButton from '@/components/assistant/VoiceInputButton';
import PipelineProgress from '@/components/assistant/PipelineProgress';
import PassportWorkspace from '@/components/passport/PassportWorkspace';
import workflows from '@/lib/data/workflows';

// Queue overview card
function QueueOverviewCard() {
  const sorted = [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current).slice(0, 5);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2 p-4">
      <div className="rounded-2xl p-4 border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
        <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
          <span>⏱️</span> Estimari cozi acum in Cluj-Napoca
        </p>
        <div className="space-y-2">
          {sorted.map((inst, i) => {
            const color = inst.queue.current <= 20 ? '#22c55e' : inst.queue.current <= 35 ? '#facc15' : '#ef4444';
            return (
              <div key={inst.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 mr-2">#{i + 1}</span>
                  <span className="text-xs text-slate-300">{inst.name}</span>
                </div>
                <span className="text-sm font-bold" style={{ color }}>~{inst.queue.current} min</span>
              </div>
            );
          })}
        </div>
        <p className="text-[10px] text-slate-600 mt-3">Date simulate pentru demo MVP</p>
      </div>
    </motion.div>
  );
}

// LLM fallback result
function LLMResultCard({ result }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 p-4">
      <div className="rounded-2xl p-4 border border-accent/20 bg-accent/5">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-3.5 h-3.5 text-accent" />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">NoQueue AI · Raspuns</span>
        </div>
        <p className="text-sm text-white leading-relaxed">{result.answer}</p>
      </div>
      {result.suggestedWorkflow && (
        <div className="rounded-2xl p-3 border border-white/8" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-semibold">Procedura sugerata</p>
          <p className="text-sm font-semibold text-white">{result.suggestedWorkflow}</p>
        </div>
      )}
      {result.nextSteps?.length > 0 && (
        <div className="rounded-2xl p-3 border border-white/8 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold mb-2">Pasi urmatori</p>
          {result.nextSteps.map((step, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              {step}
            </div>
          ))}
        </div>
      )}
      <p className="text-[10px] text-slate-600 text-center">⚖️ Informatii orientative — Verifica cerintele la institutie</p>
    </motion.div>
  );
}

// Welcome state — fully clickable example chips (accessible, keyboard-friendly)
function WelcomeState({ onExample }) {
  const EXAMPLES = [
    'Am nevoie de pașaport urgent',
    'Mi-am pierdut buletinul',
    'Reînnoire permis auto',
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full py-6 px-4 gap-6"
    >
      <div className="text-center">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow-blue">
          <Zap className="w-7 h-7 text-white" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">NoQueue AI</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Descrie ce procedură ai nevoie. Primești instant pachetul complet: documente, instituție, pași.
        </p>
      </div>
      <div className="w-full max-w-xs space-y-2">
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-semibold">Încearcă</p>
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            type="button"
            role="button"
            tabIndex={0}
            onClick={() => onExample(ex)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onExample(ex); }
            }}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white hover:border-primary/40 active:scale-[0.99] transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            "{ex}"
          </button>
        ))}
      </div>
    </motion.div>
  );
}

// Passport result — renders the existing Export PDF Draft workspace inline
function PassportResultCard({ intent, profile }) {
  const isUrgent = intent?.urgency === 'urgent';
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="p-4 space-y-3">
      {/* Urgent banner */}
      {isUrgent && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.25)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
          <span className="text-[11px] font-semibold text-warning uppercase tracking-wider">Urgent request</span>
          <span className="text-[10px] text-slate-400">· Draft pasaport pregătit din Seif & My Cases</span>
        </div>
      )}
      <PassportWorkspace profile={profile} caseData={{ urgency: intent?.urgency || 'normal' }} />
    </motion.div>
  );
}

export default function NoQueueAIChat({ onWorkflowDetected }) {
  const navigate = useNavigate();
  const [result, setResult] = useState(null); // { type: 'workflow'|'queue'|'llm'|'passport', ... }
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [input, setInput] = useState('');
  const [profile, setProfile] = useState(null);
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  // Silently load profile so the passport flow has Seif data ready on first click
  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user?.email) return;
      base44.entities.UserPrivateProfile
        .filter({ user_id: user.email }, '-created_date', 1)
        .then(profiles => setProfile(profiles?.[0] || null))
        .catch(() => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (result) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  }, [result]);

  const advanceStep = (step, delay = 500) => new Promise(r => setTimeout(() => { setPipelineStep(step); r(); }, delay));

  // Centralized passport launch — used by both the suggestion chip and the "Pașaport" quick action
  const launchPassport = async (text) => {
    const passportIntent = detectPassportIntent(text) || { intent: 'passport_urgent', baseIntent: 'passport_renewal', urgency: 'urgent', confidence: 0.98 };
    await advanceStep(1, 350);
    await advanceStep(2, 350);
    await advanceStep(3, 300);
    setResult({ type: 'passport', intent: passportIntent });
    onWorkflowDetected?.({ workflowId: 'passport-renewal' });
    setLoading(false);
  };

  const launch = async (actionId = null, text = null) => {
    setLoading(true);
    setResult(null);
    setPipelineStep(0);

    // Step 0 — intent detection
    await advanceStep(0, 200);

    if (actionId) {
      if (actionId === 'queue') {
        setLoading(false);
        setResult({ type: 'queue' });
        return;
      }
      // Passport quick action → launch the existing Export PDF Draft workspace
      if (actionId === 'passport') {
        await launchPassport('Am nevoie de pașaport urgent');
        return;
      }
      const workflow = routeByQuickAction(actionId);
      if (workflow) {
        await advanceStep(1, 350);
        await advanceStep(2, 350);
        await advanceStep(3, 300);
        setResult({ type: 'workflow', workflow });
        onWorkflowDetected?.({ workflowId: workflow.id });
        setLoading(false);
        return;
      }
    }

    if (text) {
      // Lost ID intent → dedicated /demo/lost-id-card workspace
      const lostId = detectLostIdIntent(text);
      if (lostId) {
        await advanceStep(1, 300);
        await advanceStep(2, 300);
        await advanceStep(3, 250);
        onWorkflowDetected?.({ workflowId: 'lost-id-card' });
        setLoading(false);
        navigate(lostId.route);
        return;
      }

      // Passport intent → Export PDF Draft workspace (priority over generic workflow card)
      const passportIntent = detectPassportIntent(text);
      if (passportIntent) {
        await launchPassport(text);
        return;
      }

      const special = detectSpecialIntent(text);
      if (special === 'queue-overview') {
        setLoading(false);
        setResult({ type: 'queue' });
        return;
      }

      // Step 1 — check requirements
      await advanceStep(1, 400);
      const workflow = routeByText(text);

      if (workflow) {
        await advanceStep(2, 380);
        await advanceStep(3, 300);
        setResult({ type: 'workflow', workflow });
        onWorkflowDetected?.({ workflowId: workflow.id });
        setLoading(false);
        return;
      }

      // Step 2 — institution lookup
      await advanceStep(2, 400);
      // Step 3 — LLM fallback
      await advanceStep(3, 300);

      try {
        const workflowList = workflows.map(w => `${w.id}: ${w.title}`).join(', ');
        const llmResult = await base44.integrations.Core.InvokeLLM({
          prompt: `Esti un asistent civic pentru Cluj-Napoca, Romania. 
Un utilizator a scris: "${text}"

Raspunde SCURT si UTIL in romana. Identifica ce procedura/serviciu civic cauta si explica pasii principali.
Proceduri disponibile in sistem: ${workflowList}

Daca cererea se incadreaza intr-una din proceduri, mentioneaza-o clar.`,
          response_json_schema: {
            type: 'object',
            properties: {
              answer: { type: 'string' },
              suggestedWorkflow: { type: 'string' },
              nextSteps: { type: 'array', items: { type: 'string' } },
            },
          },
        });
        setResult({ type: 'llm', data: llmResult });
      } catch {
        setResult({ type: 'queue' });
      }
      setLoading(false);
      return;
    }

    setResult({ type: 'queue' });
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    const t = input.trim();
    if (!t) return;
    setInput('');
    launch(null, t);
  };

  const handleVoiceTranscript = (text) => {
    setInput(text);
    launch(null, text);
  };

  const handleReset = () => {
    setResult(null);
    setInput('');
    inputRef.current?.focus();
  };

  return (
    <section id="chat" className="py-20 sm:py-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-primary">NoQueue AI • Cluj-Napoca</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">NoQueue AI</h2>
          <p className="mt-3 text-slate-400 text-sm">
            Descrie situatia ta. Primesti instant documentele, pasii si institutia. Fara cozi inutile.
          </p>
        </motion.div>

        {/* Main card */}
        <div className="glass-card rounded-3xl overflow-hidden glow-blue">
          {/* Top bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">NoQueue AI</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Pipeline civic • Instant</span>
                </div>
              </div>
            </div>
            {result && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            )}
          </div>

          {/* Content area */}
          <div className="min-h-[360px] flex flex-col">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1">
                  <PipelineProgress currentStep={pipelineStep} />
                </motion.div>
              ) : result ? (
                <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 overflow-y-auto" ref={resultRef}>
                  {result.type === 'workflow' && <div className="p-4"><ProcedureResultCard workflow={result.workflow} /></div>}
                  {result.type === 'queue' && <QueueOverviewCard />}
                  {result.type === 'llm' && <LLMResultCard result={result.data} />}
                  {result.type === 'passport' && <PassportResultCard intent={result.intent} profile={profile} />}
                </motion.div>
              ) : (
                <motion.div key="welcome" className="flex-1">
                  <WelcomeState onExample={(t) => { setInput(t); launch(null, t); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick action carousel */}
          <div className="border-t border-white/5 pt-3 pb-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold px-4 mb-2">Actiuni rapide</p>
            <QuickActionCarousel onAction={(id) => launch(id)} />
          </div>

          {/* Input bar */}
          <div className="px-4 pb-4 pt-3 border-t border-white/5">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ex: Am nevoie de pasaport, mi-am pierdut buletinul…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
                    disabled={loading}
                  />
                </div>
                <VoiceInputButton onTranscript={handleVoiceTranscript} language="ro-RO" />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Zap className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              Voce activata · Pipeline instant · AI fallback pentru orice intrebare
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}