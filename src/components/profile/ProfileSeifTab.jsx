/**
 * ProfileSeifTab — Summary view of the Identity Vault state.
 * Shows completion progress + per-section status, links to /vault.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle2, AlertCircle, ArrowRight, User, CreditCard, MapPin, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileSeifTab({ profile, completionPct }) {
  const p = profile || {};
  const sections = [
    {
      icon: User,
      label: 'Date personale',
      done: !!(p.first_name && p.last_name && p.phone),
    },
    {
      icon: CreditCard,
      label: 'Act de identitate',
      done: !!(p.id_series && p.id_number),
    },
    {
      icon: MapPin,
      label: 'Adresă',
      done: !!(p.city && p.county && p.address_line_1),
    },
    {
      icon: Car,
      label: 'Permis auto',
      done: false, // not tracked yet — visible as incomplete
    },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-2xl p-5 border border-white/8 bg-white/[0.02]">
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">Seiful de Identitate</span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all"
              style={{ width: `${completionPct}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-white">{completionPct}%</span>
        </div>

        <div className="space-y-1.5">
          {sections.map(({ icon: Icon, label, done }) => (
            <div
              key={label}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl border border-white/6 bg-white/[0.02]"
            >
              <Icon className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="flex-1 text-xs text-white">{label}</span>
              {done ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-slate-600" />
              )}
            </div>
          ))}
        </div>

        <Link to="/vault" className="block mt-4">
          <Button className="w-full h-11 rounded-xl bg-primary hover:bg-primary/85 text-white font-semibold text-sm shadow-lg shadow-primary/20 transition-all">
            Deschide Seiful <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}