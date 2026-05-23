/**
 * SmartDocFeatureCard — promotes Smart Document Intelligence on Home
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, FileSearch, ArrowRight, ScanLine, ShieldCheck, BookOpen } from 'lucide-react';

export default function SmartDocFeatureCard() {
  return (
    <section className="py-20 sm:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[2rem] overflow-hidden glass-card p-8 sm:p-12 glow-blue"
        >
          {/* Decorative gradient orb */}
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 70%)' }} />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-4">
                <Sparkles className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">NEW · NoQueue AI 2.0</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
                Analiză inteligentă <br/>a oricărui document
              </h2>
              <p className="text-slate-400 text-sm sm:text-base mb-6 leading-relaxed">
                Buletin, pașaport, certificat, contract — încarcă-l și NoQueue AI extrage datele, verifică validitatea conform legislației și îți explică totul pe înțelesul tău.
              </p>

              <div className="space-y-2.5 mb-7">
                {[
                  { icon: ScanLine, color: 'text-primary', text: 'OCR + extragere automată câmpuri' },
                  { icon: ShieldCheck, color: 'text-green-400', text: 'Verifică expirarea și validitatea legală' },
                  { icon: BookOpen, color: 'text-accent', text: 'Glosar și explicații în română simplă' },
                ].map(({ icon: Icon, color, text }) => (
                  <div key={text} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Icon className={`w-4 h-4 ${color} shrink-0`} />
                    {text}
                  </div>
                ))}
              </div>

              <Link to="/smart-doc">
                <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm transition-all hover:scale-[1.02]">
                  <FileSearch className="w-4 h-4" />
                  Analizează un document
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>

            {/* Right visual mockup */}
            <div className="relative hidden lg:block">
              <div className="rounded-2xl p-5 backdrop-blur" style={{ background: 'rgba(15,23,42,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">Raport analiză</p>
                    <p className="text-[10px] text-slate-500">Pașaport simplu electronic</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"
                  style={{ background: 'rgba(250,204,21,0.10)', border: '1px solid rgba(250,204,21,0.30)' }}>
                  <span className="text-xs font-bold text-warning">⏱ Expiră în 47 zile</span>
                </div>

                <div className="space-y-2">
                  {[
                    { label: 'Serie', value: '058394' },
                    { label: 'Emis de', value: 'SPCP Cluj' },
                    { label: 'Valid până la', value: '09.07.2026' },
                  ].map(f => (
                    <div key={f.label} className="flex justify-between text-xs">
                      <span className="text-slate-500">{f.label}</span>
                      <span className="text-white font-mono">{f.value}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/5">
                  <p className="text-[10px] text-slate-500 mb-1.5 uppercase font-semibold">Următorul pas</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Programare reînnoire la <span className="text-primary font-semibold">SPCP Cluj</span> înainte de expirare.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}