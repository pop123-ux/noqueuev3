/**
 * OcrRecoveryPanel — Smart fallback when ID OCR fails.
 *
 * Replaces the dead-end "Ceva nu a mers" screen with:
 *   • Friendly explanation of what went wrong
 *   • Detected possible problems (blurry, glare, low contrast, etc.)
 *   • Visual scan-quality checklist + framed-ID illustration
 *   • 4 recovery paths: retry, manual entry, demo identity, upload another
 *   • Partial confidence score when some fields were extracted
 *   • Prototype disclaimer
 */
import React from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle, Camera, Edit3, Sparkles, RefreshCcw, CheckCircle2,
  Sun, Eye, Crop, ImageOff, ScanLine,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const POSSIBLE_PROBLEMS = [
  { icon: Eye,      label: 'Imagine neclară sau ușor mișcată' },
  { icon: Crop,     label: 'Colțurile cărții de identitate nu sunt vizibile' },
  { icon: Sun,      label: 'Reflexii sau umbre puternice pe document' },
  { icon: ScanLine, label: 'Contrast scăzut între text și fundal' },
  { icon: Camera,   label: 'Buletinul este prea departe de cameră' },
  { icon: ImageOff, label: 'Format de imagine neacceptat' },
];

const SCAN_TIPS = [
  'Așază buletinul pe o suprafață plată, închisă la culoare',
  'Folosește lumină naturală sau o sursă uniformă, fără bliț direct',
  'Toate cele 4 colțuri trebuie să fie vizibile în cadru',
  'Ține camera paralelă cu documentul (fără înclinare)',
  'Evită reflexiile pe folia de protecție',
];

export default function OcrRecoveryPanel({
  confidence,            // { overall: number } | null
  missingCritical = [],  // string[]
  unreliableCritical = [],
  onRetry,
  onManualEntry,
  onDemoIdentity,
  onUploadDifferent,
}) {
  const overall = confidence?.overall ?? 0;
  const hasPartialData = overall > 0;
  const confidencePct = Math.round(overall * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 mb-3">
          <AlertTriangle className="w-7 h-7 text-amber-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1.5">
          Nu am putut citi clar buletinul
        </h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          Nicio grijă — îți arătăm cum să continui în câteva secunde.
        </p>
      </div>

      {/* Partial confidence (only if something was extracted) */}
      {hasPartialData && (
        <div className="rounded-2xl p-4"
          style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.25)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-bold text-white">Date parțiale detectate</span>
            </div>
            <span className="text-xs font-bold text-primary">{confidencePct}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mb-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidencePct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-accent"
            />
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {missingCritical.length > 0
              ? `Câmpuri lipsă: ${missingCritical.join(', ')}.`
              : 'Unele câmpuri nu pot fi verificate automat.'}
            {' '}Le poți completa manual mai jos.
          </p>
        </div>
      )}

      {/* Possible problems */}
      <div className="rounded-2xl p-4 bg-white/[0.02] border border-white/8">
        <p className="text-xs font-bold text-white mb-3">Posibile cauze</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {POSSIBLE_PROBLEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-white/[0.02]">
              <Icon className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
              <span className="text-[11px] text-slate-400 leading-tight">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Framed ID illustration + checklist */}
      <div className="rounded-2xl p-4 bg-gradient-to-br from-white/[0.03] to-white/[0.01] border border-white/8">
        <p className="text-xs font-bold text-white mb-3">Pentru o scanare reușită</p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          {/* Mini ID frame illustration */}
          <div className="relative shrink-0">
            <div className="w-28 h-20 rounded-lg border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-center">
              <div className="w-20 h-12 rounded bg-gradient-to-br from-primary/30 to-accent/20 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white/70 tracking-wider">RO • ID</span>
              </div>
            </div>
            {/* Corner markers */}
            {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map(pos => (
              <div key={pos} className={`absolute ${pos} w-2.5 h-2.5 border-primary`}
                style={{
                  borderTopWidth:    pos.includes('top')    ? 2 : 0,
                  borderBottomWidth: pos.includes('bottom') ? 2 : 0,
                  borderLeftWidth:   pos.includes('left')   ? 2 : 0,
                  borderRightWidth:  pos.includes('right')  ? 2 : 0,
                }}
              />
            ))}
          </div>

          {/* Checklist */}
          <ul className="space-y-1.5 flex-1 min-w-0">
            {SCAN_TIPS.map(tip => (
              <li key={tip} className="flex items-start gap-2">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />
                <span className="text-[11px] text-slate-300 leading-snug">{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recovery actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Button
          onClick={onRetry}
          className="rounded-2xl bg-primary hover:bg-primary/90 h-11 text-sm font-semibold"
        >
          <RefreshCcw className="w-3.5 h-3.5 mr-1.5" /> Încearcă din nou
        </Button>
        <Button
          onClick={onManualEntry}
          variant="outline"
          className="rounded-2xl h-11 text-sm font-semibold border-white/15 bg-white/5 hover:bg-white/10 text-white"
        >
          <Edit3 className="w-3.5 h-3.5 mr-1.5" /> Completează manual
        </Button>
        <Button
          onClick={onUploadDifferent}
          variant="outline"
          className="rounded-2xl h-11 text-sm font-semibold border-white/15 bg-white/5 hover:bg-white/10 text-white"
        >
          <Camera className="w-3.5 h-3.5 mr-1.5" /> Încarcă altă imagine
        </Button>
        <Button
          onClick={onDemoIdentity}
          variant="outline"
          className="rounded-2xl h-11 text-sm font-semibold border-accent/30 bg-accent/10 hover:bg-accent/20 text-accent"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Continuă cu identitate demo
        </Button>
      </div>

      {/* Prototype disclaimer */}
      <p className="text-[10px] text-slate-600 text-center leading-relaxed">
        🧪 Prototip ROeID-style — simulare în scop demonstrativ. Nu este un sistem oficial de autentificare guvernamentală.
      </p>
    </motion.div>
  );
}