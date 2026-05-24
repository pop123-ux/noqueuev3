/**
 * ProfileSecurityTab — Status grid for security-related settings.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Shield, Bell, Settings } from 'lucide-react';

const ROWS = [
  { icon: Lock, label: '2FA activ', desc: 'Google Authenticator conectat', badge: 'Activ', tone: 'success' },
  { icon: Shield, label: 'Identitate verificată', desc: 'OCR buletin completat', badge: 'Activ', tone: 'success' },
  { icon: Bell, label: 'Notificări', desc: 'Alerte la expirare documente', badge: 'Activ', tone: 'success' },
  { icon: Settings, label: 'Consimțăminte', desc: 'Date partajate cu AI', badge: 'Verifică', tone: 'warning' },
];

const TONE = {
  success: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20' },
  warning: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20' },
};

export default function ProfileSecurityTab() {
  return (
    <div className="space-y-3">
      {ROWS.map(({ icon: Icon, label, desc, badge, tone }) => {
        const t = TONE[tone];
        return (
          <div
            key={label}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-white/6 bg-white/[0.02]"
          >
            <div className={`w-9 h-9 rounded-xl ${t.bg} border ${t.border} flex items-center justify-center shrink-0`}>
              <Icon className={`w-4 h-4 ${t.text}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">{label}</p>
              <p className="text-[11px] text-slate-500">{desc}</p>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${t.bg} ${t.text} border ${t.border}`}>
              {badge}
            </span>
          </div>
        );
      })}

      <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4 mt-2">
        <p className="text-[11px] text-slate-500 leading-relaxed text-center">
          🔒 Datele tale sunt stocate securizat și nu sunt împărtășite fără consimțământ explicit.{' '}
          <Link to="/vault" className="text-primary hover:underline">Gestionează consimțămintele →</Link>
        </p>
      </div>
    </div>
  );
}