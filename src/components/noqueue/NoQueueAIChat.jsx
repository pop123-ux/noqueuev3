/**
 * NoQueue AI Civic Assistant — Deterministic Workflow Launcher
 * NOT a chatbot. Instantly routes to procedures, shows cards, no generic replies.
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw, Mic } from 'lucide-react';
import { routeByQuickAction, routeByText, detectSpecialIntent } from '@/lib/assistant/procedureRouter';
import { clujInstitutions } from '@/lib/data/clujInstitutions';
import ProcedureResultCard from '@/components/assistant/ProcedureResultCard';
import QuickActionCarousel from '@/components/assistant/QuickActionCarousel';
import VoiceInputButton from '@/components/assistant/VoiceInputButton';

// Queue overview card
function QueueOverviewCard() {
  const sorted = [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current).slice(0, 5);
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
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

// Empty/welcome state
function WelcomeState({ onAction, onVoice }) {
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
        <h3 className="text-lg font-bold text-white mb-1">Asistent Civic AI</h3>
        <p className="text-xs text-slate-400 max-w-xs">
          Lansez instant procedura de care ai nevoie. Fara intrebari. Fara birocratie.
        </p>
      </div>

      {/* Input hint */}
      <div className="w-full max-w-xs space-y-2">
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider font-semibold">Incerca</p>
        {['"Am nevoie de pasaport urgent"', '"Mi-am pierdut buletinul"', '"Reinnoire permis auto"'].map(ex => (
          <button
            key={ex}
            onClick={() => onVoice(ex.replace(/"/g, ''))}
            className="w-full text-left px-4 py-2.5 rounded-xl text-xs text-slate-300 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            {ex}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function NoQueueAIChat({ onWorkflowDetected }) {
  const [result, setResult] = useState(null); // { type: 'workflow'|'queue', workflow, actionId }
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const inputRef = useRef(null);
  const resultRef = useRef(null);

  useEffect(() => {
    if (result) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    }
  }, [result]);

  const launch = async (actionId = null, text = null) => {
    setLoading(true);
    setResult(null);

    // Tiny artificial delay for smooth UX feel (not waiting for LLM)
    await new Promise(r => setTimeout(r, 280));

    if (actionId) {
      if (actionId === 'queue') {
        setResult({ type: 'queue' });
        setLoading(false);
        return;
      }
      const workflow = routeByQuickAction(actionId);
      if (workflow) {
        setResult({ type: 'workflow', workflow });
        onWorkflowDetected?.({ workflowId: workflow.id });
        setLoading(false);
        return;
      }
    }

    if (text) {
      const special = detectSpecialIntent(text);
      if (special === 'queue-overview') {
        setResult({ type: 'queue' });
        setLoading(false);
        return;
      }
      const workflow = routeByText(text);
      if (workflow) {
        setResult({ type: 'workflow', workflow });
        onWorkflowDetected?.({ workflowId: workflow.id });
        setLoading(false);
        return;
      }
    }

    // Soft fallback — show queue overview rather than "please rephrase"
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
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Asistent Civic AI</h2>
          <p className="mt-3 text-slate-400 text-sm">
            Alege procedura. Primesti instant documentele, pasii si institutia. Fara cozi inutile.
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
                <p className="text-sm font-bold text-white">NoQueue Civic AI</p>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span>Workflow launcher • Instant</span>
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
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col items-center justify-center gap-3 p-8"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-6 h-6 text-primary" />
                    </motion.div>
                  </div>
                  <p className="text-sm text-slate-400">Lansez procedura…</p>
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              ) : result ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 p-4 overflow-y-auto"
                  ref={resultRef}
                >
                  {result.type === 'workflow' && (
                    <ProcedureResultCard workflow={result.workflow} />
                  )}
                  {result.type === 'queue' && <QueueOverviewCard />}
                </motion.div>
              ) : (
                <motion.div key="welcome" className="flex-1">
                  <WelcomeState onAction={(id) => launch(id)} onVoice={(t) => { setInput(t); launch(null, t); }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick action carousel */}
          <div className="border-t border-white/5 pt-3 pb-2">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold px-4 mb-2">Actiuni rapide</p>
            <QuickActionCarousel onAction={(id) => launch(id)} />
          </div>

          {/* Input / command bar */}
          <div className="px-4 pb-4 pt-3 border-t border-white/5">
            <form onSubmit={handleSubmit}>
              <div className="flex gap-2 items-center">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ex: Am nevoie de pasaport urgent…"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors pr-4"
                    disabled={loading}
                    aria-label="Descrie procedura de care ai nevoie"
                  />
                </div>
                <VoiceInputButton
                  onTranscript={handleVoiceTranscript}
                  language="ro-RO"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
                  aria-label="Lansare procedura"
                >
                  <Zap className="w-4 h-4 text-white" />
                </button>
              </div>
            </form>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              Voce activata · Instant routing · Informatii orientative
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}