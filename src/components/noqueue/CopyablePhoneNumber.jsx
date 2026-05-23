import React, { useState } from 'react';
import { Phone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CopyablePhoneNumber({ phone }) {
  const [state, setState] = useState('idle'); // 'idle' | 'success' | 'error'

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setState('success');
    } catch {
      setState('error');
    }
    setTimeout(() => setState('idle'), 2000);
  };

  return (
    <div className="relative flex items-center gap-1.5">
      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />

      <button
        onClick={handleCopy}
        title="Click pentru copiere"
        aria-label={`Copiază numărul ${phone}`}
        className={`
          group flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 -ml-2
          transition-all duration-150 cursor-pointer select-none
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60
          ${state === 'success'
            ? 'bg-success/10 text-success'
            : state === 'error'
            ? 'bg-destructive/10 text-destructive'
            : 'text-slate-400 hover:bg-white/8 hover:text-white active:scale-95'
          }
        `}
      >
        <motion.span
          key={state}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
          className="font-mono"
        >
          {state === 'success' ? 'Număr copiat în clipboard' : state === 'error' ? 'Copiere nereușită' : phone}
        </motion.span>

        <AnimatePresence mode="wait">
          {state === 'success' ? (
            <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-3 h-3" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Copy className="w-3 h-3" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}