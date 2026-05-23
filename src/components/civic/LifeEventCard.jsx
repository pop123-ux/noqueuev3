/**
 * LifeEventCard — one selectable life-event tile.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ArrowRight } from 'lucide-react';
import { LIFE_EVENT_CATEGORIES } from '@/lib/data/lifeEvents';

export default function LifeEventCard({ event, onSelect, loading }) {
  const cat = LIFE_EVENT_CATEGORIES[event.category] || LIFE_EVENT_CATEGORIES.civic;
  const hours = Math.round((event.estimatedSavedMin || 0) / 60);

  return (
    <motion.button
      onClick={() => onSelect?.(event)}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.98 }}
      disabled={loading}
      className="text-left rounded-2xl p-4 border bg-white/[0.03] hover:bg-white/[0.06] border-white/8 hover:border-white/20 transition-all relative group disabled:opacity-50"
      style={{ boxShadow: '0 0 0 0 transparent' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 border"
          style={{ background: `${cat.color}1a`, borderColor: `${cat.color}33` }}
        >
          {event.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: cat.color, background: `${cat.color}1a` }}
            >
              {cat.label}
            </span>
            {event.urgency === 'high' && (
              <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300">
                Urgent
              </span>
            )}
          </div>
          <p className="text-sm font-bold text-white leading-tight mb-1">{event.title}</p>
          <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">{event.description}</p>
          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-1 text-[10px] text-emerald-400/90">
              <Clock className="w-3 h-3" />
              <span>~{hours}h saved</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}