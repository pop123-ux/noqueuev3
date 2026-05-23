/**
 * IdentityVaultCard — Summary card shown on the Profile hub page
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IdentityVaultCard({ profile, secret }) {
  const fields = [
    { label: 'Prenume', val: profile?.first_name },
    { label: 'Nume', val: profile?.last_name },
    { label: 'CNP', val: secret?.cnp_masked },
    { label: 'Serie/Nr act', val: secret?.id_series && secret?.id_number ? `${secret.id_series} ${secret.id_number}` : null },
    { label: 'Localitate', val: profile?.city },
    { label: 'Județ', val: profile?.county },
  ];

  const filled = fields.filter(f => f.val).length;
  const pct = Math.round((filled / fields.length) * 100);
  const isComplete = pct >= 80;

  return (
    <Link to="/vault" className="block glass-card rounded-2xl p-5 border border-white/8 hover:border-primary/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Seiful de Identitate</p>
            <p className="text-xs text-slate-400">Date oficiale pentru auto-completare</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {isComplete
            ? <CheckCircle2 className="w-4 h-4 text-success" />
            : <AlertCircle className="w-4 h-4 text-warning" />
          }
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-primary transition-colors" />
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Completare profil</span>
          <span className={pct >= 80 ? 'text-success' : 'text-warning'}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {fields.map(f => (
          <div key={f.label} className="text-center">
            <p className="text-[9px] text-slate-500 mb-0.5">{f.label}</p>
            {f.val
              ? <CheckCircle2 className="w-3 h-3 text-success mx-auto" />
              : <div className="w-3 h-3 rounded-full border border-slate-600 mx-auto" />
            }
          </div>
        ))}
      </div>
    </Link>
  );
}