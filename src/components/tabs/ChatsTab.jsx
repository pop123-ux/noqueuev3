/**
 * ChatsTab — AI civic assistant (workflow-first, not chatbot)
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';

const SUGGESTED = [
  { label: 'Cum îmi reînnoiesc pașaportul?',       icon: '🛂' },
  { label: 'Ce documente îmi expiră curând?',       icon: '📅' },
  { label: 'Pot reînnoi CI-ul online?',             icon: '🪪' },
  { label: 'Cum obțin cazier judiciar?',            icon: '📋' },
];

function CivicAnswer({ text }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl p-4 text-sm text-slate-300 leading-relaxed"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Răspuns NoQueue</span>
      </div>
      <p>{text}</p>
    </motion.div>
  );
}

export default function ChatsTab() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState(null);
  const [asked, setAsked] = useState('');

  const ask = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    setAsked(q);
    setAnswer(null);
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Ești un asistent civic pentru cetățeni din România. Răspunde concis și util la: "${q}". Focalizează pe pași practici, instituții, linkuri oficiale dacă există. Max 3 propoziții.`,
    });
    setAnswer(typeof res === 'string' ? res : res?.text || 'Nu am putut genera un răspuns.');
    setLoading(false);
    setQuery('');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Asistent civic</p>
        <h1 className="text-xl font-bold text-white">Întreabă NoQueue</h1>
        <p className="text-slate-500 text-sm mt-1">Răspunsuri rapide · Fluxuri automate · Fără birocrație</p>
      </div>

      {/* Input */}
      <div
        className="flex items-center gap-2 px-4 py-3 rounded-xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <input
          className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-600 focus:outline-none"
          placeholder="Ex: Cum reînnoiesc pașaportul expirat?"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask(query)}
        />
        <button
          onClick={() => ask(query)}
          disabled={loading || !query.trim()}
          className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-40"
          style={{ background: 'rgba(37,99,235,0.8)' }}
        >
          {loading
            ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <Send className="w-3.5 h-3.5 text-white" />
          }
        </button>
      </div>

      {/* Answer */}
      <AnimatePresence>
        {answer && <CivicAnswer text={answer} />}
      </AnimatePresence>

      {/* Suggestions */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-2.5">Întrebări frecvente</p>
        <div className="space-y-2">
          {SUGGESTED.map((s, i) => (
            <motion.button
              key={s.label}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => ask(s.label)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-white/[0.04] group"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <span className="text-base shrink-0">{s.icon}</span>
              <span className="flex-1 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">{s.label}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-slate-500 shrink-0 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Start a full case */}
      <Link
        to="/start"
        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl group transition-all hover:bg-white/[0.03]"
        style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.18)' }}
      >
        <div>
          <p className="text-sm font-semibold text-white">Deschide un caz complet</p>
          <p className="text-[11px] text-slate-500">Analiză AI · Plan pași · Generare documente</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors shrink-0" />
      </Link>
    </div>
  );
}