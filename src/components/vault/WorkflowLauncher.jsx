/**
 * WorkflowLauncher — Quick access to common government workflows
 * Like a shortcut dock for bureaucracy
 */
import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const WORKFLOWS = [
  { id: 'id-renewal',           emoji: '🪪', label: 'Renew ID Card',        color: '#2563eb', key: 'id_card' },
  { id: 'passport-renewal',     emoji: '🛂', label: 'Renew Passport',       color: '#8b5cf6', key: 'passport' },
  { id: 'driving-license',      emoji: '🚗', label: 'Renew Driver License', color: '#f97316', key: 'driver_license' },
  { id: 'change-address',       emoji: '🏠', label: 'Change Address',       color: '#22c55e', key: 'change_address' },
  { id: 'criminal-record',      emoji: '⚖️', label: 'Criminal Record Cert',  color: '#a855f7', key: 'criminal_record' },
  { id: 'health-insurance',     emoji: '🏥', label: 'Health Insurance',     color: '#06b6d4', key: 'health_insurance' },
  { id: 'vehicle-registration', emoji: '🚙', label: 'Vehicle Registration', color: '#f97316', key: 'vehicle_registration' },
  { id: 'anaf-tax',             emoji: '💰', label: 'ANAF / Tax',           color: '#facc15', key: 'tax_form' },
];

export default function WorkflowLauncher() {
  return (
    <div className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span className="text-xs font-semibold text-white">Quick Workflows</span>
        </div>
        <Link to="/start" className="text-[10px] text-primary hover:text-primary/80 flex items-center gap-0.5">
          All workflows <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {WORKFLOWS.map((wf, i) => (
          <Link
            key={wf.id}
            to={`/start?procedure=${wf.id}&from_vault=1`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl transition-all cursor-pointer hover:bg-white/5"
              style={{ border: `1px solid ${wf.color}15` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${wf.color}15` }}
              >
                {wf.emoji}
              </div>
              <span className="text-[9px] text-slate-400 text-center leading-tight line-clamp-2">{wf.label}</span>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}