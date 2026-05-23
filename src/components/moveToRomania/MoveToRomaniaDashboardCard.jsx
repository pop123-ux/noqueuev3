/**
 * Move to Romania — beautiful card shown on the main dashboard / home
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Globe2, Clock, MapPin } from 'lucide-react';

export default function MoveToRomaniaDashboardCard() {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">New module</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">For everyone, including newcomers</h2>
          <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
            NoQueue helps citizens, students, workers, families and entrepreneurs cut through bureaucracy. New to Romania? We have a dedicated flow for that too.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative glass-card rounded-3xl overflow-hidden glow-blue p-6 sm:p-8"
        >
          {/* Background glow */}
          <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18), transparent 70%)' }} />
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-3xl pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.18), transparent 70%)' }} />

          <div className="relative grid lg:grid-cols-2 gap-6 items-center">
            {/* Left */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-4">
                <Globe2 className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">Move to Romania</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                New to Romania? Get your <span className="text-primary">personalized</span> bureaucracy plan.
              </h3>
              <p className="text-sm text-slate-400 mb-5 leading-relaxed">
                A step-by-step checklist for residence permits, healthcare, taxes and city hall — translated to your language, mapped to real Cluj institutions.
              </p>

              <div className="flex flex-wrap gap-3 mb-5">
                <Link to="/move-to-romania">
                  <button className="inline-flex items-center gap-2 px-5 h-11 rounded-2xl text-sm font-semibold bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 transition-opacity">
                    Start integration flow <ArrowRight className="w-4 h-4" />
                  </button>
                </Link>
                <Link to="/move-to-romania?tab=checklist">
                  <button className="inline-flex items-center gap-2 px-5 h-11 rounded-2xl text-sm font-semibold border border-white/15 text-slate-200 hover:bg-white/5 transition-colors">
                    Continue checklist
                  </button>
                </Link>
              </div>

              <div className="flex items-center gap-2 text-xs text-success">
                <Clock className="w-3.5 h-3.5" />
                <span><strong className="text-white">Estimated time saved:</strong> 4–8 hours</span>
              </div>
            </div>

            {/* Right preview */}
            <div className="hidden lg:block">
              <div className="space-y-2.5">
                {[
                  { icon: '🛂', text: 'Residence permit', status: 'Missing docs', color: '#facc15' },
                  { icon: '🏥', text: 'Health insurance (CNAS)', status: 'Appointment needed', color: '#8b5cf6' },
                  { icon: '💼', text: 'ANAF tax registration', status: 'Ready to submit', color: '#06b6d4' },
                  { icon: '🏦', text: 'Open bank account', status: 'Completed', color: '#22c55e' },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + i * 0.08 }}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span className="flex-1 text-sm text-white">{item.text}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ background: `${item.color}22`, color: item.color, border: `1px solid ${item.color}55` }}>
                      {item.status}
                    </span>
                  </motion.div>
                ))}
                <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-500">
                  <MapPin className="w-3 h-3" />
                  <span>9 steps · Mapped to real Cluj institutions · 4 languages</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}