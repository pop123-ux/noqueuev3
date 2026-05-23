/**
 * StepSignature — Step 4: Draw or upload a handwritten signature
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { PenLine, Upload, Trash2, CheckCircle2, Loader2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { validateUploadedFile } from '@/lib/security/fileValidation';
import { logAuditEvent } from '@/lib/security/auditLogger';

const SIG_VALIDATION_PROMPT = 'Does this image contain a handwritten signature? Reply with only YES or NO.';

export default function StepSignature({ user, onComplete }) {
  const [tab, setTab] = useState('draw'); // 'draw' | 'upload'
  const [confirmed, setConfirmed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [hasCoverage, setHasCoverage] = useState(false);

  const canvasRef = useRef();
  const drawing = useRef(false);
  const lastPos = useRef(null);
  const uploadRef = useRef();

  // ── Canvas setup ────────────────────────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#1e3a5f';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setHasCoverage(false);
  }, []);

  useEffect(() => { initCanvas(); }, [initCanvas]);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const src = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  };

  const checkCoverage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let colored = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 230 || data[i + 1] < 230 || data[i + 2] < 230) colored++;
    }
    return colored / (canvas.width * canvas.height) >= 0.02;
  };

  const startDraw = (e) => {
    e.preventDefault();
    drawing.current = true;
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!drawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const endDraw = (e) => {
    e.preventDefault();
    drawing.current = false;
    setHasCoverage(checkCoverage());
  };

  const clearCanvas = () => { initCanvas(); setPreviewUrl(null); };

  const handleCanvasConfirm = () => {
    if (!hasCoverage) { setError('Te rugăm să desenezi semnătura înainte de a confirma.'); return; }
    setError('');
    const url = canvasRef.current.toDataURL('image/png');
    setPreviewUrl(url);
    setConfirmed(true);
  };

  // ── Upload tab ──────────────────────────────────────────────────
  const handleUploadFile = async (f) => {
    const v = validateUploadedFile(f);
    if (!v.valid) { setError(v.error); return; }
    if (!f.type.startsWith('image/')) { setError('Acceptăm doar JPG sau PNG pentru semnătură.'); return; }
    setLoading(true);
    setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: f });
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: SIG_VALIDATION_PROMPT,
        file_urls: [file_url],
        model: 'claude_sonnet_4_6',
      });
      if (!String(result).trim().toUpperCase().startsWith('YES')) {
        setError('Nu am detectat o semnătură validă în această imagine. Te rugăm să încarci o fotografie cu semnătura ta pe fundal alb.');
        setLoading(false);
        return;
      }
      setUploadedFile({ file: f, file_url });
      setPreviewUrl(URL.createObjectURL(f));
    } catch {
      setError('Eroare la procesarea imaginii. Încearcă din nou.');
    }
    setLoading(false);
  };

  const handleUploadConfirm = () => {
    setConfirmed(true);
  };

  // ── Save ────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      let fileUrl;
      if (tab === 'draw') {
        // Convert base64 canvas to blob then upload
        const dataUrl = canvasRef.current.toDataURL('image/png');
        const blob = await (await fetch(dataUrl)).blob();
        const f = new File([blob], `sig_${Date.now()}.png`, { type: 'image/png' });
        const res = await base44.integrations.Core.UploadFile({ file: f });
        fileUrl = res.file_url;
      } else {
        fileUrl = uploadedFile?.file_url;
        if (!fileUrl) {
          const res = await base44.integrations.Core.UploadFile({ file: uploadedFile.file });
          fileUrl = res.file_url;
        }
      }

      const [profiles, secrets] = await Promise.all([
        base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1),
        base44.entities.IdentitySecret.filter({ user_id: user.email }, '-created_date', 1),
      ]);

      await Promise.all([
        profiles?.length
          ? base44.entities.UserPrivateProfile.update(profiles[0].id, { signature_file_url: fileUrl, signature_collected: true })
          : base44.entities.UserPrivateProfile.create({ user_id: user.email, signature_file_url: fileUrl, signature_collected: true }),
        secrets?.length
          ? base44.entities.IdentitySecret.update(secrets[0].id, { signature_file_url: fileUrl })
          : base44.entities.IdentitySecret.create({ user_id: user.email, signature_file_url: fileUrl }),
      ]);

      logAuditEvent({ userId: user.email, action: 'signature_collected', resourceType: 'UserPrivateProfile', details: `Method: ${tab}` });
      onComplete();
    } catch {
      setError('Eroare la salvare. Încearcă din nou.');
      setSaving(false);
    }
  };

  // ── Confirmed preview ───────────────────────────────────────────
  if (confirmed) {
    return (
      <div>
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Confirmă semnătura</h2>
          <p className="text-slate-400 text-sm">Previzualizare finală a semnăturii tale.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white flex items-center justify-center p-6 mb-6" style={{ minHeight: 120 }}>
          {previewUrl && <img src={previewUrl} alt="Semnătură" className="max-h-28 max-w-full object-contain" />}
        </div>
        {error && <p className="text-xs text-destructive mb-4">{error}</p>}
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => { setConfirmed(false); setPreviewUrl(null); setUploadedFile(null); }} className="flex-1 h-11 rounded-xl border-white/15 text-slate-300">
            Refă
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 h-11 rounded-xl bg-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
            Confirmă semnătura
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Adaugă semnătura ta</h2>
        <p className="text-slate-400 text-sm">Semnătura va fi folosită pentru completarea automată a documentelor oficiale.</p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-white/10 mb-5">
        {[['draw', 'Desenează', PenLine], ['upload', 'Încarcă', Upload]].map(([key, label, Icon]) => (
          <button key={key} onClick={() => { setTab(key); setError(''); }} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${tab === key ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'}`}>
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {tab === 'draw' && (
        <div>
          <div className="rounded-2xl overflow-hidden border border-white/15 bg-white mb-3">
            <canvas
              ref={canvasRef}
              width={480}
              height={160}
              className="w-full touch-none cursor-crosshair"
              style={{ display: 'block' }}
              onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
              onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
            />
          </div>
          <div className="flex gap-3 mb-4">
            <button onClick={clearCanvas} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
              <Trash2 className="w-3.5 h-3.5" />Șterge
            </button>
            {!hasCoverage && <span className="text-xs text-slate-600 ml-auto">Desenează semnătura în spațiul de mai sus</span>}
          </div>
          {error && <p className="text-xs text-destructive mb-3">{error}</p>}
          <Button onClick={handleCanvasConfirm} disabled={!hasCoverage} className="w-full h-11 rounded-xl bg-primary disabled:opacity-40">
            <CheckCircle2 className="w-4 h-4 mr-2" />Previzualizează semnătura
          </Button>
        </div>
      )}

      {tab === 'upload' && (
        <div>
          <div
            onClick={() => uploadRef.current?.click()}
            className="rounded-2xl border-2 border-dashed border-white/15 hover:border-white/25 bg-white/[0.02] flex flex-col items-center justify-center p-8 cursor-pointer transition-colors mb-4"
          >
            <input ref={uploadRef} type="file" accept=".jpg,.jpeg,.png" className="hidden" onChange={e => e.target.files[0] && handleUploadFile(e.target.files[0])} />
            {previewUrl ? (
              <div className="text-center">
                <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto rounded-xl object-contain mb-2" />
                <button onClick={e => { e.stopPropagation(); setPreviewUrl(null); setUploadedFile(null); }} className="text-xs text-destructive">
                  <X className="w-3 h-3 inline mr-1" />Elimină
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-slate-500 mb-2" />
                <p className="text-sm text-slate-300 font-medium">Încarcă imagine cu semnătura</p>
                <p className="text-xs text-slate-600 mt-1">JPG sau PNG · max 5 MB · fundal alb</p>
              </>
            )}
          </div>
          {loading && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 mb-4">
              <Loader2 className="w-4 h-4 animate-spin" />Se verifică semnătura...
            </div>
          )}
          {error && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 mb-4">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">{error}</p>
            </div>
          )}
          {previewUrl && !loading && (
            <Button onClick={handleUploadConfirm} className="w-full h-11 rounded-xl bg-primary">
              <CheckCircle2 className="w-4 h-4 mr-2" />Previzualizează semnătura
            </Button>
          )}
        </div>
      )}
    </div>
  );
}