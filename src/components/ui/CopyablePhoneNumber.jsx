import React, { useState } from 'react';
import { Phone, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CopyablePhoneNumber
 * Renders a phone number that copies to clipboard on click with toast feedback.
 */
export default function CopyablePhoneNumber({ phone, className = '' }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setError(false);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className={`relative flex items-center gap-1.5 group ${className}`}>
      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiază numărul ${phone} în clipboard`}
        title="Click pentru copiere"
        className={`flex items-center gap-1.5 text-xs rounded-lg px-2 py-1 -mx-2 -my-1 transition-all duration-150 cursor-pointer select-none
          ${copied
            ? 'text-success bg-success/10'
            : error
            ? 'text-destructive bg-destructive/10'
            : 'text-slate-400 hover:text-white hover:bg-white/8 active:scale-95'
          }
        `}
      >
        <span className="font-mono">{phone}</span>

        <AnimatePresence mode="wait">
          {copied ? (
            <motion.span
              key="check"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Check className="w-3 h-3 text-success" />
            </motion.span>
          ) : (
            <motion.span
              key="copy"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.5 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="group-hover:opacity-100 transition-opacity"
            >
              <Copy className="w-3 h-3" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      {/* Tooltip-style toast */}
      <AnimatePresence>
        {(copied || error) && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            className={`absolute left-0 -top-8 z-50 px-2.5 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap pointer-events-none
              ${copied ? 'bg-success text-white' : 'bg-destructive text-white'}
            `}
          >
            {copied ? 'Număr copiat în clipboard' : 'Copiere nereușită'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}