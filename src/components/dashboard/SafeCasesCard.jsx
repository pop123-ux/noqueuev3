import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import ActiveWorkflowCard from './ActiveWorkflowCard';

export default function SafeCasesCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl p-5 h-full"
      style={{
        background: 'rgba(15, 20, 36, 0.95)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
    >
      {/* Card header */}
      <div className="flex items-center gap-2 mb-1">
        <Shield className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Safe</span>
      </div>
      <p className="text-xs text-slate-600 mb-5">Cazuri Active</p>

      <ActiveWorkflowCard />
    </motion.div>
  );
}