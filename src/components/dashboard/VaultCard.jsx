import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import DocumentVaultList from './DocumentVaultList';

export default function VaultCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.08 }}
      className="rounded-2xl p-5 h-full flex flex-col"
      style={{
        background: 'rgba(15, 20, 36, 0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Vault</span>
      </div>
      <p className="text-xs text-slate-600 mb-5">Seif Documente</p>

      {/* Document list */}
      <div className="flex-1">
        <DocumentVaultList />
      </div>

      {/* CTA */}
      <div className="mt-5 pt-4 border-t border-white/[0.05]">
        <Link
          to="/digital-vault"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white transition-all border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/20"
        >
          Gestionează Documente
        </Link>
      </div>
    </motion.div>
  );
}