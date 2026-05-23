/**
 * BackupCodesPanel — shown after TOTP setup so the user can save recovery codes.
 * Prototype-only: codes are kept in component state for the demo.
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, CheckCircle2, KeyRound } from 'lucide-react';

export default function BackupCodesPanel({ codes, onContinue }) {
  const [copied, setCopied] = useState(false);
  const [acked, setAcked] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(codes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDownload = () => {
    const blob = new Blob(
      [`NoQueue AI — Coduri de rezervă 2FA\n\n${codes.join('\n')}\n\nPăstrează-le într-un loc sigur.`],
      { type: 'text/plain' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'noqueue-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="text-center mb-5">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-3">
          <KeyRound className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-white mb-1">Coduri de rezervă</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Salvează aceste coduri într-un loc sigur. Le poți folosi dacă pierzi accesul la aplicația Google Authenticator.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 p-4 rounded-2xl bg-white/[0.03] border border-white/10">
        {codes.map((c, i) => (
          <div key={i} className="font-mono text-sm tracking-wider text-white text-center py-2 rounded-lg bg-white/[0.03]">
            {c}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCopy}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white transition-colors"
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? 'Copiat' : 'Copiază'}
        </button>
        <button
          onClick={handleDownload}
          className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-white transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          Descarcă
        </button>
      </div>

      <label className="flex items-start gap-2 text-xs text-slate-400 cursor-pointer mb-4">
        <input
          type="checkbox"
          checked={acked}
          onChange={e => setAcked(e.target.checked)}
          className="mt-0.5 accent-primary"
        />
        <span>Am salvat codurile într-un loc sigur.</span>
      </label>

      <button
        onClick={onContinue}
        disabled={!acked}
        className="w-full py-3 rounded-2xl bg-primary text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
      >
        Continuă
      </button>
    </motion.div>
  );
}