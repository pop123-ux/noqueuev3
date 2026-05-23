/**
 * PipelineProgress — Animated multi-step pipeline loading UI
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2 } from 'lucide-react';

const STEPS = [
  { icon: '🔍', label: 'Identificare procedura…' },
  { icon: '📋', label: 'Verificare cerinte & documente…' },
  { icon: '🏛️', label: 'Cautare institutie…' },
  { icon: '⚡', label: 'Pregatire pachet de actiuni…' },
];

export default function PipelineProgress({ currentStep = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center gap-5 p-8 flex-1"
    >
      {/* Main spinner */}
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-7 h-7 text-primary" />
        </motion.div>
      </div>

      {/* Step list */}
      <div className="w-full max-w-xs space-y-2">
        {STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: active || done ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
              style={{
                background: active ? 'rgba(59,130,246,0.1)' : done ? 'rgba(34,197,94,0.06)' : 'transparent',
                border: active ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
              }}
            >
              <span className="text-base">{step.icon}</span>
              <span className={`text-xs flex-1 ${active ? 'text-white font-semibold' : done ? 'text-green-400' : 'text-slate-500'}`}>
                {step.label}
              </span>
              {done && <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />}
              {active && (
                <motion.div
                  className="w-3.5 h-3.5 rounded-full border-2 border-primary border-t-transparent shrink-0"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}