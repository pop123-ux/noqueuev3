/**
 * IdUploadStep — Step 2: Upload or capture Romanian ID card
 */
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Upload, X, ScanLine, ArrowRight, ArrowLeft, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ACCEPTED = '.jpg,.jpeg,.png,.heic,.pdf';

export default function IdUploadStep({ onNext, onBack }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const cameraRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(f));
    } else {
      setPreview(null);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
    if (cameraRef.current) cameraRef.current.value = '';
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 mb-3">
          <ScanLine className="w-3 h-3 text-primary" />
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider">Scanare buletin</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Scanează cartea de identitate</h2>
        <p className="text-sm text-slate-400 max-w-sm mx-auto">
          OCR-ul nostru extrage automat datele. Poți face poză sau încărca o imagine existentă.
        </p>
      </div>

      {!file && (
        <>
          {/* Mobile camera frame */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileRef.current?.click()}
            className="relative rounded-3xl overflow-hidden cursor-pointer transition-all mb-3"
            style={{
              background: dragOver ? 'rgba(37,99,235,0.10)' : 'rgba(17,28,51,0.7)',
              border: dragOver ? '2px dashed rgba(37,99,235,0.5)' : '2px dashed rgba(255,255,255,0.10)',
              minHeight: 240,
            }}
          >
            {/* Animated scan frame */}
            <div className="absolute inset-6 rounded-2xl border-2 border-primary/30 pointer-events-none">
              <div className="absolute -top-px -left-px w-6 h-6 border-t-2 border-l-2 border-primary rounded-tl-2xl" />
              <div className="absolute -top-px -right-px w-6 h-6 border-t-2 border-r-2 border-primary rounded-tr-2xl" />
              <div className="absolute -bottom-px -left-px w-6 h-6 border-b-2 border-l-2 border-primary rounded-bl-2xl" />
              <div className="absolute -bottom-px -right-px w-6 h-6 border-b-2 border-r-2 border-primary rounded-br-2xl" />
              {/* Scan line */}
              <motion.div
                animate={{ y: ['0%', '100%', '0%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute left-2 right-2 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
                style={{ boxShadow: '0 0 12px rgba(37,99,235,0.8)' }}
              />
            </div>

            <div className="flex flex-col items-center justify-center px-6 py-12 relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow-blue">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm font-semibold text-white mb-1">Poziționează cartea de identitate</p>
              <p className="text-[11px] text-slate-500 text-center max-w-xs">
                Apasă pentru a încărca · sau trage fișierul aici
              </p>
            </div>

            <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => handleFile(e.target.files?.[0])} />
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <button
              onClick={() => cameraRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)', color: '#22d3ee' }}
            >
              <Camera className="w-4 h-4" />
              Fă o poză
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#cbd5e1' }}
            >
              <ImageIcon className="w-4 h-4" />
              Din galerie
            </button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={e => handleFile(e.target.files?.[0])}
          />

          <p className="text-[10px] text-slate-600 text-center mt-4">
            Formate: JPG, PNG, HEIC, PDF · Max 10 MB · Imaginea este auto-rotită
          </p>
        </>
      )}

      {file && (
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: 'rgba(17,28,51,0.7)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {preview ? (
            <div className="relative">
              <img src={preview} alt="ID preview" className="w-full max-h-72 object-contain bg-black/30" />
              <button
                onClick={clear}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white backdrop-blur"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-sm text-white">{file.name}</p>
              <button onClick={clear} className="text-xs text-destructive mt-2">Elimină</button>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 mt-4">
        <Button variant="outline" onClick={onBack} className="flex-1 h-12 rounded-2xl border-white/15 text-slate-300">
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Înapoi
        </Button>
        <Button
          onClick={() => onNext(file)}
          disabled={!file}
          className="flex-1 h-12 rounded-2xl bg-primary disabled:opacity-40 font-semibold"
        >
          Scanează <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </motion.div>
  );
}