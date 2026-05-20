import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Lightbulb, Globe, Clock, MapPin, FileWarning } from 'lucide-react';

const alerts = [
  {
    icon: MapPin,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'You may be going to the wrong institution — ANAF handles national taxes, not City Hall.',
  },
  {
    icon: FileWarning,
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    text: 'This procedure usually requires proof of residence. Most people forget it.',
  },
  {
    icon: Globe,
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/20',
    text: 'This can partially be solved online. Check if an e-service is available first.',
  },
  {
    icon: Clock,
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/20',
    text: 'Avoid Monday mornings — queues are 2x longer than Wednesday afternoons.',
  },
  {
    icon: Lightbulb,
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    text: 'Pro tip: Bring a copy of everything. Many offices require both originals and copies.',
  },
  {
    icon: AlertCircle,
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    text: 'If you recently got married/divorced, update your civil status docs before renewing your ID.',
  },
];

export default function SmartRecommendations() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-warning">Proactive tips</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Smart Recommendations</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Common mistakes and proactive alerts to save you time and frustration.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-4">
          {alerts.map((a, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`flex items-start gap-3 p-4 rounded-2xl ${a.bg} border ${a.border}`}
            >
              <a.icon className={`w-5 h-5 ${a.color} shrink-0 mt-0.5`} />
              <p className="text-sm text-slate-200">{a.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}