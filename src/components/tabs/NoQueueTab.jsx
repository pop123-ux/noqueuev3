/**
 * NoQueueTab — Active civic workflows
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, RefreshCw, ShieldCheck } from 'lucide-react';

const QUICK_ACTIONS = [
  { label: 'Pașaport Pierdut',       href: '/demo/passport', icon: '🛂', desc: 'Generează cerere automată' },
  { label: 'Reînnoire CI',           href: '/start',         icon: '🪪', desc: 'Flux digital complet' },
  { label: 'Permis de Conducere',    href: '/start',         icon: '🚗', desc: 'Actualizare online' },
  { label: 'Card Sănătate',          href: '/start',         icon: '🏥', desc: 'Reînnoire rapidă' },
];

function WorkflowCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5"
      style={{ background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.18)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Activ</span>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 bg-white/[0.04] border border-white/[0.07] rounded-full px-2 py-0.5">
          Pasul 2 / 4
        </span>
      </div>

      <p className="text-base font-bold text-white mb-1">⚠️ Pașaport Pierdut</p>
      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Generare automată cerere nouă · Analiză documente biometrice
      </p>

      <div className="mb-4">
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #2563eb, #3b82f6)' }}
            initial={{ width: 0 }}
            animate={{ width: '50%' }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-600">Progres</span>
          <span className="text-[10px] text-primary font-semibold">50%</span>
        </div>
      </div>

      <Link
        to="/demo/passport"
        className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:brightness-110"
        style={{ background: 'linear-gradient(135deg, #1d4ed8, #2563eb)' }}
      >
        Continuă Fluxul
        <ArrowRight className="w-3.5 h-3.5" />
      </Link>
    </motion.div>
  );
}

export default function NoQueueTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Flux activ</p>
        <h1 className="text-xl font-bold text-white">Dosarele tale civice</h1>
        <p className="text-slate-500 text-sm mt-1">Progres automat · Fără cozi · Fără birocrație</p>
      </div>

      {/* Active workflow */}
      <WorkflowCard />

      {/* Quick actions */}
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600 mb-3">Acțiuni rapide</p>
        <div className="grid grid-cols-2 gap-2">
          {QUICK_ACTIONS.map((action, i) => (
            <motion.div
              key={action.label}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <Link
                to={action.href}
                className="flex flex-col gap-1.5 p-3.5 rounded-xl transition-all hover:bg-white/[0.04] group"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-xl">{action.icon}</span>
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors leading-tight">{action.label}</span>
                <span className="text-[11px] text-slate-600">{action.desc}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Identity Vault quick link */}
      <Link
        to="/vault"
        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl group transition-all hover:bg-white/[0.03]"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-white">Identity Vault</p>
            <p className="text-[11px] text-slate-600">Date personale · Semnătură · Biometrie</p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </Link>
    </div>
  );
}