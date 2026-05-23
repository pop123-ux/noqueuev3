/**
 * SmartDocPipeline — animated 4-step progress indicator
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { ANALYSIS_STEPS } from '@/services/documents/smartDocumentAnalyzer';

export default function SmartDocPipeline({ currentStep, currentLabel }) {
  return (
    <div className="rounded-3xl p-8" style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-center mb-6">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
      <p className="text-center text-sm font-semibold text-white mb-1">{currentLabel || 'Procesare...'}</p>
      <p className="text-center text-xs text-slate-500 mb-6">Pasul {currentStep + 1} din {ANALYSIS_STEPS.length}</p>

      <div className="space-y-2">
        {ANALYSIS_STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: done || active ? 1 : 0.4 }}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
              style={{
                background: active ? 'rgba(37,99,235,0.10)' : done ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? 'rgba(37,99,235,0.30)' : done ? 'rgba(34,197,94,0.25)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <span className="text-lg shrink-0">{step.icon}</span>
              <span className={`text-sm flex-1 ${done ? 'text-green-400' : active ? 'text-white font-semibold' : 'text-slate-500'}`}>
                {step.label}
              </span>
              {done && <CheckCircle2 className="w-4 h-4 text-green-400" />}
              {active && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}