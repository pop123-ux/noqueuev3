/**
 * DocumentActionPanel — Smart AI-powered contextual actions for each document
 * Feels like Apple Wallet meets a government portal
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ExternalLink, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSmartActions } from '@/lib/data/vaultActions';

function ActionButton({ action, onTrigger }) {
  const [loading, setLoading] = useState(false);

  async function handle() {
    setLoading(true);
    await onTrigger(action);
    setLoading(false);
  }

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={handle}
      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all text-left group"
      style={{ background: `${action.color}08`, border: `1px solid ${action.color}18` }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 transition-transform group-hover:scale-110"
        style={{ background: `${action.color}15` }}
      >
        {action.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white">{action.label}</div>
        <div className="text-[10px] text-slate-500 truncate">{action.description}</div>
      </div>
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin shrink-0" />
      ) : action.url ? (
        <ExternalLink className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
      ) : (
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 shrink-0 transition-colors" />
      )}
    </motion.button>
  );
}

export default function DocumentActionPanel({ doc, onStartCase }) {
  const navigate = useNavigate();
  const actions = getSmartActions(doc);

  async function handleAction(action) {
    if (action.url) {
      window.open(action.url, '_blank', 'noopener,noreferrer');
      return;
    }
    if (action.institutionId || action.procedureKey) {
      // Navigate to CaseStart with pre-filled context
      const params = new URLSearchParams();
      if (action.procedureKey) params.set('procedure', action.procedureKey);
      if (action.institutionId) params.set('institution', action.institutionId);
      params.set('from_vault', '1');
      navigate(`/start?${params.toString()}`);
      return;
    }
    onStartCase?.(action);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5 mb-3">
        <Zap className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Smart Actions</span>
      </div>
      {actions.map(action => (
        <ActionButton key={action.id} action={action} onTrigger={handleAction} />
      ))}
    </div>
  );
}