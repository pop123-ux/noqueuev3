/**
 * CivicCopilot — Personal AI Agent page (NoQueue AI 2.0 — Pillar 2)
 *
 * Multi-conversation interface with the user's dedicated civic copilot agent.
 * Persists across sessions via base44.agents conversation SDK.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Zap, Bot, Loader2, Shield } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import CopilotMessage from '@/components/copilot/CopilotMessage';
import CopilotConversationList from '@/components/copilot/CopilotConversationList';
import CopilotSuggestions from '@/components/copilot/CopilotSuggestions';

const AGENT_NAME = 'civic_copilot';

export default function CivicCopilot() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const unsubRef = useRef(null);

  // ── Initial load ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        setConversations(list || []);
        if (list && list.length > 0) {
          await selectConversation(list[0].id);
        }
      } catch (err) {
        console.warn('Failed to load conversations', err);
      }
      setLoading(false);
    })();
    return () => { if (unsubRef.current) unsubRef.current(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Auto-scroll ──────────────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Conversation ops ─────────────────────────────────────────────

  const selectConversation = async (id) => {
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
    setActiveId(id);
    setMessages([]);
    try {
      const conv = await base44.agents.getConversation(id);
      setMessages(conv?.messages || []);
      unsubRef.current = base44.agents.subscribeToConversation(id, (data) => {
        setMessages(data?.messages || []);
      });
    } catch (err) {
      console.warn('Failed to load conversation', err);
    }
  };

  const createNewConversation = async () => {
    try {
      const conv = await base44.agents.createConversation({
        agent_name: AGENT_NAME,
        metadata: {
          name: `Conversație ${new Date().toLocaleDateString('ro-RO')}`,
          description: 'Civic Copilot session',
        },
      });
      const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      setConversations(list || []);
      await selectConversation(conv.id);
    } catch (err) {
      console.warn('Failed to create conversation', err);
    }
  };

  const deleteConversation = async (id) => {
    try {
      // Best-effort — SDK does not expose delete in current docs; we simply hide locally
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeId === id) {
        setActiveId(null);
        setMessages([]);
        if (unsubRef.current) { unsubRef.current(); unsubRef.current = null; }
      }
    } catch {}
  };

  const sendMessage = async (text) => {
    const content = (text ?? input).trim();
    if (!content || sending) return;
    setSending(true);
    setInput('');

    try {
      let convId = activeId;
      let conv;
      if (!convId) {
        conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: {
            name: content.slice(0, 40),
            description: 'Civic Copilot session',
          },
        });
        const list = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        setConversations(list || []);
        await selectConversation(conv.id);
        convId = conv.id;
      } else {
        conv = await base44.agents.getConversation(convId);
      }

      await base44.agents.addMessage(conv, { role: 'user', content });
    } catch (err) {
      console.warn('Send failed', err);
    }
    setSending(false);
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground font-inter relative">
      <div className="absolute top-0 left-1/3 w-[700px] h-[700px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 60%)' }} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
            <ArrowLeft className="w-3.5 h-3.5" /> Înapoi
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">NoQueue</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">2.0</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
          {/* Sidebar */}
          <aside className="hidden lg:block glass-card rounded-2xl p-3 h-[calc(100vh-140px)]">
            <CopilotConversationList
              conversations={conversations}
              activeId={activeId}
              onSelect={selectConversation}
              onNew={createNewConversation}
              onDelete={deleteConversation}
            />
          </aside>

          {/* Chat */}
          <main className="glass-card rounded-3xl flex flex-col h-[calc(100vh-140px)] glow-blue overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-blue">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-white">Civic Copilot</h1>
                  <p className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Shield className="w-3 h-3 text-green-400" />
                    Folosește contextul din Identity Vault
                  </p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[9px] font-bold text-accent uppercase tracking-wider">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-5 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <CopilotSuggestions onPick={sendMessage} />
              ) : (
                messages.map((m, i) => <CopilotMessage key={i} message={m} />)
              )}

              {sending && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Copilot se gândește...
                </div>
              )}
            </div>

            {/* Input */}
            <div className="border-t border-white/5 px-4 py-3">
              <form
                onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Întreabă orice despre documente, instituții, proceduri..."
                  disabled={sending}
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50"
                />
                <motion.button
                  whileHover={{ scale: input.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-40 flex items-center justify-center text-white transition-all"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </motion.button>
              </form>
              <p className="text-[10px] text-slate-600 mt-1.5 text-center">
                🧪 Prototip MVP — răspunsurile sunt generate de AI și pot conține erori. Verifică pe ghiseul.ro pentru informații oficiale.
              </p>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}