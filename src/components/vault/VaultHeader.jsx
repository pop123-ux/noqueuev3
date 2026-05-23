import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, AlertTriangle, Clock, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VaultHeader({ stats, onUpload }) {
  const cards = [
    {
      label: 'Total Documents',
      value: stats.total,
      icon: FileText,
      color: '#2563eb',
      bg: 'rgba(37,99,235,0.1)',
    },
    {
      label: 'Expiring Soon',
      value: stats.expiring,
      icon: Clock,
      color: '#facc15',
      bg: 'rgba(250,204,21,0.1)',
    },
    {
      label: 'Expired',
      value: stats.expired,
      icon: AlertTriangle,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
    },
  ];

  return (
    <div className="py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">Secure Storage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Digital Government Vault</h1>
          <p className="mt-2 text-slate-400 max-w-lg">
            Store, organize, and monitor all your government documents in one secure place.
          </p>
        </div>
        <Button
          onClick={onUpload}
          className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-xl gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-3 gap-4"
      >
        {cards.map((c, i) => (
          <div
            key={c.label}
            className="glass-card rounded-2xl p-4 sm:p-5"
            style={{ borderColor: `${c.color}20` }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: c.bg }}>
                <c.icon className="w-4 h-4" style={{ color: c.color }} />
              </div>
              <span className="text-[10px] sm:text-xs text-slate-500 font-medium">{c.label}</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{c.value}</div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}