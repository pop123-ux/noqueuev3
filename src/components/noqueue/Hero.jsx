import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, Clock, RotateCcw, FileCheck, MapPin, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';

const metrics = [
{ icon: Clock, value: '35 min', label: 'Avg. time saved', color: 'text-primary' },
{ icon: RotateCcw, value: '68%', label: 'Fewer repeated visits', color: 'text-accent' },
{ icon: FileCheck, value: '15', label: 'Supported procedures', color: 'text-success' },
{ icon: MapPin, value: '15', label: 'Cluj institutions', color: 'text-warning' }];


export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}>
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-medium text-primary">ClujHackathon2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
              NoQueue
              <span className="block text-primary">Cluj</span>
            </h1>

            <p className="mt-3 text-xl sm:text-2xl font-semibold text-slate-200">
              Bureaucracy. Solved.
            </p>

            <p className="mt-4 text-base sm:text-lg text-slate-400 max-w-lg leading-relaxed">
              Platforma de automatizare civica AI care elimina deplasarile inutile la institutii. Birocratie romaneasca — rezolvata digital, de acasa.
            </p>

            <div className="flex flex-wrap gap-3 mt-8">
              <Link to="/demo/passport">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 h-12 text-base font-semibold gap-2">
                  ✈️ Demo Live: Pasaport Pierdut <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link to="/start">
                <Button size="lg" variant="outline" className="border-white/10 text-white hover:bg-white/5 rounded-2xl px-6 h-12 text-base font-semibold gap-2">
                  <Briefcase className="w-4 h-4" /> Toate Cazurile
                </Button>
              </Link>
              <Link to="/vault">
                <Button size="lg" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 rounded-2xl px-6 h-12 text-base font-semibold gap-2">
                  🔐 Identity Vault
                </Button>
              </Link>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
              {metrics.map((m, i) =>
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="text-center">
                
                  <m.icon className={`w-5 h-5 ${m.color} mx-auto mb-1`} />
                  <div className="text-2xl font-bold text-white">{m.value}</div>
                  <div className="text-xs text-slate-400">{m.label}</div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Right — floating AI preview */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="hidden lg:block">
            
            <div className="animate-float">
              <div className="glass-card rounded-3xl p-6 glow-blue max-w-md mx-auto">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="ml-2 text-xs text-slate-500 font-medium">NoQueue AI</span>
                </div>

                {/* User input simulation */}
                <div className="flex justify-end mb-3">
                  <div className="bg-primary/20 border border-primary/30 rounded-2xl rounded-br-md px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-white">🎤 "Am pierdut pasaportul"</p>
                  </div>
                </div>

                {/* Workflow result simulation */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    <span className="text-[10px] font-bold text-success uppercase tracking-wider">Workflow lansat instant</span>
                  </div>
                  <p className="text-xs font-semibold text-white">Pierdere Pasaport → Inlocuire</p>
                  <div className="grid grid-cols-3 gap-1.5">
                    {['📄 Declaratie', '✅ Checklist', '📅 Programare'].map(item => (
                      <div key={item} className="rounded-lg p-1.5 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <p className="text-[9px] text-slate-400 leading-tight">{item}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-[9px] text-slate-500">Identity Vault ✓</span>
                    <span className="text-[9px] text-primary font-semibold">~31 min coadă</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>);

}