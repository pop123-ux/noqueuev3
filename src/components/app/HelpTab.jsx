/**
 * HelpTab — AI Civic Assistant chat interface
 * Reuses existing routing logic from NoQueueAIChat
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Send, RefreshCw } from 'lucide-react';
import { routeByText, detectSpecialIntent } from '@/lib/assistant/procedureRouter';
import { clujInstitutions } from '@/lib/data/clujInstitutions';
import ProcedureResultCard from '@/components/assistant/ProcedureResultCard';
import VoiceInputButton from '@/components/assistant/VoiceInputButton';

const EXAMPLES = [
  'Am nevoie de pasaport urgent',
  'Mi-am pierdut buletinul',
  'Reinnoire permis auto',
  'Cazier judiciar',
];

// Compact queue card
function QueueCard() {
  const sorted = [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current).slice(0, 4);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4"
      style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
    >
      <p className="text-xs font-bold text-white mb-3 flex items-center gap-2">
        ⏱️ <span>Cozi acum în Cluj-Napoca</span>
      </p>
      <div className="space-y-2">
        {sorted.map((inst) => {
          const color = inst.queue.current <= 20 ? '#22c55e' : inst.queue.current <= 35 ? '#facc15' : '#ef4444';
          return (
            <div key={inst.id} className="flex items-center justify-between py-1 border-b last:border-0" style={{ borderColor: '#1E1E2E' }}>
              <span className="text-xs text-slate-300 truncate pr-2">{inst.name}</span>
              <span className="text-sm font-bold shrink-0" style={{ color }}>~{inst.queue.current} min</span>
            </div>
          );
        })}
      </div>
      <p className="text-[9px] text-slate-600 mt-3">Date simulate • demo MVP</p>
    </motion.div>
  );
}

// Chat message bubble
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    >
      {isUser ? (
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white"
          style={{ background: '#3B82F6' }}
        >
          {msg.text}
        </div>
      ) : (
        <div className="max-w-full w-full">
          {msg.type === 'workflow' && <ProcedureResultCard workflow={msg.workflow} />}
          {msg.type === 'queue' && <QueueCard />}
          {msg.type === 'text' && (
            <div
              className="px-4 py-2.5 rounded-2xl rounded-tl-sm text-sm text-slate-200"
              style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
            >
              {msg.text}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

export default function HelpTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 320));

    // Route using existing engine
    const special = detectSpecialIntent(trimmed);
    if (special === 'queue-overview') {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'queue' }]);
    } else {
      const { routeByText } = await import('@/lib/assistant/procedureRouter');
      const workflow = routeByText(trimmed);
      if (workflow) {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'workflow', workflow }]);
      } else {
        setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'queue' }]);
      }
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const reset = () => setMessages([]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: '#13131A', borderBottom: '1px solid #1E1E2E' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: '#3B82F6' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">NoQueue AI</p>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#22c55e' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Asistent civic activ
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-6 pb-8"
          >
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}
              >
                <Zap className="w-8 h-8" style={{ color: '#3B82F6' }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Asistent Civic AI</h2>
              <p className="text-sm text-slate-500 max-w-xs text-center">
                Spune-mi ce act îți trebuie și primești instant documentele, pașii și instituția.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold text-center mb-3">Încearcă</p>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => sendMessage(ex)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm text-slate-300 hover:text-white transition-all active:scale-[0.98]"
                  style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && (
              <div className="flex gap-1 ml-1 mb-3">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#3B82F6' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-4 pt-3"
        style={{ background: '#13131A', borderTop: '1px solid #1E1E2E' }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ex: Am pierdut pașaportul…"
            disabled={loading}
            className="flex-1 text-sm text-white placeholder:text-slate-600 px-4 py-3 rounded-2xl focus:outline-none transition-colors"
            style={{
              background: '#0A0A0F',
              border: '1px solid #1E1E2E',
            }}
          />
          <VoiceInputButton
            onTranscript={(t) => { setInput(t); sendMessage(t); }}
            language="ro-RO"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: '#3B82F6' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}