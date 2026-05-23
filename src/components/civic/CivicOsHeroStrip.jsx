/**
 * CivicOsHeroStrip — promotes the new NoQueue OS / Life Events / Demo entry points on Home.
 * Purely additive surface; does not alter existing Home logic.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layers, Sparkles, Zap, ArrowRight } from 'lucide-react';

const TILES = [
  {
    to: '/os',
    icon: Layers,
    eyebrow: 'NoQueue OS',
    title: 'Your civic operating system',
    desc: 'Saved-time metrics, civic timeline, Digital Bureaucratic Passport.',
    accent: 'primary',
  },
  {
    to: '/life-events',
    icon: Sparkles,
    eyebrow: 'Life Events',
    title: 'What happened in your life?',
    desc: 'Bureaucracy assembled automatically from one life event.',
    accent: 'accent',
  },
  {
    to: '/run-demo',
    icon: Zap,
    eyebrow: '90-second demo',
    title: 'Run NoQueue in 90 seconds',
    desc: 'Scripted journey: identity → bundle → signature → saved time.',
    accent: 'amber',
  },
];

const accentMap = {
  primary: { ring: 'border-primary/30 hover:border-primary/60', icon: 'text-primary bg-primary/15 border-primary/30', label: 'text-primary' },
  accent:  { ring: 'border-accent/30 hover:border-accent/60',   icon: 'text-accent bg-accent/15 border-accent/30',   label: 'text-accent' },
  amber:   { ring: 'border-amber-500/30 hover:border-amber-500/60', icon: 'text-amber-300 bg-amber-500/15 border-amber-500/30', label: 'text-amber-300' },
};

export default function CivicOsHeroStrip() {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 -mt-8 pb-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid sm:grid-cols-3 gap-3">
          {TILES.map((t, i) => {
            const Icon = t.icon;
            const a = accentMap[t.accent];
            return (
              <motion.div
                key={t.to}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
              >
                <Link
                  to={t.to}
                  className={`block rounded-2xl p-4 border bg-white/[0.03] backdrop-blur hover:bg-white/[0.06] transition-all group ${a.ring}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${a.icon}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[9px] uppercase tracking-[0.18em] font-bold ${a.label}`}>{t.eyebrow}</p>
                      <p className="text-sm font-bold text-white leading-tight mt-0.5">{t.title}</p>
                      <p className="text-[11px] text-slate-400 mt-1 leading-snug">{t.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}