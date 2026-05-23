/**
 * StepConsents — Step 5: Consents + vault activation (inlined from Onboarding.jsx)
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, Loader2, Lock, FileText, Cloud, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const CONSENTS = [
  {
    key: 'vault_storage',
    label: 'Sunt de acord ca aplicația să stocheze datele mele pentru reutilizare în documente.',
    description: 'Datele tale sunt criptate și accesibile doar ție.',
    icon: Lock,
    required: true,
  },
  {
    key: 'autofill_usage',
    label: 'Sunt de acord cu utilizarea datelor pentru auto-completare documente.',
    description: 'Completăm automat formularele oficiale cu datele tale salvate.',
    icon: FileText,
    required: true,
  },
  {
    key: 'export_connected',
    label: 'Sunt de acord să export documentele completate către serviciile conectate de mine.',
    description: 'Opțional — pentru Google Drive, Sheets etc. Poți activa/dezactiva oricând.',
    icon: Cloud,
    required: false,
  },
];

export default function StepConsents({ user, onComplete }) {
  const [subStep, setSubStep] = useState(0); // 0=intro, 1=consents, 2=done
  const [consents, setConsents] = useState({ vault_storage: false, autofill_usage: false, export_connected: false });
  const [saving, setSaving] = useState(false);

  const allRequiredAccepted = CONSENTS.filter(c => c.required).every(c => consents[c.key]);

  const handleActivate = async () => {
    setSaving(true);
    const now = new Date().toISOString();

    await Promise.all(
      CONSENTS.map(c =>
        base44.entities.ConsentLog.create({
          user_id: user.email,
          consent_type: c.key,
          consent_version: '1.0',
          text_snapshot: c.label,
          accepted: !!consents[c.key],
          accepted_at: consents[c.key] ? now : null,
        })
      )
    );

    const existing = await base44.entities.IdentitySecret.filter({ user_id: user.email }, '-created_date', 1);
    if (!existing?.length) {
      await base44.entities.IdentitySecret.create({ user_id: user.email });
    }

    const profiles = await base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1);
    if (profiles?.length) {
      await base44.entities.UserPrivateProfile.update(profiles[0].id, { onboarding_completed: true });
    } else {
      await base44.entities.UserPrivateProfile.create({ user_id: user.email, onboarding_completed: true });
    }

    setSaving(false);
    setSubStep(2);
  };

  if (subStep === 0) {
    return (
      <div>
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Activează Seiful de Identitate</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Salvezi o singură dată datele tale oficiale și le refolosești la completarea documentelor.
          </p>
        </div>
        <div className="space-y-3 mb-8">
          {[
            { icon: Lock, title: 'Date criptate', desc: 'CNP, serie/număr act și adresa sunt stocate securizat, nu apar în liste publice.' },
            { icon: FileText, title: 'Auto-completare formulare', desc: 'Completăm automat documentele oficiale cu datele tale salvate, fără să rescrii de fiecare dată.' },
            { icon: Cloud, title: 'Export opțional', desc: 'Poți exporta documentele completate în Google Drive sau le descarci local — alegerea ta.' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="glass-card rounded-2xl p-4 border border-white/8 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
        <Button onClick={() => setSubStep(1)} className="w-full h-11 rounded-xl bg-primary">
          Continuă <CheckCircle2 className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  if (subStep === 2) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-success/20 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Seiful este activat! ✓</h2>
        <p className="text-slate-400 text-sm mb-8">
          Contul tău este configurat. Acum poți folosi auto-completarea documentelor.
        </p>
        <Button onClick={onComplete} className="w-full h-11 rounded-xl bg-primary">
          <Zap className="w-4 h-4 mr-2" />Intră în aplicație
        </Button>
      </motion.div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Consimțăminte</h2>
        <p className="text-xs text-slate-400">Bifează fiecare opțiune separat. Cele marcate cu * sunt necesare.</p>
      </div>
      <div className="space-y-3 mb-8">
        {CONSENTS.map(c => {
          const Icon = c.icon;
          const checked = consents[c.key];
          return (
            <button
              key={c.key}
              onClick={() => setConsents(prev => ({ ...prev, [c.key]: !prev[c.key] }))}
              className={`w-full text-left glass-card rounded-2xl p-4 border transition-all ${checked ? 'border-primary/40 bg-primary/5' : 'border-white/8'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${checked ? 'bg-primary border-primary' : 'border-slate-600'}`}>
                  {checked && <CheckCircle2 className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white leading-snug">
                    {c.label}{c.required && <span className="text-primary ml-1">*</span>}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">{c.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <Button onClick={handleActivate} disabled={!allRequiredAccepted || saving} className="w-full h-11 rounded-xl bg-primary disabled:opacity-40">
        {saving ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />Se activează...</> : <><Shield className="w-4 h-4 mr-2" />Activează Seiful de Identitate</>}
      </Button>
      <button onClick={() => setSubStep(0)} className="w-full mt-3 text-xs text-slate-500 hover:text-slate-400 transition-colors">Înapoi</button>
    </div>
  );
}