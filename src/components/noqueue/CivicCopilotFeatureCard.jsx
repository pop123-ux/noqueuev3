/**
 * CivicCopilotFeatureCard — Home promo for the Personal AI Agent
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Bot, MessageSquare, ArrowRight, Shield, Brain, Zap } from 'lucide-react';

export default function CivicCopilotFeatureCard() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden glass-card p-8 sm:p-12"
          style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(6,182,212,0.05))' }}
        >
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(34,197,94,0.4) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)' }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/25 mb-4">
                <Bot className="w-3 h-3 text-green-400" />
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-wider">NEW · NoQueue AI 2.0</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                Asistentul tău <br />personal civic
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
                Un agent AI dedicat, care îți cunoaște documentele și istoricul. Conversații care durează săptămâni — își amintește totul.
              </p>

              <div className="space-y-2.5 mb-7">
                {[
                  { icon: Brain, color: 'text-green-400', text: 'Memorie persistentă între conversații' },
                  { icon: Shield, color: 'text-accent', text: 'Acces sigur la Identity Vault' },
                  { icon: Zap, color: 'text-primary', text: 'Răspunsuri hiper-personalizate' },
                ].map(({ icon: Icon, color, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Icon className={`w-4 h-4 ${color} shrink-0`} />
                    {text}
                  </div>
                ))}
              </div>

              <Link to="/copilot">
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-green-500 hover:bg-green-600 text-white font-semibold text-sm transition-all hover:scale-[1.02]">
                  <MessageSquare className="w-4 h-4" />
                  Vorbește cu Copilotul
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Chat mockup */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl p-4 backdrop-blur space-y-3"
                style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-xs font-bold text-white">Civic Copilot</p>
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                </div>

                {/* Messages */}
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-white/[0.04] border border-white/8">
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Bună, Darius! Văd că pașaportul tău expiră în <strong className="text-warning">47 zile</strong>. Vrei să încep procesul de reînnoire?
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-primary">
                    <p className="text-[11px] text-white leading-relaxed">Da, ce trebuie să fac?</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl px-3 py-2 bg-white/[0.04] border border-white/8">
                    <p className="text-[11px] text-slate-200 leading-relaxed">
                      Am pre-completat cererea cu datele tale. Trebuie doar:
                      <br />1. Programare la <span className="text-accent font-semibold">SPCP Cluj</span>
                      <br />2. Taxă: <span className="text-accent font-semibold">258 lei</span>
                      <br />3. Poză recentă
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}