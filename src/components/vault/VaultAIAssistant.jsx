/**
 * VaultAIAssistant — Inline AI chat assistant focused on government workflows
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, X, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ReactMarkdown from 'react-markdown';

const QUICK_PROMPTS = [
  "What do I need for passport renewal?",
  "How to get a criminal record certificate?",
  "Can I update my ID online?",
  "What documents do I need after marriage?",
];

function Message({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-3 h-3 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
          isUser
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-white/5 border border-white/8 text-slate-200 rounded-bl-sm'
        }`}
      >
        {isUser ? msg.content : (
          <ReactMarkdown
            className="prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1 [&_ul]:my-1 [&_li]:my-0"
          >{msg.content}</ReactMarkdown>
        )}
      </div>
    </div>
  );
}

export default function VaultAIAssistant({ docs }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Bună! 👋 I\'m your civic AI assistant. Ask me anything about Romanian government procedures, document requirements, or how to use your vault documents.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  async function send(text) {
    const userMsg = text || input.trim();
    if (!userMsg || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    const docSummary = docs.slice(0, 8).map(d =>
      `${d.document_type}: ${d.document_title || d.document_type}${d.expiry_date ? `, expires ${d.expiry_date}` : ''}`
    ).join('\n');

    const context = docSummary ? `\n\nUser's vault documents:\n${docSummary}` : '';

    const reply = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a civic AI assistant for Romanian citizens managing government documents in Cluj-Napoca.
Help the user understand bureaucratic procedures, document requirements, and government workflows.
Be concise, practical, and friendly. Use bullet points for lists. Respond in the same language the user writes in.
When relevant, mention specific Cluj-Napoca institutions (SPCLEP, Pașapoarte, DRPCIV, ANAF, CJAS, IPJ Cluj etc.)${context}

User question: "${userMsg}"`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-6">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/3 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-semibold text-white">AI Civic Assistant</div>
            <div className="text-[10px] text-slate-500">Ask anything about government procedures</div>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-white/5"
          >
            <div className="p-4">
              {/* Quick prompts */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {QUICK_PROMPTS.map(p => (
                  <button
                    key={p}
                    onClick={() => send(p)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Messages */}
              <div className="space-y-3 max-h-60 overflow-y-auto mb-3 pr-1">
                {messages.map((m, i) => <Message key={i} msg={m} />)}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      <Sparkles className="w-3 h-3 text-primary" />
                    </div>
                    <div className="px-3 py-2 rounded-2xl bg-white/5 border border-white/8">
                      <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && send()}
                  placeholder="Ask about any government procedure..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/40"
                />
                <button
                  onClick={() => send()}
                  disabled={!input.trim() || loading}
                  className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}