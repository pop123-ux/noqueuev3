/**
 * AppointmentWatch — Slot monitoring
 * Users set watches for appointment availability at Cluj institutions
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Zap, Bell, Plus, Trash2, Pause, Play, CheckCircle2, Clock,
  Building2, Globe, AlertTriangle, Loader2, ChevronDown, X, Info
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { clujInstitutions } from '@/lib/data/clujInstitutions';
import { Button } from '@/components/ui/button';

const APPOINTABLE = clujInstitutions.filter(i => i.appointmentRequired || i.onlineServices);

const STATUS_CONFIG = {
  active: { label: 'Watching', color: 'text-success', bg: 'bg-success/10', dot: 'bg-success animate-pulse' },
  paused: { label: 'Paused', color: 'text-slate-400', bg: 'bg-white/5', dot: 'bg-slate-600' },
  fulfilled: { label: 'Fulfilled', color: 'text-primary', bg: 'bg-primary/10', dot: 'bg-primary' },
  expired: { label: 'Expired', color: 'text-destructive', bg: 'bg-destructive/10', dot: 'bg-destructive' },
};

const SERVICES = [
  'Passport renewal', 'Urgent passport', 'ID card renewal',
  'ID card first issuance', 'Driving license renewal',
  'Vehicle registration', 'ANAF consultation', 'CJAS health insurance',
  'Birth certificate', 'Marriage registration', 'Criminal record (cazier)',
];

function WatchForm({ onClose, onCreate }) {
  const [service, setService] = useState('');
  const [institution, setInstitution] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('any');
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const handleCreate = async () => {
    if (!service || !institution || !dateFrom || !dateTo) return;
    setSaving(true);
    const inst = APPOINTABLE.find(i => i.id === institution);
    await onCreate({
      service_name: service,
      institution_id: institution,
      institution_name: inst?.name || '',
      date_from: dateFrom,
      date_to: dateTo,
      preferred_time_of_day: timeOfDay,
      notification_email: email,
      status: 'active',
    });
    setSaving(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card rounded-2xl border border-primary/20 p-5 mb-5"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          Set Appointment Watch
        </h3>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Service</label>
          <div className="relative">
            <select
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-primary/50"
            >
              <option value="">Select service...</option>
              {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Institution</label>
          <div className="relative">
            <select
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-primary/50"
            >
              <option value="">Select institution...</option>
              {APPOINTABLE.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">From</label>
            <input
              type="date"
              value={dateFrom}
              min={today}
              max={maxDate}
              onChange={e => setDateFrom(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1.5 block">To</label>
            <input
              type="date"
              value={dateTo}
              min={dateFrom || today}
              max={maxDate}
              onChange={e => setDateTo(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Preferred time</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ v: 'any', l: 'Any time' }, { v: 'morning', l: 'Morning' }, { v: 'afternoon', l: 'Afternoon' }].map(t => (
              <button
                key={t.v}
                onClick={() => setTimeOfDay(t.v)}
                className={`py-2 rounded-xl border text-xs transition-all ${
                  timeOfDay === t.v
                    ? 'bg-primary/15 border-primary/40 text-white font-medium'
                    : 'bg-white/[0.03] border-white/8 text-slate-400 hover:border-white/20'
                }`}
              >
                {t.l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-slate-400 mb-1.5 block">Alert email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@email.com"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
          />
        </div>

        <div className="rounded-xl bg-warning/6 border border-warning/15 p-3">
          <p className="text-[10px] text-slate-400 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
            NoQueue monitors official appointment portals. You'll be notified when a slot matching your criteria becomes available.
          </p>
        </div>

        <Button
          onClick={handleCreate}
          disabled={saving || !service || !institution || !dateFrom || !dateTo}
          className="w-full bg-primary hover:bg-primary/90 rounded-xl"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
          Activate Watch
        </Button>
      </div>
    </motion.div>
  );
}

function WatchCard({ watch, onToggle, onDelete }) {
  const status = STATUS_CONFIG[watch.status] || STATUS_CONFIG.active;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="glass-card rounded-2xl border border-white/8 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="mt-0.5">
            <div className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">{watch.service_name}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Building2 className="w-3 h-3" />
              {watch.institution_name}
            </p>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {watch.date_from} → {watch.date_to}
              </span>
              {watch.preferred_time_of_day !== 'any' && (
                <span className="capitalize">{watch.preferred_time_of_day}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>
            {status.label}
          </span>
          <button
            onClick={() => onToggle(watch)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            {watch.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => onDelete(watch.id)}
            className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-destructive hover:bg-destructive/10 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AppointmentWatchPage() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: watches = [], isLoading } = useQuery({
    queryKey: ['appointment-watches'],
    queryFn: () => base44.entities.AppointmentWatch.list('-created_date', 50),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.AppointmentWatch.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment-watches'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AppointmentWatch.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment-watches'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AppointmentWatch.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointment-watches'] }),
  });

  const handleToggle = (watch) => {
    const newStatus = watch.status === 'active' ? 'paused' : 'active';
    updateMutation.mutate({ id: watch.id, data: { status: newStatus } });
  };

  const activeCount = watches.filter(w => w.status === 'active').length;

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue AI</span>
        </Link>
        <Link to="/cases" className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1">
          My Cases
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary" />
              Appointment Hunter
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              {activeCount > 0
                ? `${activeCount} active watch${activeCount > 1 ? 'es' : ''} running`
                : 'Monitor appointment slots — get alerted when one opens up'}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            size="sm"
            className="bg-primary hover:bg-primary/90 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            New Watch
          </Button>
        </div>

        {/* Info banner */}
        <div className="rounded-2xl bg-primary/6 border border-primary/15 p-4 mb-6">
          <p className="text-xs text-slate-300 leading-relaxed">
            <span className="text-primary font-semibold">How it works:</span> NoQueue checks official Cluj appointment portals periodically.
            When a slot matching your criteria appears, you get notified immediately — no more manual refresh loops.
          </p>
        </div>

        <AnimatePresence>
          {showForm && (
            <WatchForm
              onClose={() => setShowForm(false)}
              onCreate={async (data) => { await createMutation.mutateAsync(data); }}
            />
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : watches.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">No appointment watches yet</p>
            <Button onClick={() => setShowForm(true)} size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" />
              Create your first watch
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {watches.map(w => (
                <WatchCard
                  key={w.id}
                  watch={w}
                  onToggle={handleToggle}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}