import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ReactMarkdown from 'react-markdown';
import { mockChatResponse } from '@/lib/data/mockChat';
import suggestedPrompts from '@/lib/data/suggestedPrompts';

export default function Chatbot({ onWorkflowDetected }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I'm your NoQueue AI civic copilot.\n\nI can help you navigate Romanian bureaucracy in Cluj-Napoca. Tell me what you need — like renewing your ID, getting a passport, or paying local taxes — and I'll guide you step by step.\n\nWhat do you need help with?"
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showPrompts, setShowPrompts] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    setInput('');
    setShowPrompts(false);
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(r => setTimeout(r, 800 + Math.random() * 1200));

    const response = mockChatResponse(msg);
    setMessages(prev => [...prev, { role: 'assistant', content: response.reply }]);
    setIsTyping(false);

    if (response.workflowId) {
      onWorkflowDetected?.(response);
    }
  };

  const categories = Object.entries(suggestedPrompts);
  const quickPrompts = [
    "I lost my ID card",
    "I need to renew my passport",
    "My driving license expired",
    "I need a fiscal certificate",
    "Which office has the shortest queue?"
  ];

  return (
    <section id="chat" className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">AI Assistant</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Civic Chatbot</h2>
          <p className="mt-3 text-slate-400">Ask anything about bureaucracy in Cluj-Napoca.</p>
        </motion.div>

        <div className="glass-card rounded-3xl overflow-hidden glow-blue">
          {/* Chat header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5">
            <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">NoQueue AI</p>
              <p className="text-[10px] text-success flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success" /> Online • Civic guidance
              </p>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[400px] overflow-y-auto p-4 space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-md'
                      : 'bg-white/5 border border-white/10 rounded-bl-md'
                  }`}>
                    {msg.role === 'user' ? (
                      <p className="text-sm">{msg.content}</p>
                    ) : (
                      <ReactMarkdown className="text-sm prose prose-sm prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_strong]:text-primary [&_li]:text-slate-300 [&_p]:text-slate-300 [&_p]:leading-relaxed">
                        {msg.content}
                      </ReactMarkdown>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center shrink-0 mt-1">
                      <User className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompts */}
          {messages.length <= 1 && (
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-1.5">
                {quickPrompts.map(p => (
                  <button
                    key={p}
                    onClick={() => handleSend(p)}
                    className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-white/5">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Describe your bureaucracy problem..."
                className="flex-1 bg-navy-700 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-11"
                disabled={isTyping}
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 w-11 p-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* All suggested prompts */}
        <div className="mt-6">
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="flex items-center gap-2 mx-auto text-sm text-slate-400 hover:text-white transition-colors"
          >
            {showPrompts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showPrompts ? 'Hide' : 'Show'} all suggested prompts
          </button>

          <AnimatePresence>
            {showPrompts && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  {categories.map(([cat, prompts]) => (
                    <div key={cat} className="glass-card rounded-2xl p-4">
                      <h4 className="text-sm font-semibold text-white mb-2">{cat}</h4>
                      <div className="space-y-1">
                        {prompts.map(p => (
                          <button
                            key={p}
                            onClick={() => handleSend(p)}
                            className="w-full text-left text-xs text-slate-400 hover:text-primary transition-colors py-1 px-2 rounded-lg hover:bg-white/5"
                          >
                            → {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}