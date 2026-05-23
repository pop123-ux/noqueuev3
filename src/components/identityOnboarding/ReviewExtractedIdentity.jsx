/**
 * ReviewExtractedIdentity — Step 4: Review + edit OCR results with confidence indicators
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, AlertTriangle, RotateCcw, Edit3, ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FIELDS = [
  { key: 'last_name', label: 'Nume', confKey: 'last_name' },
  { key: 'first_name', label: 'Prenume', confKey: 'first_name' },
  { key: 'cnp', label: 'CNP', confKey: 'cnp', mono: true },
  { key: 'sex', label: 'Sex', confKey: 'overall' },
  { key: 'birth_date', label: 'Data nașterii', confKey: 'birth_date' },
  { key: 'birth_place', label: 'Locul nașterii', confKey: 'overall' },
  { key: 'address', label: 'Adresă', confKey: 'address', wide: true },
  { key: 'id_series', label: 'Seria CI', confKey: 'id_series' },
  { key: 'id_number', label: 'Număr CI', confKey: 'id_number' },
  { key: 'id_issued_by', label: 'Eliberat de', confKey: 'overall' },
  { key: 'id_issue_date', label: 'Data eliberării', confKey: 'overall' },
  { key: 'id_expiry_date', label: 'Valabil până', confKey: 'id_expiry_date' },
];

function confBadge(score) {
  if (score >= 0.95) return { label: '✓', color: '#22c55e', text: 'Sigur', pct: Math.round(score * 100) };
  if (score >= 0.80) return { label: '✓', color: '#86efac', text: 'OK', pct: Math.round(score * 100) };
  if (score >= 0.60) return { label: '~', color: '#facc15', text: 'Medie', pct: Math.round(score * 100) };
  return { label: '!', color: '#ef4444', text: 'Scăzută', pct: Math.round(score * 100) };
}

export default function ReviewExtractedIdentity({ extracted, confidence = {}, warnings = [], onConfirm, onRescan }) {
  const [data, setData] = useState(extracted);
  const [editing, setEditing] = useState(false);

  const overallPct = Math.round((confidence.overall || 0) * 100);
  const overallColor = overallPct >= 80 ? '#22c55e' : overallPct >= 60 ? '#facc15' : '#ef4444';

  const update = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-5">
        <h2 className="text-2xl font-bold text-white mb-2">Verifică datele tale</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Confirmă că informațiile extrase sunt corecte. Poți edita orice câmp.
        </p>
      </div>

      {/* Overall confidence */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-4"
        style={{ background: `${overallColor}15`, border: `1px solid ${overallColor}30` }}>
        <div className="flex-1">
          <p className="text-xs text-slate-300">Acuratețe OCR</p>
          <p className="text-lg font-bold" style={{ color: overallColor }}>{overallPct}%</p>
        </div>
        <button onClick={() => setEditing(!editing)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all bg-white/5 hover:bg-white/10 text-white">
          <Edit3 className="w-3 h-3" />
          {editing ? 'Termină editarea' : 'Editează'}
        </button>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {warnings.map((w, i) => {
            const isCrit = w.severity === 'critical';
            const isWarn = w.severity === 'warning';
            const color = isCrit ? '#ef4444' : isWarn ? '#facc15' : '#22d3ee';
            const Icon = isCrit || isWarn ? AlertTriangle : Info;
            return (
              <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
                style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}>
                <Icon className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{w.message}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Field grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-5 max-h-[440px] overflow-y-auto pr-1">
        {FIELDS.map(f => {
          const val = data[f.key] ?? '';
          const score = confidence[f.confKey] ?? confidence.overall ?? 0.5;
          const badge = confBadge(score);
          return (
            <div key={f.key} className={f.wide ? 'sm:col-span-2' : ''}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{f.label}</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${badge.color}20`, color: badge.color }}>
                  {badge.label} {badge.pct}%
                </span>
              </div>
              {editing ? (
                <input
                  value={val}
                  onChange={e => update(f.key, e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm focus:outline-none focus:border-primary/50 ${f.mono ? 'font-mono' : ''}`}
                />
              ) : (
                <div className={`px-3 py-2 rounded-xl text-sm ${val ? 'text-white' : 'text-slate-600 italic'} ${f.mono ? 'font-mono' : ''}`}
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  {val || '—'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onRescan} className="flex-1 h-12 rounded-2xl border-white/15 text-slate-300">
          <RotateCcw className="w-4 h-4 mr-1.5" /> Re-scanează
        </Button>
        <Button onClick={() => onConfirm(data)} className="flex-1 h-12 rounded-2xl bg-primary font-semibold">
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          Confirmă identitatea
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </motion.div>
  );
}