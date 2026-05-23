/**
 * RunDemo — 90-second hackathon demo flow.
 *
 * Scripted journey that judges can run in one click:
 *   1. identity verified  →  2. life event selected  →  3. bundle assembled
 *   4. document generated →  5. signature simulated  →  6. saved time tallied
 *
 * Writes real records (LifeEvent, CivicTimelineEvent) so the OS dashboard
 * lights up immediately after the demo finishes.
 */
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  ShieldCheck, Sparkles, FileCheck2, PenTool, MapPin, Clock,
  CheckCircle2, ArrowRight, Zap, Layers,
} from 'lucide-react';
import Navbar from '@/components/noqueue/Navbar';
import LIFE_EVENTS from '@/lib/data/lifeEvents';
import { recordCivicEvent } from '@/lib/civic/civicTimeline';

const STEPS = [
  { icon: ShieldCheck,  title: 'Identity verified',         hint: 'Safe Profile loaded, autofill ready.', durationMs: 900 },
  { icon: Sparkles,     title: 'Life event selected',       hint: '"I lost my ID" detected.',              durationMs: 900 },
  { icon: Layers,       title: 'Bureaucracy bundle assembled', hint: '3 documents, 1 institution, 1 appointment.', durationMs: 1100 },
  { icon: FileCheck2,   title: 'Loss declaration generated', hint: 'PDF auto-filled with verified profile.', durationMs: 900 },
  { icon: PenTool,      title: 'Signature simulated',       hint: '2FA confirmed → digital approval recorded.', durationMs: 900 },
  { icon: MapPin,       title: 'Institution route mapped',   hint: 'Evidența Persoanelor • lowest queue window picked.', durationMs: 900 },
  { icon: Clock,        title: 'Saved time tallied',        hint: '~3 hours of bureaucracy avoided.',       durationMs: 900 },
];

export default function RunDemo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  async function runDemo() {
    if (running) return;
    setRunning(true);
    setDone(false);
    setStepIdx(0);

    const userId = user?.email || 'anonymous';
    const lostIdEvent = LIFE_EVENTS.find(e => e.key === 'lost-id');

    // Animate through steps
    for (let i = 0; i < STEPS.length; i++) {
      setStepIdx(i);
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, STEPS[i].durationMs));
    }

    // Persist a "demo run" footprint so the OS dashboard reflects it
    try {
      await base44.entities.LifeEvent.create({
        user_id: userId,
        event_key: lostIdEvent.key,
        event_title: lostIdEvent.title,
        category: lostIdEvent.category,
        status: 'in_progress',
        linked_workflow_ids: lostIdEvent.workflowIds,
        estimated_time_saved_min: lostIdEvent.estimatedSavedMin,
        notes: 'Started from 90-second demo run.',
      });
      await recordCivicEvent({
        userId, eventType: 'demo_run', title: '90-second demo executed',
        description: 'Scripted civic journey: identity → life event → bundle → signature.',
        source: 'run-demo',
      });
      await recordCivicEvent({
        userId, eventType: 'life_event_started', title: `Life event: ${lostIdEvent.title}`,
        description: 'Bureaucracy bundle assembled automatically.',
        source: 'run-demo', resourceType: 'LifeEvent', resourceId: lostIdEvent.key,
      });
      await recordCivicEvent({
        userId, eventType: 'document_generated', title: 'Loss declaration generated',
        description: 'Auto-filled from verified Safe Profile.',
        source: 'run-demo',
      });
      await recordCivicEvent({
        userId, eventType: 'signature_approved', title: 'Signature simulated',
        description: 'Identity-backed digital approval recorded.',
        source: 'run-demo',
      });
    } catch (e) {
      console.warn('[run-demo] persistence failed', e);
    }

    setDone(true);
    setRunning(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-3">
              <Zap className="w-3 h-3 text-amber-300" />
              <span className="text-[10px] font-bold text-amber-200 uppercase tracking-wider">Hackathon demo flow</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Run NoQueue in 90 seconds</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-xl">
              A scripted civic journey: identity verification → life event → assembled bureaucracy bundle → signed document → mapped institution → saved time.
            </p>
          </motion.div>

          {/* Action */}
          <div className="mt-6 flex flex-wrap gap-2">
            <button
              onClick={runDemo}
              disabled={running}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white text-sm font-bold disabled:opacity-50"
            >
              {running ? 'Running…' : done ? 'Run again' : <>▶ Start demo</>}
            </button>
            {done && (
              <button
                onClick={() => navigate('/os')}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent text-sm font-bold"
              >
                Open NoQueue OS <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Step timeline */}
          <div className="mt-8 space-y-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === stepIdx && running;
              const isDone = i < stepIdx || (done && i <= stepIdx);
              return (
                <motion.div
                  key={s.title}
                  initial={false}
                  animate={{
                    opacity: stepIdx < 0 ? 0.5 : isDone || isActive ? 1 : 0.35,
                    x: isActive ? 4 : 0,
                  }}
                  className={`flex items-center gap-4 rounded-2xl p-4 border transition-colors ${
                    isActive ? 'bg-primary/10 border-primary/40' :
                    isDone   ? 'bg-emerald-500/5 border-emerald-500/25' :
                              'bg-white/[0.02] border-white/8'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isActive ? 'bg-primary/20 border-primary/40 text-primary' :
                    isDone   ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' :
                              'bg-white/5 border-white/10 text-slate-500'
                  }`}>
                    {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${isActive ? 'text-white' : isDone ? 'text-emerald-200' : 'text-slate-300'}`}>
                      {s.title}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{s.hint}</p>
                  </div>
                  {isActive && (
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse">Running…</span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Final card */}
          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 rounded-2xl p-5 border text-center"
                style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.10), rgba(37,99,235,0.10))', borderColor: 'rgba(34,197,94,0.30)' }}
              >
                <Sparkles className="w-7 h-7 text-emerald-400 mx-auto mb-2" />
                <p className="text-base font-black text-white">This is the future of Digital Romania.</p>
                <p className="text-xs text-slate-400 mt-1">
                  Once your identity is verified, bureaucracy becomes automatic.
                </p>
                <Link to="/os" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80">
                  Open the dashboard <ArrowRight className="w-3 h-3" />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>

          <p className="text-[10px] text-slate-700 text-center mt-8">
            🧪 Prototype simulation — designed for ClujHackathon2026. Not an official authentication system.
          </p>
        </div>
      </div>
    </div>
  );
}