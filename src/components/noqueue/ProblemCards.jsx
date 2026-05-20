import React from 'react';
import { motion } from 'framer-motion';
import { FileX, MapPinOff, Clock, Languages, RotateCcw, Wifi } from 'lucide-react';

const problems = [
  {
    icon: FileX,
    title: 'Missing Documents',
    problem: 'Citizens arrive at institutions without the correct documents.',
    solution: 'AI generates a personalized checklist and warns about commonly forgotten items.',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
  },
  {
    icon: MapPinOff,
    title: 'Wrong Institution',
    problem: 'People go to the wrong office because responsibilities are split across many agencies.',
    solution: 'Institution router recommends the right office for your specific need.',
    color: 'text-warning',
    bg: 'bg-warning/10',
  },
  {
    icon: Clock,
    title: 'Queue Uncertainty',
    problem: 'Citizens do not know when offices are crowded.',
    solution: 'Synthetic queue estimator recommends best visiting hours.',
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Languages,
    title: 'Institutional Jargon',
    problem: 'Official pages are difficult to understand.',
    solution: 'Plain-language civic guidance that anyone can follow.',
    color: 'text-accent',
    bg: 'bg-accent/10',
  },
  {
    icon: RotateCcw,
    title: 'Repeated Visits',
    problem: 'People must return multiple times due to missing forms or expired documents.',
    solution: 'Readiness score checks everything before you visit.',
    color: 'text-success',
    bg: 'bg-success/10',
  },
  {
    icon: Wifi,
    title: 'Fragmented Digital Services',
    problem: 'Some things are online, others physical — citizens don\'t know which is which.',
    solution: 'Online/offline route planner shows the fastest path.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
];

export default function ProblemCards() {
  return (
    <section id="problems" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">The problem</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">What NoQueue Fixes</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Romanian bureaucracy wastes hundreds of hours per citizen. Here are the critical problems we solve.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {problems.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="glass-card rounded-2xl p-6 hover:border-white/10 transition-all group"
            >
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl ${p.bg} mb-4`}>
                <p.icon className={`w-5 h-5 ${p.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{p.title}</h3>
              <p className="text-sm text-slate-400 mb-3">{p.problem}</p>
              <div className="pt-3 border-t border-white/5">
                <p className="text-sm text-slate-300">
                  <span className="text-primary font-medium">NoQueue: </span>{p.solution}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}