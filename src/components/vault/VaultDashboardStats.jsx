/**
 * VaultDashboardStats — Hero stats bar with Apple Wallet aesthetic
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, AlertTriangle, Clock, CheckCircle2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function VaultDashboardStats({ stats, onUpload }) {
  return (
    <div className="py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-widest text-primary">Civic OS · Secure Vault</div>
              <h1 className="text-xl font-bold text-white leading-tight">Digital Government Vault</h1>
            </div>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Your AI-powered civic assistant. Store documents, get smart actions, and navigate bureaucracy effortlessly.
          </p>
        </div>
        <Button
          onClick={onUpload}
          className="shrink-0 bg-primary hover:bg-primary/90 text-white rounded-2xl gap-2 h-11 px-5 font-semibold"
        >
          <Upload className="w-4 h-4" />
          Upload Document
        </Button>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
      >
        {[
          { label: 'Total Docs', value: stats.total, icon: FileText, color: '#2563eb', bg: 'rgba(37,99,235,0.1)' },
          { label: 'Valid', value: stats.valid, icon: CheckCircle2, color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
          { label: 'Expiring Soon', value: stats.expiring, icon: Clock, color: '#facc15', bg: 'rgba(250,204,21,0.1)' },
          { label: 'Expired', value: stats.expired, icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.04 }}
            className="glass-card rounded-2xl p-4"
            style={{ borderColor: `${s.color}18` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: s.bg }}>
                <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
              </div>
              <span className="text-[10px] text-slate-500 font-medium">{s.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{s.value}</div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}