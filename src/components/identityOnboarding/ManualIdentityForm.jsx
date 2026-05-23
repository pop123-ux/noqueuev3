/**
 * ManualIdentityForm — Manual fallback when ID OCR fails or user prefers typing.
 *
 * Pre-fills with any partial data the OCR managed to extract, lets the user
 * fix/complete it, then feeds the same downstream Review → 2FA → save pipeline.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit3, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const FIELDS = [
  { key: 'first_name',    label: 'Prenume',        placeholder: 'Andrei',         required: true },
  { key: 'last_name',     label: 'Nume',           placeholder: 'Popescu',        required: true },
  { key: 'cnp',           label: 'CNP',            placeholder: '1960101123456',  required: true, maxLength: 13 },
  { key: 'id_series',     label: 'Seria',          placeholder: 'CJ',             required: true, maxLength: 2 },
  { key: 'id_number',     label: 'Număr',          placeholder: '123456',         required: true, maxLength: 6 },
  { key: 'address',       label: 'Adresă',         placeholder: 'Str. Memorandumului nr. 21' },
  { key: 'city',          label: 'Oraș',           placeholder: 'Cluj-Napoca' },
  { key: 'county',        label: 'Județ',          placeholder: 'Cluj' },
  { key: 'id_issued_by',  label: 'Emis de',        placeholder: 'SPCJEP Cluj' },
  { key: 'id_issue_date', label: 'Data emiterii',  type: 'date' },
  { key: 'id_expiry_date',label: 'Data expirării', type: 'date' },
];

export default function ManualIdentityForm({ initialData = {}, onBack, onSubmit }) {
  const [form, setForm] = useState(() => ({
    first_name:    initialData.first_name    || '',
    last_name:     initialData.last_name     || '',
    cnp:           initialData.cnp           || '',
    id_series:     initialData.id_series     || '',
    id_number:     initialData.id_number     || '',
    address:       initialData.address       || '',
    city:          initialData.city          || '',
    county:        initialData.county        || '',
    id_issued_by:  initialData.id_issued_by  || '',
    id_issue_date: initialData.id_issue_date || '',
    id_expiry_date:initialData.id_expiry_date|| '',
    birth_date:    initialData.birth_date    || '',
    birth_place:   initialData.birth_place   || '',
    sex:           initialData.sex           || '',
    citizenship:   initialData.citizenship   || 'ROU',
    nationality:   initialData.nationality   || 'Română',
  }));
  const [errors, setErrors] = useState({});

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (errors[k]) setErrors(e => ({ ...e, [k]: null }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const next = {};
    FIELDS.forEach(f => {
      if (f.required && !String(form[f.key] || '').trim()) next[f.key] = 'Obligatoriu';
    });
    if (form.cnp && !/^\d{13}$/.test(form.cnp)) next.cnp = 'CNP-ul trebuie să aibă 13 cifre';
    if (form.id_series && form.id_series.length < 2) next.id_series = 'Min. 2 caractere';
    if (form.id_number && !/^\d{4,8}$/.test(form.id_number)) next.id_number = 'Doar cifre';

    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    // Derive full_name + return — caller handles downstream flow.
    onSubmit({
      ...form,
      first_name: form.first_name.trim(),
      last_name:  form.last_name.trim(),
      id_series:  form.id_series.toUpperCase().trim(),
      full_name:  `${form.first_name.trim()} ${form.last_name.trim()}`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
          <Edit3 className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold text-white mb-0.5">Completare manuală</h2>
          <p className="text-xs text-slate-400">
            Introdu datele direct de pe buletin. Vei putea verifica totul înainte de salvare.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map(f => (
            <div key={f.key} className={f.key === 'address' ? 'sm:col-span-2' : ''}>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {f.label}{f.required && <span className="text-amber-400 ml-0.5">*</span>}
              </label>
              <Input
                type={f.type || 'text'}
                value={form[f.key] || ''}
                onChange={(e) => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                maxLength={f.maxLength}
                className={`bg-white/5 border-white/10 text-white placeholder:text-slate-600 text-sm h-10 rounded-xl ${
                  errors[f.key] ? 'border-amber-500/60' : ''
                }`}
              />
              {errors[f.key] && (
                <p className="text-[10px] text-amber-400 mt-1">{errors[f.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Notice */}
        <div className="rounded-xl p-3 bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-slate-300 leading-relaxed">
            Datele sunt criptate înainte de stocare. Vei putea verifica totul la pasul următor înainte de a confirma.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="rounded-2xl h-11 px-4 border-white/15 bg-white/5 hover:bg-white/10 text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Înapoi
          </Button>
          <Button
            type="submit"
            className="flex-1 rounded-2xl bg-primary hover:bg-primary/90 h-11 text-sm font-semibold"
          >
            Continuă la verificare →
          </Button>
        </div>
      </form>
    </motion.div>
  );
}