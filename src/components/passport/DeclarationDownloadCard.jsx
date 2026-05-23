/**
 * DeclarationDownloadCard
 *
 * UI block that sits under the on-screen declaration preview in PassportDemo.
 * - If the user has a saved signature in Seiful de Identitate, generates and
 *   downloads a PDF with that signature placed near the "Semnatura" field.
 * - If not, shows a warning + "Adauga semnatura" CTA linking to /vault.
 * - Optionally persists a GeneratedDocument record so the file shows up in
 *   the user's case documents list.
 *
 * No personal data is sent to any LLM — PDF is built locally with pdf-lib.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Download, Loader2, CheckCircle2, AlertTriangle, PenLine, ShieldCheck, ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { buildPassportLossDeclarationPdf } from '@/lib/documents/pdf/buildPassportLossDeclarationPdf';

const DOWNLOAD_NAME = 'NoQueue_declaratie_pierdere_pasaport_semnata.pdf';

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

/** Best-effort persistence — never blocks the download. */
async function persistGeneratedDocument({ bytes, profile, signatureUrl }) {
  try {
    const user = await base44.auth.me().catch(() => null);
    const file = new File([bytes], DOWNLOAD_NAME, { type: 'application/pdf' });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.GeneratedDocument.create({
      user_id: user?.email || profile?.user_id || 'anonymous_demo_user',
      document_key: 'declaratie-pierdere-pasaport-demo',
      document_title: 'Declarație pierdere/furt pașaport',
      status: signatureUrl ? 'ready' : 'needs_review',
      fill_method: 'support-sheet',
      official_submittable: false,
      source_type: 'noqueue_demo',
      source_label: 'NoQueue Demo Pașaport',
      pdf_file_url: file_url,
      download_file_name: DOWNLOAD_NAME,
      mime_type: 'application/pdf',
      procedure_key: 'passport-lost-demo',
      instruction_labels: signatureUrl
        ? ['Auto-completat', 'Semnătură inclusă', 'Verifică înainte de depunere']
        : ['Auto-completat', 'Semnătură lipsă', 'Verifică înainte de depunere'],
    });
  } catch (err) {
    console.warn('[DeclarationDownloadCard] persist failed:', err?.message);
  }
}

export default function DeclarationDownloadCard({ profile }) {
  const signatureUrl = profile?.signature_file_url || null;
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const hasIncompleteProfile =
    !profile?.full_name && !(profile?.first_name && profile?.last_name);

  const handleGenerate = async () => {
    if (generating) return;
    setGenerating(true);
    setError('');
    setSuccess(false);
    try {
      const bytes = await buildPassportLossDeclarationPdf({ profile, signatureUrl });
      triggerDownload(bytes, DOWNLOAD_NAME);
      persistGeneratedDocument({ bytes, profile, signatureUrl });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      console.error('[DeclarationDownloadCard] generate failed:', err);
      setError('Nu am putut genera PDF-ul. Verifică dacă profilul și semnătura sunt salvate corect.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 mt-3"
      style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
          <PenLine className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
              PDF auto-completat
            </span>
            {signatureUrl ? (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/15 text-success border border-success/25 inline-flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5" /> Conectată la Seif
              </span>
            ) : (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/15 text-warning border border-warning/25 inline-flex items-center gap-1">
                <AlertTriangle className="w-2.5 h-2.5" /> Semnătură lipsă
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-white mt-1">
            Descarcă declarația cu semnătura ta
          </p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
            Folosește datele din profil și semnătura salvată în Seiful de Identitate.
          </p>
        </div>
      </div>

      {!signatureUrl && (
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-3"
          role="status"
          style={{ background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-warning mt-0.5 shrink-0" />
          <p className="text-xs text-warning">
            Nu ai încă o semnătură salvată în Seiful de Identitate.
          </p>
        </div>
      )}

      {hasIncompleteProfile && (
        <div
          className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-3 text-xs text-warning"
          role="status"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.18)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Unele câmpuri lipsesc din profil. Completează Seiful de Identitate pentru un PDF complet.
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleGenerate}
          disabled={generating}
          aria-busy={generating}
          aria-label="Descarcă PDF completat cu declarația și semnătura"
          className="flex-1 h-11 rounded-xl text-sm font-semibold"
          style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none' }}
        >
          {generating ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Se generează PDF-ul...</>
          ) : (
            <><Download className="w-4 h-4 mr-2" />Descarcă PDF completat</>
          )}
        </Button>

        {!signatureUrl && (
          <Link to="/vault" aria-label="Adaugă semnătură în Seiful de Identitate">
            <Button
              variant="outline"
              className="h-11 rounded-xl text-sm border-white/15 text-slate-200 hover:bg-white/5"
            >
              <PenLine className="w-4 h-4 mr-1.5" /> Adaugă semnătură
              <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
            </Button>
          </Link>
        )}
      </div>

      {success && (
        <div
          className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
          role="status"
          aria-live="polite"
          style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          {signatureUrl
            ? 'PDF generat cu semnătura din Seiful de Identitate.'
            : 'PDF generat. Adaugă semnătura din Seif pentru un document complet.'}
        </div>
      )}

      {error && (
        <div
          className="mt-3 flex items-start gap-2 px-3 py-2 rounded-xl text-xs"
          role="alert"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <p className="text-[10px] text-slate-600 mt-3 italic leading-relaxed">
        Document pregătit automat de NoQueue. Prototip demonstrativ — nu reprezintă o platformă oficială a statului.
      </p>
    </motion.div>
  );
}