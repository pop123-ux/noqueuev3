/**
 * ProfileOverviewTab — Identity hub overview.
 * Renders the identity card, stat tiles, quick links, and before/after strip.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, CheckCircle2, Lock, FileCheck, Briefcase, Clock,
  FolderOpen, Bell, Sparkles, ChevronRight,
} from 'lucide-react';

function initials(name = '', email = '') {
  const source = (name || email || '?').trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

const QUICK_LINKS = [
  { to: '/cases', icon: Briefcase, label: 'Dosarele mele', desc: 'Proceduri active și în curs' },
  { to: '/digital-vault', icon: FolderOpen, label: 'Documente generate', desc: 'Toate documentele pregătite' },
  { to: '/appointments/watch', icon: Bell, label: 'Alerte programări', desc: 'Monitorizare disponibilitate' },
  { to: '/life-events', icon: Sparkles, label: 'Evenimente de viață', desc: 'Ghid pas-cu-pas momente cheie' },
];

export default function ProfileOverviewTab({ user, completionPct, stats }) {
  const safe = stats || { docs: 0, cases: 0, savedHours: '~0h' };

  return (
    <div className="space-y-5">
      {/* Identity card */}
      <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.02]">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center text-white text-lg font-black shrink-0">
            {initials(user?.full_name, user?.email)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold text-white truncate">{user?.full_name || 'Utilizator'}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-success bg-success/10 border border-success/20 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-2.5 h-2.5" /> Verificat
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                <Lock className="w-2.5 h-2.5" /> 2FA activ
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-full">
                <Shield className="w-2.5 h-2.5" /> Safe Profile {completionPct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-2.5">
        {[
          { icon: FileCheck, value: safe.docs, label: 'Doc. generate', color: 'text-primary' },
          { icon: Briefcase, value: safe.cases, label: 'Dosare active', color: 'text-accent' },
          { icon: Clock, value: safe.savedHours, label: 'Timp salvat', color: 'text-success' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center py-4 px-3 rounded-2xl bg-white/[0.03] border border-white/6"
          >
            <Icon className={`w-4 h-4 ${color} mb-1.5`} />
            <p className={`text-xl font-black ${color}`}>{value}</p>
            <p className="text-[9px] text-slate-500 uppercase tracking-wider mt-1 text-center">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="space-y-2">
        {QUICK_LINKS.map(({ to, icon: Icon, label, desc }) => (
          <Link key={to} to={to} className="block">
            <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/6 hover:border-primary/25 hover:bg-primary/[0.04] transition-all group">
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{label}</p>
                <p className="text-[11px] text-slate-500 truncate">{desc}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </div>

      {/* Before / After strip */}
      <div>
        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mb-2 px-1">De ce NoQueue?</p>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl p-3.5 bg-red-500/5 border border-red-500/10">
            <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-1">Înainte</p>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Cauți formulare, mergi la ghișeu, revii cu acte lipsă.
            </p>
          </div>
          <div className="rounded-xl p-3.5 bg-primary/5 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Cu NoQueue</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Pașii și documentele pregătite automat, de acasă.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}