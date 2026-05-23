import React, { useRef } from 'react';
import { motion } from 'framer-motion';

const ACTIONS = [
  { id: 'renew-id',        emoji: '🪪', label: 'Reinnoire Buletin' },
  { id: 'passport',        emoji: '✈️', label: 'Pasaport' },
  { id: 'anaf',            emoji: '💼', label: 'ANAF / SPV' },
  { id: 'driving',         emoji: '🚗', label: 'Permis Auto' },
  { id: 'health',          emoji: '🏥', label: 'Asigurare Sanatate' },
  { id: 'criminal-record', emoji: '📄', label: 'Cazier Judiciar' },
  { id: 'vehicle',         emoji: '🚘', label: 'Inmatriculare' },
  { id: 'address',         emoji: '🏠', label: 'Schimbare Adresa' },
  { id: 'queue',           emoji: '⏱️', label: 'Cozi Acum' },
];

export default function QuickActionCarousel({ onAction }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-none pb-1 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {ACTIONS.map((action, i) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => onAction(action.id)}
            className="flex flex-col items-center gap-1.5 px-3.5 py-2.5 rounded-2xl shrink-0 transition-all group"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              minWidth: '76px',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(37,99,235,0.12)';
              e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
            }}
          >
            <span className="text-xl leading-none">{action.emoji}</span>
            <span className="text-[10px] text-slate-400 group-hover:text-white font-medium text-center leading-tight transition-colors">
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}