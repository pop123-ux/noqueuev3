/**
 * StepProgressBar — Animated horizontal step indicator for onboarding
 */
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { STATE_ORDER, STATE_LABELS, STATES } from '@/state/onboardingStateMachine';

export default function StepProgressBar({ currentState }) {
  const currentIdx = STATE_ORDER.indexOf(currentState);
  const isComplete = currentState === STATES.COMPLETE;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-1.5">
        {STATE_ORDER.map((s, i) => {
          const done = isComplete || i < currentIdx;
          const active = i === currentIdx;
          return (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center flex-1 min-w-0">
                <motion.div
                  initial={false}
                  animate={{
                    scale: active ? 1.1 : 1,
                    backgroundColor: done ? '#22c55e' : active ? 'rgb(37,99,235)' : 'rgba(255,255,255,0.05)',
                    borderColor: done ? '#22c55e' : active ? 'rgb(37,99,235)' : 'rgba(255,255,255,0.10)',
                  }}
                  className="w-7 h-7 rounded-full flex items-center justify-center border-2 shrink-0"
                >
                  {done ? <CheckCircle2 className="w-3.5 h-3.5 text-white" /> : (
                    <span className={`text-[10px] font-bold ${active ? 'text-white' : 'text-slate-500'}`}>{i + 1}</span>
                  )}
                </motion.div>
                <span className={`text-[9px] font-medium mt-1.5 truncate ${active ? 'text-white' : done ? 'text-green-400' : 'text-slate-600'}`}>
                  {STATE_LABELS[s]}
                </span>
              </div>
              {i < STATE_ORDER.length - 1 && (
                <div className="flex-1 h-px relative -mt-4">
                  <div className="absolute inset-0 bg-white/10" />
                  <motion.div
                    initial={false}
                    animate={{ width: done ? '100%' : '0%' }}
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}