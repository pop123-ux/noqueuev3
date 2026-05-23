/**
 * SmartDocUploader — Drag/drop + click upload zone for Smart Document Intelligence
 */
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles } from 'lucide-react';

const ACCEPTED = '.pdf,.png,.jpg,.jpeg,.webp,.html,.csv,.xlsx,.json';

export default function SmartDocUploader({ onFile, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    onFile(files[0]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
      className={`relative rounded-3xl p-10 sm:p-14 text-center transition-all cursor-pointer ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
      style={{
        background: dragOver ? 'rgba(37,99,235,0.10)' : 'rgba(17,28,51,0.7)',
        border: dragOver ? '2px dashed rgba(37,99,235,0.5)' : '2px dashed rgba(255,255,255,0.10)',
      }}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow-blue">
        <Upload className="w-7 h-7 text-white" />
      </div>

      <h3 className="text-xl font-bold text-white mb-2">Încarcă orice document oficial</h3>
      <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
        Buletin, pașaport, permis, certificat, contract, factură. AI-ul îl analizează, verifică validitatea și îți explică totul pe înțelesul tău.
      </p>

      <div className="flex flex-wrap justify-center gap-2 text-xs">
        {['PDF', 'JPG', 'PNG', 'WEBP'].map(t => (
          <span key={t} className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400">{t}</span>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Sparkles className="w-3 h-3 text-accent" /> OCR avansat
        </div>
        <span className="text-slate-700">·</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <FileText className="w-3 h-3 text-accent" /> Validare legislativă
        </div>
        <span className="text-slate-700">·</span>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          🇷🇴 Explicat în română
        </div>
      </div>
    </motion.div>
  );
}