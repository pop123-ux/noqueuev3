import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, StarOff } from 'lucide-react';

const defaultActions = [
  { id: 'renew-id', label: 'Renew ID Card', prompt: 'I need to renew my ID card', emoji: '🪪' },
  { id: 'passport', label: 'Passport Renewal', prompt: 'I need to renew my passport', emoji: '✈️' },
  { id: 'anaf', label: 'ANAF Help', prompt: 'I have an ANAF tax issue', emoji: '💼' },
  { id: 'driving', label: 'Driving License', prompt: 'My driving license expired', emoji: '🚗' },
  { id: 'health', label: 'Health Insurance', prompt: 'I need to check my health insurance', emoji: '🏥' },
  { id: 'queue', label: 'Queue Estimates', prompt: 'Which office has the shortest queue?', emoji: '⏱️' },
  { id: 'online', label: 'Online Services', prompt: 'What can I do online?', emoji: '🌐' },
  { id: 'student', label: 'Student Help', prompt: 'I am a student and need help with administrative paperwork', emoji: '🎓' },
  { id: 'business', label: 'Start a Business', prompt: 'I want to register a company in Cluj', emoji: '🏢' },
  { id: 'criminal-record', label: 'Criminal Record', prompt: 'I need a criminal record certificate', emoji: '📄' },
  { id: 'vehicle', label: 'Register Car', prompt: 'I need to register my vehicle', emoji: '🚘' },
  { id: 'address', label: 'Change Address', prompt: 'I need to change my home address on my ID', emoji: '🏠' },
];

export default function QuickActions({ onPrompt, favorites, onToggleFavorite }) {
  const [showAll, setShowAll] = useState(false);
  const displayed = showAll ? defaultActions : defaultActions.slice(0, 6);

  return (
    <div className="px-4 pb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Quick Actions</span>
        <button
          onClick={() => setShowAll(!showAll)}
          className="text-[10px] text-primary hover:text-primary/80 transition-colors"
        >
          {showAll ? 'Show less' : `+${defaultActions.length - 6} more`}
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {displayed.map((action) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1 group"
          >
            <button
              onClick={() => onPrompt(action.prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-slate-300 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
            >
              <span>{action.emoji}</span>
              <span>{action.label}</span>
            </button>
            <button
              onClick={() => onToggleFavorite?.(action.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600 hover:text-warning"
            >
              {favorites?.includes(action.id)
                ? <Star className="w-3 h-3 text-warning" fill="currentColor" />
                : <StarOff className="w-3 h-3" />
              }
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}