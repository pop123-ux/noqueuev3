import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, AlertTriangle, CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export default function DocumentChecklist({ workflow }) {
  const [checked, setChecked] = useState({});

  useEffect(() => {
    if (workflow) {
      setChecked({});
    }
  }, [workflow?.id]);

  if (!workflow) {
    return (
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Checklist</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Document Checklist</h2>
          <p className="mt-4 text-slate-400">
            Select a workflow above or ask the AI chatbot to generate your personalized document checklist.
          </p>
        </div>
      </section>
    );
  }

  const docs = workflow.documents;
  const total = docs.length;
  const checkedCount = Object.values(checked).filter(Boolean).length;
  const percentage = Math.round((checkedCount / total) * 100);
  const isReady = checkedCount === total;

  // Readiness score components
  const docScore = percentage;
  const institutionScore = 100; // always correct since we matched
  const queueScore = workflow.queue <= 25 ? 100 : workflow.queue <= 35 ? 70 : 40;
  const readiness = Math.round((docScore * 0.5) + (institutionScore * 0.25) + (queueScore * 0.25));

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Your checklist</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">{workflow.title}</h2>
          <p className="mt-2 text-slate-400">{workflow.description}</p>
        </motion.div>

        <div className="glass-card rounded-3xl p-6">
          {/* Progress */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-white">Documents Ready</span>
            <span className="text-sm font-semibold text-primary">{checkedCount}/{total}</span>
          </div>
          <Progress value={percentage} className="h-2 mb-6" />

          {/* Checklist items */}
          <div className="space-y-2">
            {docs.map((doc, i) => (
              <label
                key={i}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  checked[i] ? 'bg-success/5 border border-success/20' : 'bg-white/[0.02] border border-white/5 hover:border-white/10'
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={!!checked[i]}
                  onChange={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
                />
                {checked[i]
                  ? <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                  : <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                }
                <span className={`text-sm ${checked[i] ? 'text-slate-300 line-through' : 'text-white'}`}>
                  {doc}
                </span>
              </label>
            ))}
          </div>

          {/* Warning */}
          <div className="mt-5 flex items-start gap-2 p-3 rounded-xl bg-warning/5 border border-warning/20">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
            <span className="text-xs text-warning">{workflow.commonMistake}</span>
          </div>

          {/* Readiness score */}
          <div className="mt-6 pt-5 border-t border-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${readiness >= 80 ? 'text-success' : readiness >= 50 ? 'text-warning' : 'text-destructive'}`} />
                <span className="text-sm font-medium text-white">Visit Readiness</span>
              </div>
              <span className={`text-2xl font-bold ${readiness >= 80 ? 'text-success' : readiness >= 50 ? 'text-warning' : 'text-destructive'}`}>
                {readiness}%
              </span>
            </div>

            {isReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 p-4 rounded-2xl bg-success/10 border border-success/20 text-center"
              >
                <FileCheck className="w-6 h-6 text-success mx-auto mb-2" />
                <p className="text-sm font-semibold text-success">Ready to visit!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Best time: {workflow.bestTime} • Queue: ~{workflow.queue} min
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}