import React from 'react';
import { motion } from 'framer-motion';
import { UserCheck, RotateCcw, MessageSquare, Layers, Cpu } from 'lucide-react';

const pillars = [
  {
    icon: UserCheck,
    title: 'Citizen-First Services',
    description: 'Every interaction starts from the citizen\'s need, not the institution\'s process.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: RotateCcw,
    title: 'Reduced Repeated Visits',
    description: 'Readiness scores and document checklists eliminate unnecessary return trips.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: MessageSquare,
    title: 'Plain-Language Public Services',
    description: 'No institutional jargon. Every explanation written for real people.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: Layers,
    title: 'Interoperable Future Architecture',
    description: 'Designed to integrate with Romania\'s digital public services infrastructure.',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: Cpu,
    title: 'AI-Assisted Public Service Navigation',
    description: 'Intelligent routing, document preparation, and queue optimization powered by AI.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

export default function DigitalRomaniaFit() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Alignment</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">
            How NoQueue Supports Digital Romania
          </h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Built to align with Romania's national digital transformation strategy.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pillars.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`glass-card rounded-2xl p-6 text-center ${i === pillars.length - 1 && pillars.length % 2 !== 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl ${p.bg} mb-4`}>
                <p.icon className={`w-6 h-6 ${p.color}`} />
              </div>
              <h3 className="text-base font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{p.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}