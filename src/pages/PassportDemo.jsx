/**
 * PassportDemo — "Lost Passport → Digital Replacement" End-to-End Demo
 * The single polished hackathon MVP workflow.
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Zap, Shield, CheckCircle2, AlertTriangle,
  MapPin, ExternalLink, Download, FileText, Clock,
  ChevronDown, ChevronUp, Globe, Phone, Copy, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import VoiceInputButton from '@/components/assistant/VoiceInputButton';
import {
  generatePreparationPacket,
  PASSPORT_INSTITUTION,
  PASSPORT_REQUIRED_DOCS,
  ONLINE_RESOURCES,
  PASSPORT_LOSS_STEPS,
} from '@/lib/documents/passportLossWorkflow';

// ── Step Progress Bar ──────────────────────────────────────────────────────
function StepProgress({ currentStep }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {PASSPORT_LOSS_STEPS.map((step, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <React.Fragment key={step.id}>
            <motion.div
              animate={{ scale: active ? 1.1 : 1 }}
              className={`flex flex-col items-center z-10 ${i > 0 ? '' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all border-2 ${
                done ? 'bg-success border-success' : active ? 'bg-primary border-primary' : 'bg-transparent border-white/20'
              }`}>
                {done ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className={active ? 'text-white' : 'text-slate-600'}>{i + 1}</span>}
              </div>
              <span className={`text-[9px] mt-1 text-center font-medium hidden sm:block ${active ? 'text-white' : done ? 'text-success' : 'text-slate-600'}`}>
                {step.label}
              </span>
            </motion.div>
            {i < PASSPORT_LOSS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 transition-colors ${i < currentStep ? 'bg-success' : 'bg-white/10'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── ROeID Login Simulation ─────────────────────────────────────────────────
function ROeIDLogin({ onSuccess }) {
  const [phase, setPhase] = useState('login'); // login | 2fa | success
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    setPhase('2fa');
  };

  const handle2FA = async (e) => {
    e?.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    setLoading(false);
    setPhase('success');
    setTimeout(() => onSuccess(), 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-sm mx-auto"
    >
      <div className="glass-card rounded-3xl p-8 text-center">
        {/* ROeID Logo simulation */}
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center mb-4 shadow-lg shadow-blue-900/40">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">ROeID Secure Access</h2>
        <p className="text-xs text-slate-400 mb-6">Autentificare securizata · NoQueue Civic Platform</p>

        <AnimatePresence mode="wait">
          {phase === 'login' && (
            <motion.form key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handleLogin} className="space-y-3 text-left">
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Email / CNP</label>
                <input
                  value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Parolă</label>
                <input
                  type="password" value={pass} onChange={e => setPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Autentificare ROeID'}
              </Button>
              <button type="button" onClick={() => { setEmail('demo@noqueue.ro'); setPass('demo'); handleLogin(); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors py-1">
                → Demo rapid (skip)
              </button>
            </motion.form>
          )}

          {phase === '2fa' && (
            <motion.form key="2fa" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onSubmit={handle2FA} className="space-y-3">
              <div className="p-3 rounded-xl bg-success/10 border border-success/20 text-xs text-success">
                ✓ Identitate verificata. Introdu codul 2FA.
              </div>
              <div className="text-left">
                <label className="text-xs text-slate-400 mb-1 block">Cod 2FA (SMS / Authenticator)</label>
                <input
                  value={code} onChange={e => setCode(e.target.value)}
                  placeholder="123456" maxLength={6}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-3 text-xl text-center tracking-[0.4em] text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 rounded-xl bg-primary">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verificare 2FA'}
              </Button>
              <button type="button" onClick={() => { setCode('123456'); handle2FA(); }}
                className="w-full text-xs text-slate-500 hover:text-slate-300 transition-colors">
                → Auto-fill demo code
              </button>
            </motion.form>
          )}

          {phase === 'success' && (
            <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-success/20 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              <p className="text-success font-semibold">Autentificat cu succes</p>
              <p className="text-xs text-slate-500 mt-1">Se incarca Identity Vault…</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── Voice / Text Command Bar ──────────────────────────────────────────────
function CommandBar({ onLaunch }) {
  const [input, setInput] = useState('');
  const [launched, setLaunched] = useState(false);

  const launch = (text) => {
    setInput(text);
    setLaunched(true);
    setTimeout(() => onLaunch(text), 400);
  };

  const examples = ['Am pierdut pasaportul', 'I lost my passport', 'Pasaportul meu a fost furat'];

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg mx-auto">
      <div className="glass-card rounded-3xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Civic AI Launcher</p>
            <p className="text-[10px] text-slate-400">Spune ce ai nevoie — pornesc instant</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && input.trim()) launch(input.trim()); }}
              placeholder="Ex: Am pierdut pasaportul…"
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
              disabled={launched}
            />
          </div>
          <VoiceInputButton onTranscript={(t) => launch(t)} language="ro-RO" />
          <button
            onClick={() => input.trim() && launch(input.trim())}
            disabled={!input.trim() || launched}
            className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
          >
            <Zap className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => launch(ex)}
              disabled={launched}
              className="px-3 py-1.5 rounded-full text-[11px] text-slate-400 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {ex}
            </button>
          ))}
        </div>

        {launched && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 flex items-center gap-2 text-xs text-primary">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analizez cererea… pornesc workflow
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ── Document Checklist ─────────────────────────────────────────────────────
function DocChecklist({ docs, vaultProfile }) {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-2">
      {docs.map(doc => {
        const hasInVault = doc.fromVault && vaultProfile?.first_name;
        const isGenerated = doc.generated;
        const isOpen = expanded === doc.id;

        return (
          <div key={doc.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
            <button
              onClick={() => setExpanded(isOpen ? null : doc.id)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
            >
              <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                hasInVault || isGenerated ? 'bg-success border-success' : 'border-white/20'
              }`}>
                {(hasInVault || isGenerated) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-xs flex-1 ${!doc.required ? 'text-slate-500' : 'text-slate-300'}`}>{doc.label}</span>
              <div className="flex items-center gap-1.5 shrink-0">
                {isGenerated && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/15 text-accent font-semibold">GENERAT</span>}
                {hasInVault && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-success/15 text-success font-semibold">SEIF ✓</span>}
                {!doc.required && <span className="text-[9px] text-slate-600">optional</span>}
                {isOpen ? <ChevronUp className="w-3 h-3 text-slate-500" /> : <ChevronDown className="w-3 h-3 text-slate-500" />}
              </div>
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                  <div className="px-4 pb-3 text-xs text-slate-500 border-t border-white/5 pt-2">
                    {doc.note}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

// ── Declaration Preview ────────────────────────────────────────────────────
function DeclarationCard({ declaration }) {
  const [copied, setCopied] = useState(false);

  const copyText = () => {
    navigator.clipboard.writeText(declaration.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-accent" />
          <span className="text-sm font-semibold text-white">{declaration.title}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={copyText} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <Copy className="w-3 h-3" />
            {copied ? 'Copiat!' : 'Copiaza'}
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="rounded-xl p-4 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
          {declaration.content}
        </div>
        <p className="text-[10px] text-slate-600 mt-2 italic">{declaration.legalNote}</p>
      </div>
    </div>
  );
}

// ── Submission Simulation ──────────────────────────────────────────────────
function SubmissionSimulator() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);

  const steps = [
    { label: 'Criptare documente…', duration: 800 },
    { label: 'Verificare identitate digitala…', duration: 1000 },
    { label: 'Generare pachet de depunere…', duration: 900 },
    { label: 'Pachet pregatit pentru depunere!', duration: 0 },
  ];

  const run = async () => {
    setRunning(true);
    setStep(0);
    for (let i = 0; i < steps.length; i++) {
      setStep(i);
      if (steps[i].duration > 0) await new Promise(r => setTimeout(r, steps[i].duration));
    }
    setRunning(false);
  };

  return (
    <div className="rounded-2xl p-4" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <p className="text-xs font-semibold text-white mb-3 flex items-center gap-2">
        <Shield className="w-3.5 h-3.5 text-primary" />
        Simulare depunere digitala (viitor)
      </p>
      {running || step > 0 ? (
        <div className="space-y-2 mb-3">
          {steps.map((s, i) => (
            <div key={i} className={`flex items-center gap-2 text-xs transition-all ${i <= step ? '' : 'opacity-20'}`}>
              {i < step ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              ) : i === step && running ? (
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
              ) : i === step && !running ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" />
              )}
              <span className={i <= step ? (i === step && !running ? 'text-success' : 'text-slate-300') : 'text-slate-600'}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      ) : null}
      {!running && step === steps.length - 1 ? (
        <div className="rounded-xl p-3 bg-success/10 border border-success/20 text-xs text-success text-center">
          ✓ Pachet generat! Depunere online disponibila in viitor via gov.ro
        </div>
      ) : (
        <button
          onClick={run}
          disabled={running}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          {running ? 'Procesare…' : '→ Simuleaza depunere digitala'}
        </button>
      )}
      <p className="text-[10px] text-slate-600 mt-2 text-center">Functionalitate viitoare — infrastructura gov.ro</p>
    </div>
  );
}

// ── Institution Card ───────────────────────────────────────────────────────
function InstitutionCard({ inst }) {
  const queueColor = inst.queue <= 20 ? '#22c55e' : inst.queue <= 40 ? '#facc15' : '#ef4444';

  return (
    <div className="rounded-2xl p-4" style={{ border: '1px solid rgba(37,99,235,0.2)', background: 'rgba(37,99,235,0.05)' }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-sm font-bold text-white leading-tight">{inst.name}</p>
          <p className="text-xs text-slate-400 mt-1 flex items-start gap-1">
            <MapPin className="w-3 h-3 shrink-0 mt-0.5" />{inst.address}
          </p>
        </div>
        <div className="text-center shrink-0">
          <div className="text-lg font-bold" style={{ color: queueColor }}>~{inst.queue} min</div>
          <div className="text-[10px] text-slate-500">coadă</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="text-xs font-semibold text-white">258 RON</div>
          <div className="text-[10px] text-slate-500">Standard</div>
        </div>
        <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
          <div className="text-xs font-semibold text-warning">958 RON</div>
          <div className="text-[10px] text-slate-500">Urgenta</div>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-[10px] text-warning mb-3">
        <Clock className="w-3 h-3" />
        Cel mai bun moment: {inst.bestTime}
      </div>

      <div className="flex gap-2 flex-wrap">
        <a href={inst.appointmentUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-primary/15 text-primary border border-primary/25 hover:bg-primary/25 transition-colors">
          <ExternalLink className="w-3 h-3" /> Programare
        </a>
        <a href={inst.mapsUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors">
          <MapPin className="w-3 h-3" /> Harti
        </a>
        <a href={`tel:${inst.phone}`}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors">
          <Phone className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function PassportDemo() {
  const [phase, setPhase] = useState('login'); // login | command | workflow
  const [profile, setProfile] = useState(null);
  const [packet, setPacket] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const workflowRef = useRef(null);

  // Load profile after login
  const handleLoginSuccess = async () => {
    setPhase('command');
    try {
      const user = await base44.auth.me();
      if (user?.email) {
        const profiles = await base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1);
        setProfile(profiles?.[0] || { first_name: 'Demo', last_name: 'User', full_name: 'Demo User' });
      }
    } catch {
      setProfile({ first_name: 'Demo', last_name: 'User', full_name: 'Demo User' });
    }
  };

  const handleLaunch = async (text) => {
    setPhase('workflow');
    setGenerating(true);
    setCurrentStep(0);

    const steps = [
      { delay: 300,  step: 0 },
      { delay: 800,  step: 1 },
      { delay: 1400, step: 2 },
      { delay: 2000, step: 3 },
      { delay: 2600, step: 4 },
    ];

    for (const s of steps) {
      await new Promise(r => setTimeout(r, s.delay === 300 ? 300 : s.delay - (steps[steps.indexOf(s) - 1]?.delay || 0)));
      setCurrentStep(s.step);
    }

    const pkt = generatePreparationPacket(profile || {});
    setPacket(pkt);
    setGenerating(false);

    setTimeout(() => workflowRef.current?.scrollIntoView({ behavior: 'smooth' }), 200);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between sticky top-0 z-50 bg-background/80 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Inapoi</span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue</span>
          <span className="hidden sm:inline text-xs text-slate-500">· Demo Pasaport</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs text-slate-500 hidden sm:inline">Sesiune securizata</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Hero heading */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-warning/10 border border-warning/20 mb-4">
            <span className="text-xs font-semibold text-warning">✈️ Demo MVP · ClujHackathon 2026</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
            Pasaport Pierdut →<br />
            <span className="text-primary">Inlocuire Digitala de Acasa</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Demonstram viitorul birocrației digitale in Romania. Fara deplasari inutile. Fara documente lipsa.
          </p>
        </motion.div>

        {/* Step progress (visible during workflow) */}
        {(phase === 'workflow') && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
            <StepProgress currentStep={currentStep} />
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {/* PHASE: Login */}
          {phase === 'login' && (
            <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-6">
                <p className="text-xs text-slate-500">Pasul 1: Autentificare securizata (ROeID simulat)</p>
              </div>
              <ROeIDLogin onSuccess={handleLoginSuccess} />
            </motion.div>
          )}

          {/* PHASE: Command */}
          {phase === 'command' && (
            <motion.div key="command" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {profile && (
                <div className="mb-4 p-3 rounded-2xl flex items-center gap-3" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-success">Identity Vault incarcat</p>
                    <p className="text-[10px] text-slate-400">{profile.full_name || `${profile.first_name} ${profile.last_name}`} · Date securizate</p>
                  </div>
                </div>
              )}
              <div className="text-center mb-4">
                <p className="text-xs text-slate-500">Pasul 2: Spune ce ai nevoie (voce sau text)</p>
              </div>
              <CommandBar onLaunch={handleLaunch} />
            </motion.div>
          )}

          {/* PHASE: Workflow generating */}
          {phase === 'workflow' && generating && (
            <motion.div key="generating" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/15 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                  <Zap className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
              <p className="text-sm font-semibold text-white">
                {PASSPORT_LOSS_STEPS[currentStep]?.description || 'Procesez…'}
              </p>
              <p className="text-xs text-slate-500">Generez pachetul de documente din Identity Vault…</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* WORKFLOW RESULT */}
        <AnimatePresence>
          {phase === 'workflow' && !generating && packet && (
            <motion.div ref={workflowRef} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 mt-2">

              {/* Completeness banner */}
              <div className="rounded-2xl p-4" style={{
                background: packet.completeness >= 70 ? 'rgba(34,197,94,0.06)' : 'rgba(250,204,21,0.06)',
                border: `1px solid ${packet.completeness >= 70 ? 'rgba(34,197,94,0.2)' : 'rgba(250,204,21,0.2)'}`,
              }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-white">Completitudine profil</span>
                  <span className="text-lg font-bold" style={{ color: packet.completeness >= 70 ? '#22c55e' : '#facc15' }}>
                    {packet.completeness}%
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }}
                    animate={{ width: `${packet.completeness}%` }}
                    style={{ background: packet.completeness >= 70 ? '#22c55e' : '#facc15' }}
                  />
                </div>
                {packet.missingFields.length > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-warning">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Campuri lipsa: {packet.missingFields.join(', ')}
                    <Link to="/vault" className="text-primary hover:underline ml-1">→ Completeaza Seif</Link>
                  </div>
                )}
              </div>

              {/* Loss Declaration */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Declaratie Generata Automat</span>
                </div>
                <DeclarationCard declaration={packet.declaration} />
              </div>

              {/* Required Documents Checklist */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-white">Documente Necesare</span>
                </div>
                <DocChecklist docs={PASSPORT_REQUIRED_DOCS} vaultProfile={profile} />
              </div>

              {/* Institution */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Institutie & Programare</span>
                </div>
                <InstitutionCard inst={PASSPORT_INSTITUTION} />
              </div>

              {/* Online Resources */}
              <div>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <Globe className="w-3.5 h-3.5 text-accent" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Resurse Oficiale Online</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-2">
                  {ONLINE_RESOURCES.map((r, i) => (
                    <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors"
                      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-base">{r.icon}</span>
                      <span className="text-xs text-slate-300 flex-1 leading-tight">{r.label}</span>
                      <ExternalLink className="w-3 h-3 text-slate-600 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>

              {/* Digital submission simulation */}
              <SubmissionSimulator />

              {/* Footer note */}
              <div className="rounded-2xl p-4 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-xs text-slate-400 mb-1">
                  ⚖️ Documentele generate sunt ciorne orientative. Verifica cerintele finale la ghiseu.
                </p>
                <p className="text-[10px] text-slate-600">
                  NoQueue simulează infrastructura digitală necesară pentru birocrație 100% online în România.
                </p>
              </div>

              {/* Restart */}
              <div className="flex justify-center pt-2">
                <button onClick={() => { setPhase('command'); setPacket(null); setCurrentStep(0); }}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1.5">
                  ↩ Restart demo
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}