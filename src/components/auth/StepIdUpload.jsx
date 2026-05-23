/**
 * StepIdUpload — Step 3: ID card upload + OCR verification
 */
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle2, AlertTriangle, Loader2, Edit3, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { validateUploadedFile } from '@/lib/security/fileValidation';
import { encryptField } from '@/lib/security/encryption';
import { checkRateLimit } from '@/lib/security/rateLimiter';
import { logAuditEvent } from '@/lib/security/auditLogger';

const OCR_SCHEMA = {
  type: 'object',
  properties: {
    last_name: { type: 'string' }, first_name: { type: 'string' }, cnp: { type: 'string' },
    sex: { type: 'string' }, birth_date: { type: 'string' }, birth_place: { type: 'string' },
    address: { type: 'string' }, id_series: { type: 'string' }, id_number: { type: 'string' },
    id_issued_by: { type: 'string' }, id_issue_date: { type: 'string' }, id_expiry_date: { type: 'string' },
  },
};

const OCR_PROMPT = `Ești un asistent OCR specializat în acte de identitate românești. Extrage câmpurile din imaginea cărții de identitate și returnează DOAR un obiect JSON valid, fără text suplimentar, cu structura: { last_name, first_name, cnp, sex, birth_date, birth_place, address, id_series, id_number, id_issued_by, id_issue_date, id_expiry_date }. Dacă un câmp nu este lizibil sau nu există, setează-l null. Nu inventa date.`;

const LABELS = {
  last_name: 'Nume', first_name: 'Prenume', cnp: 'CNP', sex: 'Sex',
  birth_date: 'Data nașterii', birth_place: 'Locul nașterii', address: 'Adresă',
  id_series: 'Serie CI', id_number: 'Număr CI', id_issued_by: 'Eliberat de',
  id_issue_date: 'Data eliberării', id_expiry_date: 'Valabil până',
};

export default function StepIdUpload({ user, onComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | processing | review | saving | error
  const [ocrData, setOcrData] = useState(null);
  const [editData, setEditData] = useState(null);
  const [editing, setEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef();

  const handleFile = (f) => {
    const validation = validateUploadedFile(f);
    if (!validation.valid) { setErrorMsg(validation.error); return; }
    setFile(f);
    setErrorMsg('');
    if (f.type.startsWith('image/')) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
    setStatus('idle');
    setOcrData(null);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleOCR = async () => {
    const rl = checkRateLimit('ocr', user?.email || 'anon');
    if (!rl.allowed) { setErrorMsg(rl.message); return; }
    setStatus('processing');
    setErrorMsg('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: OCR_PROMPT,
        file_urls: [file_url],
        model: 'claude_sonnet_4_6',
        response_json_schema: OCR_SCHEMA,
      });
      const required = ['last_name', 'first_name', 'cnp', 'id_series', 'id_number'];
      if (!result || required.every(k => !result[k])) {
        setErrorMsg('Nu am putut citi actul. Asigură-te că fotografia este clară și încearcă din nou.');
        setStatus('error');
        return;
      }
      setOcrData({ ...result, _file_url: file_url });
      setEditData({ ...result });
      setStatus('review');
    } catch (e) {
      setErrorMsg('Nu am putut citi actul. Asigură-te că fotografia este clară și încearcă din nou.');
      setStatus('error');
    }
  };

  const handleConfirm = async () => {
    setStatus('saving');
    try {
      const data = editing ? editData : ocrData;
      const enc = async (v) => v ? await encryptField(v, user.email) : null;
      const [encCnp, encSeries, encNumber] = await Promise.all([
        enc(data.cnp), enc(data.id_series), enc(data.id_number),
      ]);

      const profilePayload = {
        user_id: user.email,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: [data.first_name, data.last_name].filter(Boolean).join(' '),
        birth_date: data.birth_date,
        id_series: encSeries,
        id_number: encNumber,
        id_issued_by: data.id_issued_by,
        id_issue_date: data.id_issue_date,
        id_expiry_date: data.id_expiry_date,
        id_front_file_url: data._file_url,
        identity_ocr_verified: true,
      };

      const cnpMasked = data.cnp ? data.cnp.slice(0, 4) + '******' + data.cnp.slice(-3) : null;
      const secretPayload = {
        user_id: user.email,
        cnp_raw: encCnp,
        cnp_masked: cnpMasked,
        id_series: encSeries,
        id_number: encNumber,
        birth_date: data.birth_date,
        verified_by_user_at: new Date().toISOString(),
      };

      const [profiles, secrets] = await Promise.all([
        base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1),
        base44.entities.IdentitySecret.filter({ user_id: user.email }, '-created_date', 1),
      ]);

      await Promise.all([
        profiles?.length
          ? base44.entities.UserPrivateProfile.update(profiles[0].id, profilePayload)
          : base44.entities.UserPrivateProfile.create(profilePayload),
        secrets?.length
          ? base44.entities.IdentitySecret.update(secrets[0].id, secretPayload)
          : base44.entities.IdentitySecret.create(secretPayload),
      ]);

      logAuditEvent({ userId: user.email, action: 'identity_ocr_verified', resourceType: 'UserPrivateProfile', details: 'ID card OCR verified and confirmed by user' });
      onComplete();
    } catch (e) {
      setErrorMsg('Eroare la salvare. Încearcă din nou.');
      setStatus('review');
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Verifică-ți identitatea</h2>
        <p className="text-slate-400 text-sm">Încarcă o fotografie a cărții tale de identitate.</p>
      </div>

      {status !== 'review' && (
        <div
          onDrop={handleDrop}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 mb-4 ${
            dragging ? 'border-primary bg-primary/10' : 'border-white/15 hover:border-white/25 bg-white/[0.02]'
          }`}
        >
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          {preview ? (
            <div className="w-full text-center">
              <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain mb-3" />
              <p className="text-xs text-slate-400">{file?.name}</p>
              <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setStatus('idle'); }} className="mt-2 text-xs text-destructive hover:text-destructive/80">
                <X className="w-3 h-3 inline mr-1" />Elimină
              </button>
            </div>
          ) : file ? (
            <div className="text-center">
              <FileText className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm text-slate-300">{file.name}</p>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
              <p className="text-sm text-slate-300 font-medium">Trage fișierul aici sau apasă pentru a selecta</p>
              <p className="text-xs text-slate-600 mt-1">JPG, PNG sau PDF · max 10 MB</p>
            </div>
          )}
        </div>
      )}

      {errorMsg && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{errorMsg}</p>
        </div>
      )}

      {status === 'review' && ocrData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 border border-white/8 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-white">Sunt acestea datele tale?</p>
            <button onClick={() => setEditing(!editing)} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
              <Edit3 className="w-3 h-3" />{editing ? 'Anulează editarea' : 'Editează'}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(LABELS).map(([key, label]) => {
              const val = (editing ? editData : ocrData)[key];
              return (
                <div key={key} className="flex items-center gap-2 text-xs">
                  <span className="text-slate-500 w-28 shrink-0">{label}</span>
                  {editing ? (
                    <input
                      value={editData[key] || ''}
                      onChange={e => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
                      className="flex-1 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-primary/50"
                    />
                  ) : (
                    <span className={val ? 'text-white font-medium' : 'text-slate-600 italic'}>
                      {val || '—'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {status === 'idle' || status === 'error' ? (
        <Button onClick={handleOCR} disabled={!file} className="w-full h-11 rounded-xl bg-primary disabled:opacity-40">
          Verifică actul
        </Button>
      ) : status === 'processing' ? (
        <Button disabled className="w-full h-11 rounded-xl bg-primary/60">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />Se procesează actul...
        </Button>
      ) : status === 'review' ? (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setStatus('idle'); setOcrData(null); }} className="flex-1 h-11 rounded-xl border-white/15 text-slate-300">
            Refă
          </Button>
          <Button onClick={handleConfirm} className="flex-1 h-11 rounded-xl bg-primary">
            <CheckCircle2 className="w-4 h-4 mr-2" />Confirmă
          </Button>
        </div>
      ) : status === 'saving' ? (
        <Button disabled className="w-full h-11 rounded-xl bg-primary/60">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />Se salvează...
        </Button>
      ) : null}
    </div>
  );
}