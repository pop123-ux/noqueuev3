/**
 * SmartDocReport — Renders the full analysis report
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, AlertTriangle, AlertOctagon, Info, Calendar, FileText,
  ChevronDown, ChevronUp, BookOpen, Lightbulb, ArrowRight, RotateCcw, Sparkles,
  ShieldCheck, Clock, FolderPlus, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { syncVaultDocToDrive } from '@/lib/google/vaultDriveSync';
import { DOC_TYPES } from '@/components/vault/DocumentCard';

/**
 * Heuristic: map Smart Doc's free-text document_type label to a Vault DOC_TYPES key.
 * Falls back to "other" if nothing matches.
 */
function mapToVaultType(kind = '') {
  const k = kind.toLowerCase();
  if (k.includes('carte') && k.includes('identitate')) return 'id_card';
  if (k.includes('pasaport') || k.includes('passport')) return 'passport';
  if (k.includes('permis') || k.includes('driver') || k.includes('conducere')) return 'driver_license';
  if (k.includes('naștere') || k.includes('nastere') || k.includes('birth')) return 'birth_certificate';
  if (k.includes('căsător') || k.includes('casator') || k.includes('marriage')) return 'marriage_certificate';
  if (k.includes('divorț') || k.includes('divort') || k.includes('divorce')) return 'divorce_document';
  if (k.includes('fiscal') || k.includes('tax') || k.includes('impozit')) return 'tax_form';
  if (k.includes('sănătate') || k.includes('sanatate') || k.includes('health') || k.includes('asigurare')) return 'health_insurance';
  if (k.includes('rezidență') || k.includes('rezidenta') || k.includes('residency')) return 'residency_permit';
  if (k.includes('vehicul') || k.includes('auto') || k.includes('vehicle')) return 'vehicle_registration';
  if (k.includes('cazier') || k.includes('criminal')) return 'criminal_record';
  if (k.includes('proprietate') || k.includes('property')) return 'property_paper';
  if (k.includes('amend') || k.includes('fine')) return 'fine';
  return 'other';
}

function Section({ title, icon: Icon, color, children, defaultOpen = true, badge }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-sm font-semibold text-white">{title}</span>
          {badge != null && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary font-semibold">{badge}</span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-5 border-t border-white/5 pt-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const VALIDITY_CONFIG = {
  valid:          { color: '#22c55e', bg: 'rgba(34,197,94,0.10)', border: 'rgba(34,197,94,0.30)', icon: ShieldCheck, label: 'Valid' },
  expiring_soon:  { color: '#facc15', bg: 'rgba(250,204,21,0.10)', border: 'rgba(250,204,21,0.30)', icon: Clock, label: 'Expiră curând' },
  expired:        { color: '#ef4444', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.30)', icon: AlertOctagon, label: 'Expirat' },
  unknown:        { color: '#94a3b8', bg: 'rgba(148,163,184,0.10)', border: 'rgba(148,163,184,0.30)', icon: Info, label: 'Stare necunoscută' },
};

const SEVERITY_CONFIG = {
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.25)', icon: AlertOctagon, label: 'CRITIC' },
  warning:  { color: '#facc15', bg: 'rgba(250,204,21,0.08)', border: 'rgba(250,204,21,0.25)', icon: AlertTriangle, label: 'ATENȚIE' },
  info:     { color: '#22d3ee', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.25)', icon: Info, label: 'INFO' },
};

const URGENCY_COLOR = { high: '#ef4444', medium: '#facc15', low: '#22c55e' };

export default function SmartDocReport({ report, onReset }) {
  const { extracted = {}, analysis = {}, file_name, file_url } = report;
  const validity = VALIDITY_CONFIG[analysis.validity_status] || VALIDITY_CONFIG.unknown;
  const ValIcon = validity.icon;
  const days = analysis.days_until_expiry;

  // Vault save state — only available when we know who the user is and have a file URL.
  const [vaultState, setVaultState] = useState(report.fromVault ? 'saved' : 'idle'); // idle | saving | saved | error
  const [vaultDocId, setVaultDocId] = useState(report.fromVault || null);

  async function handleSaveToVault() {
    if (!file_url) return;
    setVaultState('saving');
    try {
      const user = await base44.auth.me();
      const docType = mapToVaultType(analysis.document_kind_ro || extracted.document_type || '');
      const created = await base44.entities.GovDocument.create({
        user_id: user?.email || 'anonymous',
        document_type: docType,
        document_title: extracted.document_title || analysis.document_kind_ro || file_name || 'Document',
        file_url,
        file_type: 'application/pdf',
        ocr_full_name: extracted.full_name || null,
        ocr_document_number: extracted.number || null,
        ocr_cnp: extracted.cnp || null,
        ocr_address: extracted.address || null,
        ocr_institution: extracted.issuing_authority || null,
        institution: extracted.issuing_authority || null,
        issue_date: extracted.issue_date || null,
        expiry_date: extracted.expiry_date || null,
        ocr_confidence: analysis.confidence != null ? String(analysis.confidence) : null,
        status: 'active',
        tags: ['from-smart-doc'],
        drive_upload_status: 'not_uploaded',
      });
      setVaultDocId(created.id);
      // Best-effort Drive backup — don't block.
      syncVaultDocToDrive(created, { silent: true }).catch(() => {});
      setVaultState('saved');
    } catch (e) {
      console.warn('Save to Vault failed:', e);
      setVaultState('error');
    }
  }

  const fields = [
    { label: 'Tip document', value: analysis.document_kind_ro || extracted.document_type },
    { label: 'Titlu', value: extracted.document_title },
    { label: 'Emisă de', value: extracted.issuing_authority },
    { label: 'Serie', value: extracted.series },
    { label: 'Număr', value: extracted.number },
    { label: 'Nume complet', value: extracted.full_name },
    { label: 'CNP', value: extracted.cnp },
    { label: 'Data emiterii', value: extracted.issue_date },
    { label: 'Data expirării', value: extracted.expiry_date },
    { label: 'Adresă', value: extracted.address },
  ].filter(f => f.value);

  const additional = extracted.additional_fields || [];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <div className="rounded-3xl p-6" style={{ background: 'rgba(17,28,51,0.85)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Smart Document Intelligence</span>
            </div>
            <h2 className="text-xl font-bold text-white leading-snug truncate">
              {analysis.document_kind_ro || 'Document analizat'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 truncate flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> {file_name}
            </p>
          </div>
          <Button onClick={onReset} variant="outline" size="sm" className="rounded-xl border-white/15 text-slate-300 shrink-0">
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Alt document
          </Button>
        </div>

        {/* Cross-app: Save to Vault */}
        {file_url && (
          <div className="mb-3">
            {vaultState === 'saved' ? (
              <Link
                to={vaultDocId ? `/digital-vault` : '/digital-vault'}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/15 transition-all"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Salvat în Vault · Vezi documentele
              </Link>
            ) : (
              <button
                onClick={handleSaveToVault}
                disabled={vaultState === 'saving'}
                className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-semibold bg-primary/10 border border-primary/25 text-primary hover:bg-primary/20 transition-all disabled:opacity-50"
              >
                {vaultState === 'saving' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FolderPlus className="w-3.5 h-3.5" />}
                {vaultState === 'saving' ? 'Se salvează…' : vaultState === 'error' ? 'Reîncearcă · Salvează în Vault' : 'Salvează în Vault & Google Drive'}
              </button>
            )}
          </div>
        )}

        {/* Validity status banner */}
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl mb-3" style={{ background: validity.bg, border: `1px solid ${validity.border}` }}>
          <ValIcon className="w-5 h-5 shrink-0" style={{ color: validity.color }} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold" style={{ color: validity.color }}>{validity.label}</p>
            {days !== null && days !== undefined && (
              <p className="text-xs text-slate-300">
                {days < 0 ? `Expirat de ${Math.abs(days)} zile` : days === 0 ? 'Expiră azi' : `${days} zile până la expirare`}
              </p>
            )}
          </div>
          {analysis.confidence != null && (
            <div className="text-right shrink-0">
              <div className="text-lg font-bold text-white">{Math.round(analysis.confidence * 100)}%</div>
              <div className="text-[10px] text-slate-500">Încredere</div>
            </div>
          )}
        </div>

        {/* One-line summary */}
        {analysis.one_line_summary && (
          <p className="text-sm text-slate-200 leading-relaxed">{analysis.one_line_summary}</p>
        )}
      </div>

      {/* ── EXPLAIN-TO-ME ─────────────────────────────────────────── */}
      {analysis.plain_explanation && (
        <Section title="Explicat pe înțelesul tău" icon={Lightbulb} color="text-warning" defaultOpen={true}>
          <div className="prose prose-invert prose-sm max-w-none">
            {analysis.plain_explanation.split('\n\n').map((para, i) => (
              <p key={i} className="text-sm text-slate-300 leading-relaxed mb-3 last:mb-0">{para}</p>
            ))}
          </div>
        </Section>
      )}

      {/* ── EXTRACTED FIELDS ──────────────────────────────────────── */}
      <Section title="Date extrase" icon={FileText} color="text-accent" badge={fields.length + additional.length} defaultOpen={false}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {fields.map(f => (
            <div key={f.label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{f.label}</p>
              <p className="text-sm text-white break-words">{f.value}</p>
            </div>
          ))}
          {additional.map((a, i) => (
            <div key={`add-${i}`} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">{a.label}</p>
              <p className="text-sm text-white break-words">{a.value}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── ISSUES ───────────────────────────────────────────────── */}
      {analysis.issues?.length > 0 && (
        <Section title="Probleme identificate" icon={AlertTriangle} color="text-warning" badge={analysis.issues.length} defaultOpen={true}>
          <div className="space-y-2.5">
            {analysis.issues.map((iss, i) => {
              const sev = SEVERITY_CONFIG[iss.severity] || SEVERITY_CONFIG.info;
              const SevIcon = sev.icon;
              return (
                <div key={i} className="rounded-xl p-3.5" style={{ background: sev.bg, border: `1px solid ${sev.border}` }}>
                  <div className="flex items-start gap-2.5">
                    <SevIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: sev.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: sev.color + '20', color: sev.color }}>{sev.label}</span>
                        <p className="text-sm font-semibold text-white">{iss.title}</p>
                      </div>
                      <p className="text-xs text-slate-300 mb-1.5">{iss.description}</p>
                      {iss.how_to_fix && (
                        <p className="text-xs text-slate-400 italic">
                          <span className="font-semibold not-italic text-slate-300">Cum rezolvi: </span>{iss.how_to_fix}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── NEXT ACTIONS ─────────────────────────────────────────── */}
      {analysis.next_actions?.length > 0 && (
        <Section title="Pași recomandați" icon={ArrowRight} color="text-green-400" badge={analysis.next_actions.length} defaultOpen={true}>
          <div className="space-y-2">
            {analysis.next_actions.map((act, i) => {
              const urgColor = URGENCY_COLOR[act.urgency] || URGENCY_COLOR.low;
              const hint = act.workflow_hint;
              const Wrapper = hint ? Link : 'div';
              return (
                <Wrapper
                  key={i}
                  to={hint ? `/start?workflow=${hint}` : undefined}
                  className="flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <span className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                    style={{ background: urgColor + '20', color: urgColor }}>{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{act.label}</p>
                    {act.why && <p className="text-xs text-slate-400 mt-0.5">{act.why}</p>}
                  </div>
                  {hint && <ArrowRight className="w-4 h-4 text-slate-500 shrink-0" />}
                </Wrapper>
              );
            })}
          </div>
        </Section>
      )}

      {/* ── GLOSSARY ─────────────────────────────────────────────── */}
      {analysis.glossary?.length > 0 && (
        <Section title="Glosar de termeni" icon={BookOpen} color="text-accent" badge={analysis.glossary.length} defaultOpen={false}>
          <div className="space-y-2.5">
            {analysis.glossary.map((g, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-semibold text-accent mb-1">{g.term}</p>
                <p className="text-xs text-slate-300 leading-relaxed">{g.meaning}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ── CTA ───────────────────────────────────────────────────── */}
      {analysis.suggested_workflow_id && (
        <Link to={`/start?workflow=${analysis.suggested_workflow_id}`}>
          <div className="rounded-2xl p-5 text-center hover:scale-[1.01] transition-transform cursor-pointer"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.10))', border: '1px solid rgba(37,99,235,0.3)' }}>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-bold text-white">Pornește procedura recomandată</p>
            </div>
            <p className="text-xs text-slate-400">NoQueue AI îți pregătește documentele și institutia</p>
          </div>
        </Link>
      )}

      <p className="text-[10px] text-slate-600 text-center pt-2">
        ⚖️ Informații orientative — Verifică detaliile cu instituția emitentă înainte de orice acțiune oficială.
      </p>
    </motion.div>
  );
}