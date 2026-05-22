import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Settings, Bot, Zap, ChevronDown, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import MessageBubble from './chat/MessageBubble';
import TypingIndicator from './chat/TypingIndicator';
import QuickActions from './chat/QuickActions';
import AISettingsPanel from './chat/AISettingsPanel';
import { defaultSettings, generateSystemPrompt } from '@/lib/data/aiPersonality';
import { buildClujResponse } from '@/lib/data/clujChatEngine';

const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `**Bună! Welcome to NoQueue AI** 🏙️\n\nI'm your dedicated civic assistant for **Cluj-Napoca**.\n\nI can help you navigate local bureaucracy — no jargon, no confusion. Tell me what you need and I'll guide you step by step.\n\n**Try asking me:**\n- "I lost my ID card"\n- "I need to renew my passport urgently"\n- "Which office has the shortest queue right now?"\n- "What can I solve online?"`,
};

export default function NoQueueAIChat({ onWorkflowDetected }) {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);
  const [favorites, setFavorites] = useState([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [context, setContext] = useState({});
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (!isTyping) scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;
    const handler = () => {
      setShowScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const handleSend = async (text) => {
    const msg = (text || input).trim();
    if (!msg || isTyping) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setIsTyping(true);

    // Simulate AI thinking time (realistic)
    const thinkTime = 600 + Math.random() * 1000;
    await new Promise(r => setTimeout(r, thinkTime));

    const response = buildClujResponse(msg, settings, messages, context);

    // Update context with detected workflow/institution
    if (response.workflowId) {
      setContext(prev => ({ ...prev, workflow: { id: response.workflowId }, stage: 'guidance' }));
    }
    if (response.institutionId) {
      setContext(prev => ({ ...prev, institution: { id: response.institutionId } }));
    }

    const aiMessage = {
      role: 'assistant',
      content: response.reply,
      workflowId: response.workflowId,
      institutionId: response.institutionId,
      documents: response.documents,
      warnings: response.warnings,
      followUpQuestion: response.followUpQuestion,
      type: response.type,
    };

    setMessages(prev => [...prev, aiMessage]);
    setIsTyping(false);

    if (response.workflowId) {
      onWorkflowDetected?.({ workflowId: response.workflowId, institutionId: response.institutionId });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setContext({});
  };

  const toggleFavorite = (id) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const isFirstMessage = messages.length <= 1;
  const textSize = settings.largerText ? 'text-base' : 'text-sm';

  return (
    <section id="chat" className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span className="text-xs font-medium text-primary">NoQueue AI • Cluj-Napoca Exclusive</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">AI Civic Assistant</h2>
          <p className="mt-3 text-slate-400">
            Cluj-Napoca's smartest bureaucracy navigator. Powered by AI.
          </p>
        </motion.div>

        {/* Chat container */}
        <div className={`glass-card rounded-3xl overflow-hidden glow-blue ${settings.highContrast ? 'border border-primary/30' : ''}`}>
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
                  <span>Cluj-Napoca specialist</span>
                  <span className="mx-1 text-slate-600">·</span>
                  <span className="capitalize text-primary">{settings.tone}</span>
                  <span className="mx-1 text-slate-600">·</span>
                  <span>{settings.language === 'romanian' ? 'Română' : settings.language === 'bilingual' ? 'Bilingual' : 'English'}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleReset}
                className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 transition-all"
                title="Reset conversation"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-xl transition-all ${showSettings ? 'text-primary bg-primary/10' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                >
                  <Settings className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showSettings && (
                    <AISettingsPanel
                      settings={settings}
                      onChange={setSettings}
                      onClose={() => setShowSettings(false)}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={chatRef}
            className="h-[460px] overflow-y-auto p-4 space-y-4 relative scroll-smooth"
          >
            <AnimatePresence>
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} largerText={settings.largerText} />
              ))}
            </AnimatePresence>

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Scroll to bottom */}
          <AnimatePresence>
            {showScrollDown && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={scrollToBottom}
                className="absolute right-6 bottom-32 z-20 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg"
              >
                <ChevronDown className="w-4 h-4 text-white" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Quick actions (only when conversation fresh) */}
          {isFirstMessage && (
            <QuickActions
              onPrompt={handleSend}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
            />
          )}

          {/* Input */}
          <div className="px-4 pb-4 pt-2 border-t border-white/5">
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={settings.language === 'romanian' ? 'Descrie problema ta birocratică...' : 'Describe your bureaucracy problem in Cluj...'}
                className={`flex-1 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500 rounded-2xl resize-none min-h-[44px] max-h-[120px] ${textSize} leading-relaxed`}
                rows={1}
                disabled={isTyping}
              />
              <Button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-primary hover:bg-primary/90 text-white rounded-2xl h-11 w-11 p-0 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-slate-600 mt-2 text-center">
              Enter to send • Shift+Enter for new line • Civic guidance only — not legal advice
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}