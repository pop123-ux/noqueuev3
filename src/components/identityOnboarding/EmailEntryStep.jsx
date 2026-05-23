/**
 * EmailEntryStep — Step 1: Collect email for ROeID-style onboarding
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, ShieldCheck, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function EmailEntryStep({ initialEmail = '', onNext }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState('');

  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNext = (e) => {
    e.preventDefault();
    if (!valid) {
      setError('Adresă de email invalidă');
      return;
    }
    onNext(email);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-7">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-3">
          <span className="text-[9px] font-bold text-accent uppercase tracking-wider">ROeID-style verification</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Începem cu emailul tău</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Folosim adresa pentru verificarea în 2 pași și pentru a-ți securiza profilul digital.
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-4">
        <div>
          <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2 block">Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              autoFocus
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              placeholder="nume@email.ro"
              className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>
          {error && <p className="text-xs text-destructive mt-2">{error}</p>}
        </div>

        <Button type="submit" disabled={!valid} className="w-full h-12 rounded-2xl bg-primary hover:bg-primary/90 disabled:opacity-40 font-semibold">
          Continuă <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <Lock className="w-3 h-3 text-accent" />
          Datele tale sunt criptate local și folosite doar pentru completarea documentelor.
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500">
          <ShieldCheck className="w-3 h-3 text-accent" />
          Poți șterge documentele și profilul oricând din Safe Profile.
        </div>
      </div>
    </motion.div>
  );
}