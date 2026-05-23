/**
 * CopilotConversationList — sidebar listing past Copilot conversations
 */
import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, MessageCircle, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function CopilotConversationList({ conversations = [], activeId, onSelect, onNew, onDelete }) {
  return (
    <div className="h-full flex flex-col">
      <button
        onClick={onNew}
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm mb-3 transition-all"
      >
        <MessageSquarePlus className="w-4 h-4" />
        Conversație nouă
      </button>

      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {conversations.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6">Nicio conversație încă.</p>
        ) : (
          conversations.map(c => {
            const isActive = c.id === activeId;
            const name = c.metadata?.name || 'Conversație';
            const updated = c.updated_date || c.created_date;
            return (
              <motion.div
                key={c.id}
                whileHover={{ x: 2 }}
                onClick={() => onSelect(c.id)}
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                  isActive ? 'bg-primary/15 border border-primary/30' : 'hover:bg-white/5 border border-transparent'
                }`}
              >
                <MessageCircle className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-primary' : 'text-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                    {name}
                  </p>
                  {updated && (
                    <p className="text-[10px] text-slate-600">
                      {formatDistanceToNow(new Date(updated), { addSuffix: true })}
                    </p>
                  )}
                </div>
                <button
                  onClick={e => { e.stopPropagation(); onDelete(c.id); }}
                  className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-destructive transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}