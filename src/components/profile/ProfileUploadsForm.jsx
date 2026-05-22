import React, { useState } from 'react';
import { Upload, X, CheckCircle2, Loader2, Eye, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function UploadSlot({ label, description, fieldKey, currentUrl, onUpload, accept = 'image/jpeg,image/png,application/pdf' }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentUrl || null);
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Local preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }

    setUploading(true);
    setError(null);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    setUploading(false);
    setPreview(file_url);
    onUpload(fieldKey, file_url);
  };

  const inputId = `upload-${fieldKey}`;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-4">
      <p className="text-xs font-semibold text-white mb-0.5">{label}</p>
      {description && <p className="text-[11px] text-slate-500 mb-3">{description}</p>}

      {preview ? (
        <div className="relative">
          {preview.startsWith('data:image') || preview.match(/\.(jpg|jpeg|png|webp)(\?|$)/i) ? (
            <img
              src={preview}
              alt={label}
              className="w-full max-h-32 object-contain rounded-xl bg-white/5 border border-white/8"
            />
          ) : (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/8">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-xs text-slate-300 truncate">{preview.split('/').pop()}</span>
            </div>
          )}
          <div className="flex gap-2 mt-2">
            <a
              href={preview}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-primary hover:text-primary/80"
            >
              <Eye className="w-3 h-3" /> View
            </a>
            <label htmlFor={inputId} className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white cursor-pointer">
              <Upload className="w-3 h-3" /> Replace
            </label>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-white/10 hover:border-primary/40 cursor-pointer transition-colors group"
        >
          {uploading ? (
            <Loader2 className="w-5 h-5 text-primary animate-spin" />
          ) : (
            <Upload className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
          )}
          <span className="text-xs text-slate-500 group-hover:text-slate-300 transition-colors">
            {uploading ? 'Uploading…' : 'Click to upload'}
          </span>
          <span className="text-[10px] text-slate-600">JPG, PNG or PDF</span>
        </label>
      )}

      {error && <p className="text-[11px] text-destructive mt-1">{error}</p>}

      <input
        id={inputId}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
        disabled={uploading}
      />
    </div>
  );
}

export default function ProfileUploadsForm({ profile, onUpload }) {
  const slots = [
    {
      key: 'signature_file_url',
      label: 'Signature',
      description: 'White background, clear signature. Used to pre-fill forms where permitted.',
    },
    {
      key: 'id_front_file_url',
      label: 'ID Card — Front',
      description: 'Front of your Carte de Identitate. Used for OCR pre-fill.',
    },
    {
      key: 'id_back_file_url',
      label: 'ID Card — Back',
      description: 'Back of your Carte de Identitate.',
    },
    {
      key: 'headshot_file_url',
      label: 'Headshot / Photo',
      description: 'Used only where a document explicitly requires a photo.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/8 border border-blue-500/15">
        <AlertTriangle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-300 leading-relaxed">
          Uploaded files are stored in your private app account only. They are never shared publicly and are used only to pre-fill your documents.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map(slot => (
          <UploadSlot
            key={slot.key}
            label={slot.label}
            description={slot.description}
            fieldKey={slot.key}
            currentUrl={profile?.[slot.key] || null}
            onUpload={onUpload}
          />
        ))}
      </div>
    </div>
  );
}