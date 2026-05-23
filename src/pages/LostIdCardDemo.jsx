/**
 * /demo/lost-id-card — Lost/Stolen ID Card workflow
 *
 * Mirrors the passport demo flow:
 *  - Loads UserPrivateProfile from Seiful de Identitate
 *  - Shows profile completeness + missing fields for this specific form
 *  - Lets the user edit the "reason" sentence inserted into the request
 *  - Generates a NoQueue-styled draft PDF locally with pdf-lib
 *  - Persists a GeneratedDocument record so it shows up in My Cases
 *
 * No PII is sent to any LLM. The PDF is built deterministically.
 */
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Zap, Shield, FileText, Download, Loader2,
  CheckCircle2, AlertTriangle, PenLine, Users, ExternalLink, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { buildLostIdCardApplicationPdf } from '@/lib/documents/pdf/buildLostIdCardApplicationPdf';
import { buildLostIdCardOverlayPdf } from '@/lib/documents/pdf/buildLostIdCardOverlayPdf';

// Template-overlay output is fragile without proper calibration — keep it
// disabled by default. The clean NoQueue layout is the stable demo path.
const USE_TEMPLATE_OVERLAY = false;
import {
  LOST_ID_REQUIRED_FIELDS,
  getMissingLostIdFields,
} from '@/lib/documents/lostIdCardRequiredFields';

const DEFAULT_REASON = 'Pierderea actului de identitate';
const DOWNLOAD_NAME = 'NoQueue_cerere_eliberare_act_identitate_pierdere.pdf';

function triggerDownload(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Best-effort: upload + persist as GeneratedDocument. Never blocks the download. */
async function persistGeneratedDocument({ bytes, user, missingCount }) {
  try {
    const file = new File([bytes], DOWNLOAD_NAME, { type: 'application/pdf' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.GeneratedDocument.create({
      user_id: user?.email || 'anonymous_demo_user',
      document_key: 'cerere-eliberare-act-identitate-pierdere',
      document_title: 'Cerere eliberare act de identitate — pierdere/furt',
      status: missingCount > 0 ? 'needs_review' : 'ready',
      fill_method: 'stable_generated_pdf',
      official_submittable: false,
      source_type: 'noqueue_generated_draft',
      source_label: 'NoQueue — cerere pregătită pe baza datelor din Seif',
      pdf_file_url: file_url,
      download_file_name: DOWNLOAD_NAME,
      mime_type: 'application/pdf',
      procedure_key: 'lost-id-card',
      instruction_labels: [
        'Auto-completat din Seiful de Identitate',
        missingCount > 0 ? 'Necesită verificare — câmpuri lipsă' : 'Semnătură inclusă',
        'Verificați înainte de depunere',
      ],
    });
    return file_url;
  } catch (err) {
    console.warn('[LostIdCardDemo] persist failed:', err?.message);
    return null;
  }
}

/** Best-effort: ensure a Case row exists for this user. Never blocks. */
async function ensureCase({ user, reason }) {
  try {
    if (!user?.email) return;
    const existing = await base44.entities.Case.filter(
      { user_id: user.email, procedure_key: 'lost-id-card' }, '-created_date', 1
    );
    if (existing?.length) return existing[0];
    return await base44.entities.Case.create({
      user_id: user.email,
      procedure_key: 'lost-id-card',
      procedure_title: 'Declarare pierdere/furt buletin',
      institution_name: 'S.P.C.E.P. / Evidența Persoanelor',
      channel: 'appointment',
      status: 'open',
      urgency: 'normal',
      user_description: 'Mi-am pierdut buletinul',
      required_documents: [
        'Certificat de naștere',
        'Dovada adresei de domiciliu',
        'Cerere completată (ANEXA nr. 11)',
        'Declarație pierdere/furt',
        'Dovada achitării taxei',
      ],
      next_action: 'Completează motivul solicitării și descarcă cererea pregătită.',
    });
  } catch (err) {
    console.warn('[LostIdCardDemo] case create failed:', err?.message);
  }
}

function FieldChip({ label, ok }) {
  return (
    <span
      className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border inline-flex items-center gap-1 ${
        ok
          ? 'bg-green-500/10 text-green-400 border-green-500/25'
          : 'bg-warning/10 text-warning border-warning/25'
      }`}
    >
      {ok ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
      {label}
    </span>
  );
}

export default function LostIdCardDemo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState(DEFAULT_REASON);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const u = await base44.auth.me().catch(() => null);
        if (cancelled) return;
        setUser(u);
        if (u?.email) {
          const profiles = await base44.entities.UserPrivateProfile
            .filter({ user_id: u.email }, '-created_date', 1);
          if (!cancelled) setProfile(profiles?.[0] || null);
          // Fire-and-forget case creation so the workflow shows up in My Cases.
          ensureCase({ user: u });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const missing = getMissingLostIdFields(profile);
  const filledCount = LOST_ID_REQUIRED_FIELDS.length - missing.length;
  const completionPct = Math.round((filledCount / LOST_ID_REQUIRED_FIELDS.length) * 100);
  const hasSignature = !!profile?.signature_file_url;
  const showGuardian = !!(profile?.is_minor_applicant || profile?.represented_by_legal_guardian);
  const guardianSigOk = !!profile?.legal_representative_signature_file_url;

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setError('');
    setSuccess(false);
    try {
      const bytes = USE_TEMPLATE_OVERLAY
        ? await buildLostIdCardOverlayPdf({ profile: profile || {}, reason })
        : await buildLostIdCardApplicationPdf({ profile: profile || {}, reason });
      triggerDownload(bytes, DOWNLOAD_NAME);
      // Persist async — UI does not wait
      persistGeneratedDocument({ bytes, user, missingCount: missing.length });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('[LostIdCardDemo] generate failed:', err);
      setError('Nu am putut genera PDF-ul. Verifică datele din Seiful de Identitate.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-inter relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 60%)' }} />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Top nav */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Înapoi
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">NoQueue</span>
          </div>
        </div>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
            <Sparkles className="w-3 h-3 text-primary" />
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
              Buletin pierdut → Cerere completată automat
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Cerere eliberare act de identitate
          </h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Datele din Seiful de Identitate sunt folosite pentru a pregăti cererea
            de eliberare a actului de identitate (ANEXA nr. 11) în caz de pierdere/furt.
          </p>

          <div
            className="mt-4 rounded-2xl px-4 py-3 flex items-start gap-2.5"
            style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.22)' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-bold text-accent uppercase tracking-wider mb-0.5">
                Format demo stabil
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Pentru stabilitate în demo, NoQueue generează o versiune curată a cererii,
                cu aceleași date necesare, în locul suprapunerii fragile pe imagine scanată.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Completeness card */}
        <div className="glass-card rounded-2xl p-5 mb-4 border border-white/8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-white">Profil Seif</span>
            </div>
            <span className="text-2xl font-bold" style={{ color: completionPct >= 80 ? '#22c55e' : completionPct >= 50 ? '#facc15' : '#ef4444' }}>
              {completionPct}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-3">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completionPct}%` }} />
          </div>
          <p className="text-[11px] text-slate-500">
            {filledCount} din {LOST_ID_REQUIRED_FIELDS.length} câmpuri obligatorii sunt completate.
          </p>
        </div>

        {/* Reason card */}
        <div className="glass-card rounded-2xl p-5 mb-4 border border-white/8">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-white">Motivul solicitării</span>
          </div>
          <p className="text-[11px] text-slate-500 mb-2 italic">
            Acest text va fi introdus în zona: «Rog să mi se elibereze actul de identitate pentru motivul:»
          </p>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            className="w-full bg-white/[0.04] border border-white/10 text-white placeholder:text-slate-600 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary/40 transition-colors"
            placeholder="Pierderea actului de identitate"
          />
        </div>

        {/* Missing fields card */}
        {missing.length > 0 && (
          <div className="rounded-2xl p-5 mb-4"
            style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}>
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-warning">
                  Câmpuri lipsă din Seif ({missing.length})
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  PDF-ul va fi generat ca draft cu marcaje «[completați manual]».
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {missing.map(f => <FieldChip key={f.key} label={f.label} ok={false} />)}
            </div>
            <Link to="/vault">
              <Button variant="outline" className="w-full h-9 rounded-xl border-warning/30 text-warning hover:bg-warning/10 text-xs">
                <Shield className="w-3.5 h-3.5 mr-1.5" />
                Completează în Seiful de Identitate
                <ExternalLink className="w-3 h-3 ml-1.5 opacity-60" />
              </Button>
            </Link>
          </div>
        )}

        {/* Signature status */}
        <div className="glass-card rounded-2xl p-5 mb-4 border border-white/8">
          <div className="flex items-center gap-2 mb-3">
            <PenLine className="w-4 h-4 text-accent" />
            <span className="text-sm font-semibold text-white">Semnătură solicitant</span>
          </div>
          {hasSignature ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center bg-white rounded-lg p-2 w-32 h-16">
                <img
                  src={profile.signature_file_url}
                  alt="Semnătură"
                  className="max-h-12 max-w-full object-contain"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-success font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Conectată la Seif
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Va apărea automat la «Semnătura solicitant».
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-warning font-semibold">Lipsește semnătura solicitantului</p>
                <Link to="/vault" className="text-[11px] text-primary hover:text-primary/80 underline">
                  Adaugă semnătură în Seif →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Legal representative (collapsible based on profile) */}
        {showGuardian && (
          <div className="glass-card rounded-2xl p-5 mb-4 border border-white/8">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-sm font-semibold text-white">Reprezentant legal</span>
            </div>
            {guardianSigOk ? (
              <p className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Semnătura reprezentantului este conectată
              </p>
            ) : (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Lipsește semnătura părintelui / reprezentantului legal.{' '}
                  <Link to="/vault" className="text-primary underline">Completează în Seif</Link>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Generate */}
        <div className="glass-card rounded-2xl p-5 mb-4 border border-white/8">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            aria-busy={generating}
            className="w-full h-12 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none' }}
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Se generează PDF-ul...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" />Generează cererea completată</>
            )}
          </Button>
          {success && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              PDF generat și salvat în Dosarele mele.
            </div>
          )}
          {error && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Link to="/cases">
              <Button variant="outline" className="w-full h-9 rounded-xl border-white/15 text-slate-300 text-xs">
                <FileText className="w-3.5 h-3.5 mr-1.5" /> Dosarele mele
              </Button>
            </Link>
            <Link to="/vault">
              <Button variant="outline" className="w-full h-9 rounded-xl border-white/15 text-slate-300 text-xs">
                <Shield className="w-3.5 h-3.5 mr-1.5" /> Seiful de Identitate
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-[10px] text-slate-600 text-center leading-relaxed max-w-md mx-auto">
          NoQueue pregătește documentul pentru verificare. Cerințele finale trebuie confirmate la
          S.P.C.E.P. / Direcția de Evidență a Persoanelor.
        </p>
      </div>
    </div>
  );
}