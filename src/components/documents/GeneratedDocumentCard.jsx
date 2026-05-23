import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, ExternalLink, RefreshCw, Cloud, CloudOff,
  CheckCircle2, AlertTriangle, Building2, ShieldAlert, Info,
  Eye, Loader2, CloudUpload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import DocumentStatusBadge from './DocumentStatusBadge';
import { isDocumentStale } from '@/lib/documents/documentGenerationService';
import { uploadFileToDrive, getOrCreateFolder, isTokenValid, requestAccessToken, openInDrive } from '@/lib/google/driveClient';
import { base44 } from '@/api/base44Client';

const LABEL_ICONS = {
  'Ready to print':        '✅',
  'Needs signature':       '✍️',
  'Needs notarisation':    '⚖️',
  'Office-only form':      '🏛️',
  'NoQueue prep sheet':    '📋',
  'In-person required':    '🚶',
  'Appointment needed':    '📅',
  'Can do online':         '🌐',
};

export default function GeneratedDocumentCard({ doc, currentProfile, onRegenerate, showProcedure = false }) {
  const [uploading, setUploading] = useState(false);
  const [driveResult, setDriveResult] = useState(null);
  const [error, setError] = useState(null);

  const isStale = isDocumentStale(doc, currentProfile);
  const isOfficial = doc.official_submittable;
  const isPrepSheet = doc.fill_method === 'support-sheet';
  const isOfficeOnly = doc.source_type === 'physical_office_only';

  const handleDownload = () => {
    if (!doc.pdf_file_url) return;
    const a = document.createElement('a');
    a.href = doc.pdf_file_url;
    a.download = doc.download_file_name || `${doc.document_key}.pdf`;
    a.target = '_blank';
    a.click();
  };

  const handleDriveUpload = async () => {
    setUploading(true);
    setError(null);
    try {
      if (!isTokenValid()) await requestAccessToken();

      // Fetch the PDF blob
      const res = await fetch(doc.pdf_file_url);
      const blob = await res.blob();

      const folderId = await getOrCreateFolder('NoQueue Documents');
      const result = await uploadFileToDrive({
        blob,
        fileName: doc.download_file_name || `${doc.document_key}.pdf`,
        folderId,
        existingFileId: doc.google_drive_file_id || null,
      });

      // Update entity
      await base44.entities.GeneratedDocument.update(doc.id, {
        drive_upload_status: 'uploaded',
        google_drive_file_id: result.id,
        google_drive_web_view_link: result.webViewLink,
      });

      setDriveResult(result);
    } catch (e) {
      setError(e.message);
      await base44.entities.GeneratedDocument.update(doc.id, { drive_upload_status: 'error' });
    }
    setUploading(false);
  };

  const driveStatus = driveResult ? 'uploaded' : doc.drive_upload_status;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden transition-all ${
        isStale
          ? 'bg-warning/5 border-warning/20'
          : isPrepSheet
          ? 'bg-white/[0.03] border-white/8'
          : 'bg-primary/5 border-primary/15'
      }`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isPrepSheet ? 'bg-slate-700/50' : 'bg-primary/15'
          }`}>
            <FileText className={`w-4 h-4 ${isPrepSheet ? 'text-slate-400' : 'text-primary'}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white leading-snug">{doc.document_title}</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">{doc.source_label}</p>
                {showProcedure && doc.procedure_key && (
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    Procedure: {doc.procedure_key.replace(/-/g, ' ')} ·{' '}
                    {new Date(doc.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              <DocumentStatusBadge status={doc.status} stale={isStale} />
            </div>

            {/* Type badge */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              {isPrepSheet && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-white/8">
                  <ShieldAlert className="w-3 h-3" />
                  NoQueue Prep Sheet — Non-official
                </span>
              )}
              {isOfficial && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <CheckCircle2 className="w-3 h-3" />
                  Official form
                </span>
              )}
              {driveStatus === 'uploaded' && (
                <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/20">
                  <Cloud className="w-3 h-3" />
                  Saved to Drive
                </span>
              )}
            </div>

            {/* Action labels */}
            {doc.instruction_labels?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {doc.instruction_labels.map(label => (
                  <span key={label} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-400">
                    {LABEL_ICONS[label] || '•'} {label}
                  </span>
                ))}
              </div>
            )}

            {/* Missing fields warning */}
            {doc.missing_profile_fields?.length > 0 && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-destructive bg-destructive/8 px-2 py-1 rounded-lg">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                Missing: {doc.missing_profile_fields.join(', ')}
              </div>
            )}

            {/* Stale warning */}
            {isStale && (
              <div className="mt-2 flex items-center gap-1.5 text-[10px] text-warning bg-warning/8 px-2 py-1 rounded-lg">
                <RefreshCw className="w-3 h-3" />
                Profile updated — document may be outdated
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="mt-1 text-[10px] text-destructive">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {doc.pdf_file_url && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors border border-white/10"
          >
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
        )}

        {doc.pdf_file_url && (
          <a
            href={doc.pdf_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors border border-white/10"
          >
            <Eye className="w-3.5 h-3.5" />
            Preview
          </a>
        )}

        {doc.source_url && (
          <a
            href={doc.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-400 text-xs font-medium hover:bg-white/10 transition-colors border border-white/10"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Official source
          </a>
        )}

        {driveStatus === 'uploaded' && (doc.google_drive_web_view_link || driveResult?.webViewLink) ? (
          <button
            onClick={() => openInDrive(doc.google_drive_web_view_link || driveResult?.webViewLink)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success/10 text-success text-xs font-medium hover:bg-success/20 transition-colors border border-success/20"
          >
            <Cloud className="w-3.5 h-3.5" />
            Open in Drive
          </button>
        ) : doc.pdf_file_url ? (
          <button
            onClick={handleDriveUpload}
            disabled={uploading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/10 text-blue-400 text-xs font-medium hover:bg-blue-600/20 transition-colors border border-blue-500/20 disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5" />}
            {uploading ? 'Uploading…' : 'Save to Drive'}
          </button>
        ) : null}

        {(isStale || doc.status === 'missing_profile_data') && onRegenerate && (
          <button
            onClick={() => onRegenerate(doc)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-warning/10 text-warning text-xs font-medium hover:bg-warning/20 transition-colors border border-warning/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerate
          </button>
        )}
      </div>

      {/* Non-official disclaimer */}
      {isPrepSheet && (
        <div className="px-4 pb-3">
          <p className="text-[9px] text-slate-600 italic">
            ⚠ This is a NoQueue preparation sheet, not an official government form. Verify all requirements at the official institution before submitting.
          </p>
        </div>
      )}
    </motion.div>
  );
}