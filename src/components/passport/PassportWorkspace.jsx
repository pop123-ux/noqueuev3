/**
 * PassportWorkspace — Full passport application workspace
 * Autofill from Seif, review fields, generate & export PDF draft
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, CheckCircle2, AlertTriangle, FileText, Download,
  Edit3, Globe, Clock, MapPin, Shield, ChevronDown,
  ChevronUp, ExternalLink, Loader2, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { passportProcedure, matchPassportProfile } from '@/lib/rag/passportProcedure';
import { exportStructuredPassportPdf } from '@/services/documents/passportPdfExporter';
import { mapProfileToPassportForm } from '@/services/documents/passportFieldMapper';
import StructuredPassportPreview from '@/components/documents/StructuredPassportPreview';

function Section({ title, icon: SectionIcon, color = 'text-primary', children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <SectionIcon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-white">{title}</span>
          {badge && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FieldEditor({ fields, onChange }) {
  const labels = {
    full_name: 'Nume complet', first_name: 'Prenume', last_name: 'Nume familie',
    cnp: 'CNP', birth_date: 'Data nasterii', birth_place: 'Locul nasterii',
    father_name: 'Numele tatalui', mother_name: 'Numele mamei',
    id_series: 'Seria CI', id_number: 'Numarul CI',
    address: 'Adresa', city: 'Localitate', county: 'Judet',
    phone: 'Telefon', email: 'Email', citizenship: 'Cetatenie',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Object.entries(labels).map(([key, label]) => {
        const val = fields[key] || '';
        const isEmpty = !val.trim();
        return (
          <div key={key}>
            <label className="text-[10px] font-semibold uppercase tracking-wider mb-1 flex items-center gap-1.5"
              style={{ color: isEmpty ? '#facc15' : '#94a3b8' }}>
              {isEmpty ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3 text-green-400" />}
              {label}
              {isEmpty && <span className="text-[9px] text-warning font-normal normal-case">— lipsa din Seif</span>}
            </label>
            <input
              value={val}
              onChange={e => onChange(key, e.target.value)}
              placeholder={isEmpty ? 'Completeaza manual...' : ''}
              className="w-full text-sm px-3 py-2 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 transition-all"
              style={{
                background: isEmpty ? 'rgba(250,204,21,0.06)' : 'rgba(255,255,255,0.04)',
                border: isEmpty ? '1px solid rgba(250,204,21,0.25)' : '1px solid rgba(255,255,255,0.08)',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

export default function PassportWorkspace({ profile, caseData }) {
  const [showPreview, setShowPreview] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(null);

  const activeProfile = editedProfile || profile;
  const { filled, missing, readiness } = matchPassportProfile(activeProfile);
  const formData = mapProfileToPassportForm(activeProfile, { isUrgent: true });

  const KEY_MAP = { address: 'address_line_1', full_name: 'full_name' };
  const handleFieldChange = (key, value) => {
    const profileKey = KEY_MAP[key] || key;
    setEditedProfile(prev => ({ ...(prev || profile || {}), [profileKey]: value }));
  };

  const handleExport = async () => {
    setExporting(true);
    const pdfBytes = await exportStructuredPassportPdf(activeProfile, { isUrgent: true });
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cerere_pasaport_ciorna_${Date.now()}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
    setExporting(false);
  };

  const readinessColor = readiness >= 80 ? '#22c55e' : readiness >= 50 ? '#facc15' : '#ef4444';

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* Header Card */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(17,28,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">AI Passport Workspace</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug">Cerere Pasaport Simplu Electronic</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3 h-3" /> {passportProcedure.institution}
            </p>
          </div>
          <div className="text-center shrink-0">
            <div className="text-2xl font-bold" style={{ color: readinessColor }}>{readiness}%</div>
            <div className="text-[10px] text-slate-500">Seif ready</div>
          </div>
        </div>

        {/* Draft warning */}
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4" style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}>
          <Info className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-warning">
            <strong>Ciorna generata</strong> — Verifica toate campurile inainte de depunere. Nu este un formular oficial.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="flex-1 h-11 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)', border: 'none' }}
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export PDF Draft
          </Button>
          <Button
            onClick={() => setShowPreview(!showPreview)}
            variant="outline"
            className="h-11 rounded-xl text-sm border-white/15 text-slate-300"
          >
            <FileText className="w-4 h-4 mr-1.5" /> {showPreview ? 'Ascunde previzualizare' : 'Previzualizeaza formular'}
          </Button>
          <Button
            onClick={() => setEditing(!editing)}
            variant="ghost"
            className="h-11 rounded-xl text-sm text-slate-400"
          >
            <Edit3 className="w-4 h-4 mr-1.5" /> {editing ? 'Ascunde editor' : 'Editeaza campuri'}
          </Button>
        </div>
      </div>

      {/* Structured Form Preview */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-2xl overflow-hidden p-4" style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-white">Previzualizare Formular Structurat</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/15 text-warning font-semibold">Anexa 10</span>
              </div>
              <StructuredPassportPreview profile={activeProfile} options={{ isUrgent: true }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Editable Fields */}
      {editing && (
        <Section title="Editeaza Campuri" icon={Edit3} color="text-accent" defaultOpen={true} badge={`${formData.missing.length} lipsa`}>
          <FieldEditor fields={{
            full_name: [activeProfile?.first_name, activeProfile?.last_name].filter(Boolean).join(' '),
            first_name: activeProfile?.first_name || '',
            last_name: activeProfile?.last_name || '',
            cnp: activeProfile?.cnp || '',
            birth_date: activeProfile?.birth_date || '',
            birth_place: activeProfile?.birth_place || '',
            father_name: activeProfile?.father_name || '',
            mother_name: activeProfile?.mother_name || '',
            id_series: activeProfile?.id_series || '',
            id_number: activeProfile?.id_number || '',
            address: activeProfile?.address_line_1 || '',
            city: activeProfile?.city || '',
            county: activeProfile?.county || '',
            phone: activeProfile?.phone || '',
            email: activeProfile?.email || '',
          }} onChange={handleFieldChange} />
          <Button
            onClick={handleExport}
            disabled={exporting}
            className="w-full mt-4 h-10 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #16a34a, #15803d)' }}
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Export PDF cu campurile editate
          </Button>
        </Section>
      )}

      {/* Seif Compatibility */}
      <Section title="Compatibilitate Seif" icon={Shield} color="text-green-400" defaultOpen={true}>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-500">Completitudine profil</span>
              <span className="font-semibold" style={{ color: readinessColor }}>{readiness}%</span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${readiness}%` }}
                style={{ backgroundColor: readinessColor }} />
            </div>
          </div>
          {filled.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-green-400 uppercase tracking-wider mb-2">✓ Disponibil din Seif</p>
              <div className="space-y-1">
                {filled.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400 shrink-0" />
                    <span className="text-slate-300">{f.label}</span>
                    <span className="text-slate-600 text-[10px] truncate">({String(f.value).slice(0, 20)})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {missing.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-warning uppercase tracking-wider mb-2">⚠ Lipsa din Seif</p>
              <div className="space-y-1">
                {missing.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                    <span className="text-slate-400">{f.label}</span>
                  </div>
                ))}
              </div>
              <a href="/vault" className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:text-primary/80 transition-colors">
                <Shield className="w-3.5 h-3.5" /> Completeaza Seif-ul →
              </a>
            </div>
          )}
        </div>
      </Section>

      {/* Required Documents */}
      <Section title="Documente Necesare la Ghiseu" icon={FileText} color="text-accent" defaultOpen={false}>
        <div className="space-y-2">
          {passportProcedure.requiredDocuments.map((doc, i) => (
            <div key={i} className="flex items-start gap-2.5 py-1.5 px-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5"
                style={{ borderColor: doc.generated ? 'rgba(34,197,94,0.5)' : 'rgba(255,255,255,0.15)',
                  background: doc.generated ? 'rgba(34,197,94,0.1)' : 'transparent' }}>
                {doc.generated && <CheckCircle2 className="w-3 h-3 text-green-400" />}
              </div>
              <div>
                <span className="text-xs text-slate-300">{doc.label}</span>
                {doc.generated && <span className="ml-2 text-[9px] text-green-400 font-semibold">GENERAT AUTOMAT</span>}
                {!doc.required && <span className="ml-2 text-[9px] text-slate-500">optional</span>}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Queue & Institution */}
      <Section title="Institutie & Coada" icon={MapPin} color="text-primary" defaultOpen={false}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">{passportProcedure.institution}</span>
            <span className="text-lg font-bold text-warning">~{passportProcedure.estimatedWait}</span>
          </div>
          <p className="text-xs text-slate-400">{passportProcedure.institutionAddress}</p>
          <p className="text-xs text-slate-500">{passportProcedure.institutionHours}</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="text-sm font-bold text-white">{passportProcedure.standardFee}</div>
              <div className="text-[10px] text-slate-500">Taxa standard</div>
            </div>
            <div className="rounded-xl p-2.5 text-center" style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
              <div className="text-sm font-bold text-warning">{passportProcedure.urgentFee}</div>
              <div className="text-[10px] text-slate-500">Taxa urgenta</div>
            </div>
          </div>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(passportProcedure.institutionAddress)}`}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-primary hover:text-primary/80 mt-1"
          >
            <MapPin className="w-3.5 h-3.5" /> Indicatii rutiere
          </a>
        </div>
      </Section>

      {/* Common Mistakes */}
      <Section title="Greseli Frecvente" icon={AlertTriangle} color="text-warning" defaultOpen={false}>
        <div className="space-y-2">
          {passportProcedure.commonMistakes.map((m, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-300">
              <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
              <span>{m}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Official Sources */}
      <Section title="Surse Oficiale" icon={Globe} color="text-accent" defaultOpen={false}>
        <div className="space-y-2">
          {passportProcedure.officialSources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between gap-2 py-2 px-3 rounded-xl hover:bg-white/5 transition-colors group"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs text-slate-300 group-hover:text-white">{s.title}</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-accent shrink-0" />
            </a>
          ))}
        </div>
      </Section>

      {/* Next Steps */}
      <Section title="Urmatorii Pasi" icon={Clock} color="text-green-400" defaultOpen={false}>
        <ol className="space-y-3">
          {passportProcedure.nextSteps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold"
                style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>{i + 1}</span>
              <span className="text-xs text-slate-300">{step}</span>
            </li>
          ))}
        </ol>
      </Section>

    </motion.div>
  );
}