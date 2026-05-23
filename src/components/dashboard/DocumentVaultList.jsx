import React from 'react';
import { motion } from 'framer-motion';

const MOCK_DOCS = [
  { icon: '🪪', name: 'Carte_Identitate_RO.pdf',         status: 'Verificat' },
  { icon: '📜', name: 'Certificat_Nastere_Digital.pdf',   status: 'Verificat' },
  { icon: '🔑', name: 'Semnatura_Digitala.cert',          status: 'Valid' },
];

function LiveDot() {
  return (
    <span className="relative flex h-1.5 w-1.5 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-40" />
      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
    </span>
  );
}

export default function DocumentVaultList() {
  return (
    <div className="divide-y divide-white/[0.05]">
      {MOCK_DOCS.map((doc, i) => (
        <motion.div
          key={doc.name}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 + i * 0.07 }}
          className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
        >
          <span className="text-base leading-none shrink-0">{doc.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{doc.name}</p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <LiveDot />
            <span className="text-[10px] font-semibold text-emerald-400">{doc.status}</span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}