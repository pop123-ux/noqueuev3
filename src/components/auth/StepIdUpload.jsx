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

// ── OCR config ──────────────────────────────────────────────────────────────

const OCR_SCHEMA = {
  type: 'object',
  properties: {
    last_name: { type: 'string' }, first_name: { type: 'string' }, cnp: { type: 'string' },
    sex: { type: 'string' }, birth_date: { type: 'string' }, birth_place: { type: 'string' },
    address: { type: 'string' }, id_series: { type: 'string' }, id_number: { type: 'string' },
    id_issued_by: { type: 'string' }, id_issue_date: { type: 'string' }, id_expiry_date: { type: 'string' },
    nationality: { type: 'string' },
  },
};

const OCR_PROMPT = `Ești un asistent OCR specializat în cărți de identitate românești (Carte de Identitate).

Analizează imaginea și extrage câmpurile de mai jos. Urmează aceste reguli stricte:

1. Citește câmpurile vizuale mai întâi. Folosește etichetele bilingve ca ghid:
   - 'Nume / Last name' → last_name
   - 'Prenume / First name' → first_name
   - 'CNP' (număr roșu de 13 cifre) → cnp
   - 'SERIA [XX] NR [NNNNNN]' → id_series (2 litere) și id_number (6 cifre)
   - 'Cetățenie' → nationality (returnează codul ROU dacă prezent)
   - 'Loc naștere' → birth_place
   - 'Domiciliu' → address (include tot textul adresei)
   - 'Emisă de' → id_issued_by
   - 'Valabilitate' → câmpul conține două date separate prin '-': prima este id_issue_date, a doua este id_expiry_date
   - 'Sex' → sex (M sau F)

2. Pentru date calendaristice: normalizează la format ISO YYYY-MM-DD.
   Exemplu: '17.05.23' → '2023-05-17', '08.04.2027' → '2027-04-08'
   Dacă anul are 2 cifre și e între 00-30, presupune 20XX. Dacă e între 31-99, presupune 19XX.
   Extrage birth_date din CNP: cifrele 2-7 din CNP reprezintă AANNZZ (ex: 090408 → 2009-04-08 pentru CNP începând cu 5).

3. Dacă un câmp vizual e neclar, folosește MRZ (cele două rânduri de la baza cărții) ca fallback:
   - Rândul 2 MRZ: primele caractere = id_series+id_number, pozițiile 7-12 = birth_date (AANNZZ), poziția 13 = sex, pozițiile 14-19 = expiry_date (AANNZZ), pozițiile 20-32 = CNP

4. Returnează DOAR un obiect JSON valid, fără text, fără markdown, fără explicații:
{"last_name":"DRÎNDA","first_name":"DARIUS-MATEI","cnp":"5090408125788","sex":"M","birth_date":"2009-04-08","birth_place":"Jud.CJ Mun.Cluj-Napoca","address":"Jud.CJ Sat.Florești (Com.Florești), Str.Prof. Ioan Rusu nr.50","id_series":"CJ","id_number":"697708","id_issued_by":"SPCJEP CLUJ","id_issue_date":"2023-05-17","id_expiry_date":"2027-04-08","nationality":"ROU"}

5. Nu inventa sau ghici date. Dacă un câmp nu este lizibil și nu poate fi dedus din MRZ, setează-l null.`;

// ── Helpers ─────────────────────────────────────────────────────────────────

function birthDateFromCNP(cnp) {
  if (!cnp || cnp.length !== 13) return null;
  const s = parseInt(cnp[0]);
  const yy = cnp.slice(1, 3);
  const mm = cnp.slice(3, 5);
  const dd = cnp.slice(5, 7);
  let yyyy;
  if (s === 1 || s === 2) yyyy = '19' + yy;
  else if (s === 3 || s === 4) yyyy = '18' + yy;
  else if (s === 5 || s === 6) yyyy = '20' + yy;
  else if (s === 7 || s === 8) yyyy = '19' + yy;
  else yyyy = '20' + yy;
  return `${yyyy}-${mm}-${dd}`;
}

function validateOcrResult(data) {
  const errors = [];
  if (!data.last_name || !data.first_name) errors.push('Nume lipsă');
  if (!data.cnp || !/^\d{13}$/.test(data.cnp)) errors.push('CNP invalid');
  if (!data.id_series || !/^[A-Z]{2}$/.test(data.id_series)) errors.push('Seria CI invalidă');
  if (!data.id_number || !/^\d{6}$/.test(data.id_number)) errors.push('Numărul CI invalid');
  if (data.id_expiry_date && new Date(data.id_expiry_date) <= new Date()) errors.push('EXPIRED');
  return errors;
}

const LABELS = {
  last_name: 'Nume', first_name: 'Prenume', cnp: 'CNP', sex: 'Sex',
  birth_date: 'Data nașterii', birth_place: 'Locul nașterii', address: 'Adresă',
  id_series: 'Serie CI', id_number: 'Număr CI', id_issued_by: 'Eliberat de',
  id_issue_date: 'Data eliberării', id_expiry_date: 'Valabil până', nationality: 'Naționalitate',
};

// ── Component ────────────────────────────────────────────────────────────────

export default function StepIdUpload({ user, onComplete }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | processing | review | saving | error
  const [retryCount, setRetryCount] = useState(0);
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
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
    setStatus('idle');
    setOcrData(null);
    setRetryCount(0);
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

      // Auto-fill birth_date from CNP if OCR missed it
      if (!result.birth_date && result.cnp) {
        result.birth_date = birthDateFromCNP(result.cnp);
      }

      const validationErrors = validateOcrResult(result);

      if (validationErrors.includes('EXPIRED')) {
        setErrorMsg('Actul de identitate este expirat. Te rugăm să folosești un act valabil.');
        setStatus('error');
        return;
      }

      const coreFieldsMissing = !result.last_name || !result.first_name ||
        !/^\d{13}$/.test(result.cnp) || !/^[A-Z]{2}$/.test(result.id_series) || !/^\d{6}$/.test(result.id_number);

      if (coreFieldsMissing) {
        setRetryCount(c => c + 1);
        setErrorMsg(retryCount >= 1
          ? 'Nu am putut citi actul. Sfaturi: ✓ Fotografiază pe fundal închis ✓ Asigură-te că toate cele 4 colțuri sunt vizibile ✓ Evită reflexiile și umbrele ✓ Ține camera paralelă cu actul'
          : 'Nu am putut citi actul. Asigură-te că fotografia este clară și încearcă din nou.');
        setStatus('error');
        return;
      }

      setOcrData({ ...result, _file_url: file_url });
      setEditData({ ...result });
      setStatus('review');
    } catch {
      setRetryCount(c => c + 1);
      setErrorMsg(retryCount >= 1
        ? 'Nu am putut citi actul. Sfaturi: ✓ Fotografiază pe fundal închis ✓ Asigură-te că toate cele 4 colțuri sunt vizibile ✓ Evită reflexiile și umbrele ✓ Ține camera paralelă cu actul'
        : 'Nu am putut citi actul. Asigură-te că fotografia este clară și încearcă din nou.');
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
    } catch {
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
          <input ref={inputRef} type="file" accept=".jpg,.jpeg,.png,.pdf" className="hidden"
            onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
          {preview ? (
            <div className="w-full text-center">
              <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded-xl object-contain mb-3" />
              <p className="text-xs text-slate-400">{file?.name}</p>
              <button onClick={e => { e.stopPropagation(); setFile(null); setPreview(null); setStatus('idle'); }}
                className="mt-2 text-xs text-destructive hover:text-destructive/80">
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
          <p className="text-xs text-destructive leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {status === 'review' && ocrData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-4 border border-white/8 mb-4">
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
                    <span className={val ? 'text-white font-medium' : 'text-slate-600 italic'}>{val || '—'}</span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {(status === 'idle' || status === 'error') && (
        <Button onClick={handleOCR} disabled={!file} className="w-full h-11 rounded-xl bg-primary disabled:opacity-40">
          Verifică actul
        </Button>
      )}
      {status === 'processing' && (
        <Button disabled className="w-full h-11 rounded-xl bg-primary/60">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />Se procesează actul...
        </Button>
      )}
      {status === 'review' && (
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setStatus('idle'); setOcrData(null); }}
            className="flex-1 h-11 rounded-xl border-white/15 text-slate-300">Refă</Button>
          <Button onClick={handleConfirm} className="flex-1 h-11 rounded-xl bg-primary">
            <CheckCircle2 className="w-4 h-4 mr-2" />Confirmă
          </Button>
        </div>
      )}
      {status === 'saving' && (
        <Button disabled className="w-full h-11 rounded-xl bg-primary/60">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />Se salvează...
        </Button>
      )}
    </div>
  );
}