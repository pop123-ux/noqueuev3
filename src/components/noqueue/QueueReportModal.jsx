/**
 * QueueReportModal — crowd-source real wait time data
 * Core to the Queue Signal Network: users submit observations that replace synthetic data
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Users, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { clujInstitutions } from '@/lib/data/clujInstitutions';

const CROWD_LEVELS = [
  { value: 'low', label: 'Low', emoji: '🟢', desc: 'Almost empty' },
  { value: 'medium', label: 'Medium', emoji: '🟡', desc: 'Some people' },
  { value: 'high', label: 'High', emoji: '🔴', desc: 'Very crowded' },
];

export default function QueueReportModal({ institutionId, onClose }) {
  const [waitMin, setWaitMin] = useState('');
  const [crowdLevel, setCrowdLevel] = useState('medium');
  const [selectedInstitution, setSelectedInstitution] = useState(institutionId || '');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!selectedInstitution || !waitMin) return;
    setSubmitting(true);
    const now = new Date();
    await base44.entities.QueueObservation.create({
      institution_id: selectedInstitution,
      institution_name: clujInstitutions.find(i => i.id === selectedInstitution)?.name || '',
      observed_wait_min: Number(waitMin),
      crowd_level: crowdLevel,
      day_of_week: now.getDay(),
      hour_of_day: now.getHours(),
      notes: notes.trim() || undefined,
    });
    setSubmitting(false);
    setSubmitted(true);
    setTimeout(onClose, 1800);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="glass rounded-2xl border border-white/10 w-full max-w-sm p-5"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <CheckCircle2 className="w-10 h-10 text-success" />
            <p className="text-sm font-semibold text-white">Report submitted!</p>
            <p className="text-xs text-slate-400 text-center">Thank you — your observation helps others plan smarter visits.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Report Queue Time
              </h3>
              <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">Help others by sharing your real wait time right now.</p>

            {/* Institution select */}
            {!institutionId && (
              <div className="mb-4">
                <label className="text-xs text-slate-400 mb-1.5 block">Institution</label>
                <div className="relative">
                  <select
                    value={selectedInstitution}
                    onChange={e => setSelectedInstitution(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-primary/50"
                  >
                    <option value="">Select institution...</option>
                    {clujInstitutions.map(i => (
                      <option key={i.id} value={i.id}>{i.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>
            )}

            {institutionId && (
              <div className="mb-4 px-3 py-2 rounded-xl bg-primary/8 border border-primary/15">
                <p className="text-xs text-slate-300 font-medium">
                  {clujInstitutions.find(i => i.id === institutionId)?.name}
                </p>
              </div>
            )}

            {/* Wait time */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-1.5 block">How long did you wait? (minutes)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={waitMin}
                onChange={e => setWaitMin(e.target.value)}
                placeholder="e.g. 25"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
              />
            </div>

            {/* Crowd level */}
            <div className="mb-4">
              <label className="text-xs text-slate-400 mb-2 block">Crowd level</label>
              <div className="grid grid-cols-3 gap-2">
                {CROWD_LEVELS.map(c => (
                  <button
                    key={c.value}
                    onClick={() => setCrowdLevel(c.value)}
                    className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border transition-all ${
                      crowdLevel === c.value
                        ? 'bg-primary/15 border-primary/40 text-white'
                        : 'bg-white/[0.03] border-white/8 text-slate-400 hover:border-white/20'
                    }`}
                  >
                    <span className="text-lg">{c.emoji}</span>
                    <span className="text-[10px] font-medium">{c.label}</span>
                    <span className="text-[9px] text-slate-500">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional notes */}
            <div className="mb-5">
              <label className="text-xs text-slate-400 mb-1.5 block">Notes (optional)</label>
              <input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="e.g. Counter 3 was fastest today"
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedInstitution || !waitMin}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-semibold disabled:opacity-40 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Users className="w-4 h-4" />}
              Submit Report
            </button>

            <p className="mt-3 text-[10px] text-slate-600 text-center">
              Anonymous report · helps build proprietary queue signal data
            </p>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}