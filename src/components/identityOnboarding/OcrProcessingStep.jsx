/**
 * OcrProcessingStep — Step 3: Animated OCR pipeline
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, CheckCircle2, ScanLine } from 'lucide-react';

const PIPELINE_STEPS = [
  { icon: '📸', label: 'Detectează cartea de identitate' },
  { icon: '🔄', label: 'Corectează perspectiva și luminozitatea' },
  { icon: '🔍', label: 'Extrage text cu OCR avansat' },
  { icon: '🇷🇴', label: 'Identifică câmpuri românești' },
  { icon: '✨', label: 'Verifică structura datelor' },
];

export default function OcrProcessingStep({ currentStep = 0, currentLabel = '' }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-6">
        <div className="relative inline-block mb-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-blue">
            <ScanLine className="w-10 h-10 text-white" />
          </div>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="absolute -inset-2 rounded-3xl border-2 border-primary/30 border-t-primary"
          />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Procesăm cartea de identitate</h2>
        <p className="text-sm text-slate-400">{currentLabel || 'Te rugăm să aștepți câteva secunde...'}</p>
      </div>

      <div className="space-y-2">
        {PIPELINE_STEPS.map((step, i) => {
          const done = i < currentStep;
          const active = i === currentStep;
          return (
            <motion.div
              key={step.label}
              initial={{ opacity: 0.4 }}
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
    </motion.div>
  );
}