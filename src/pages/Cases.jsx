/**
 * Cases — Persistent Case Workspace
 * The "case OS" dashboard: all user cases, status, next actions
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Zap, Plus, ChevronRight, Globe, MapPin, Clock, CheckCircle2,
  Circle, AlertTriangle, Loader2, Trash2, FileText, Building2,
  ArrowUpRight, Edit3, X, BarChart2, User, FileOutput
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import GeneratedDocumentsPanel from '@/components/documents/GeneratedDocumentsPanel';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-primary', bg: 'bg-primary/10', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'text-warning', bg: 'bg-warning/10', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
};

const CHANNEL_LABELS = {
  online: { label: 'Online', icon: '🌐', color: 'text-success' },
  appointment: { label: 'Appointment', icon: '📅', color: 'text-warning' },
  'walk-in': { label: 'Walk-in', icon: '🚶', color: 'text-slate-400' },
  concierge: { label: 'Concierge', icon: '👑', color: 'text-accent' },
};

const URGENCY_COLORS = {
  normal: 'text-slate-500',
  urgent: 'text-warning',
  critical: 'text-destructive',
};

function CaseCard({ cas, onUpdateStatus, onDelete, currentProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const status = STATUS_CONFIG[cas.status] || STATUS_CONFIG.open;
  const channel = CHANNEL_LABELS[cas.channel] || CHANNEL_LABELS['walk-in'];
  const StatusIcon = status.icon;

  const completedCount = cas.completed_documents?.length || 0;
  const totalCount = cas.required_documents?.length || 0;
  const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card rounded-2xl border border-white/8 overflow-hidden"
    >
      {/* Header row */}
      <div
        className="p-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`mt-0.5 w-8 h-8 rounded-xl ${status.bg} flex items-center justify-center shrink-0`}>
              <StatusIcon className={`w-4 h-4 ${status.color} ${cas.status === 'in-progress' ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-white truncate">{cas.procedure_title}</h3>
                <span className={`text-[10px] font-bold uppercase ${URGENCY_COLORS[cas.urgency]}`}>
                  {cas.urgency !== 'normal' ? cas.urgency : ''}
                </span>
              </div>
              {cas.institution_name && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3" />
                  {cas.institution_name}
                </p>
              )}
              <div className="flex items-center gap-3 mt-1.5">
                <span className={`text-xs ${channel.color}`}>{channel.icon} {channel.label}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${status.bg} ${status.color} font-medium`}>
                  {status.label}
                </span>
                <span className="text-xs text-slate-600">
                  {new Date(cas.created_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {cas.can_do_online && cas.online_url && (
              <a
                href={cas.online_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(cas.id); }}
              className="p-1.5 rounded-lg bg-white/5 text-slate-500 hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Document progress bar */}
        {totalCount > 0 && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
              <span>Documents ready</span>
              <span>{completedCount}/{totalCount}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3">
              {cas.next_action && (
                <div className="rounded-xl bg-primary/6 border border-primary/15 p-3">
                  <p className="text-[10px] font-semibold text-primary mb-1">Next action</p>
                  <p className="text-xs text-slate-300">{cas.next_action}</p>
                </div>
              )}

              {cas.required_documents?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Required documents</p>
                  <div className="space-y-1">
                    {cas.required_documents.map(doc => {
                      const done = cas.completed_documents?.includes(doc);
                      return (
                        <div key={doc} className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const completed = cas.completed_documents || [];
                              const next = done
                                ? completed.filter(d => d !== doc)
                                : [...completed, doc];
                              onUpdateStatus(cas.id, { completed_documents: next });
                            }}
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                              done ? 'bg-success border-success' : 'border-white/20 hover:border-success'
                            }`}
                          >
                            {done && <CheckCircle2 className="w-3 h-3 text-white" />}
                          </button>
                          <span className={`text-xs ${done ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                            {doc}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {cas.user_description && (
                <p className="text-[10px] text-slate-600 italic">"{cas.user_description}"</p>
              )}

              {/* Generated documents toggle */}
              <button
                onClick={() => setShowDocs(!showDocs)}
                className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white/[0.03] border border-white/8 hover:border-primary/30 transition-all"
              >
                <span className="flex items-center gap-2 text-xs text-slate-400">
                  <FileOutput className="w-3.5 h-3.5 text-accent" />
                  Generated documents
                </span>
                <ChevronRight className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showDocs ? 'rotate-90' : ''}`} />
              </button>

              {showDocs && (
                <div className="mt-1">
                  <GeneratedDocumentsPanel
                    caseId={cas.id}
                    procedureKey={cas.procedure_key}
                    currentProfile={currentProfile}
                  />
                </div>
              )}

              {/* Status controls */}
              <div className="flex flex-wrap gap-2 pt-1">
                {['open', 'in-progress', 'completed', 'blocked'].map(s => (
                  <button
                    key={s}
                    onClick={() => onUpdateStatus(cas.id, { status: s })}
                    className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                      cas.status === s
                        ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-transparent`
                        : 'bg-white/[0.03] text-slate-500 border-white/8 hover:border-white/20'
                    }`}
                  >
                    {STATUS_CONFIG[s].label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Cases() {
  const [filter, setFilter] = useState('all');
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 50),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profile-cases'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user?.email) return [];
      return base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1);
    },
  });
  const currentProfile = profiles[0] || null;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Case.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Case.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] }),
  });

  const filtered = filter === 'all' ? cases : cases.filter(c => c.status === filter);

  const stats = {
    total: cases.length,
    open: cases.filter(c => c.status === 'open').length,
    completed: cases.filter(c => c.status === 'completed').length,
    online: cases.filter(c => c.can_do_online).length,
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/profile" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
            <User className="w-3.5 h-3.5" />
            Profile
          </Link>
          <Link to="/start">
            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" />
              New Case
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">My Cases</h1>
            <p className="text-sm text-slate-400 mt-0.5">Persistent case workspace</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Open', value: stats.open, color: 'text-primary' },
            { label: 'Done', value: stats.completed, color: 'text-success' },
            { label: 'Online', value: stats.online, color: 'text-accent' },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-3 text-center border border-white/8">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-5">
          {['all', 'open', 'in-progress', 'completed', 'blocked'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all ${
                filter === f
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/[0.03] text-slate-400 border-white/8 hover:border-white/20'
              }`}
            >
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {/* Cases list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">
              {filter === 'all' ? 'No cases yet' : `No ${filter} cases`}
            </p>
            <Link to="/start">
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
                <Plus className="w-4 h-4 mr-1.5" />
                Start a case
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence>
              {filtered.map(cas => (
                <CaseCard
                  key={cas.id}
                  cas={cas}
                  onUpdateStatus={(id, data) => updateMutation.mutate({ id, data })}
                  onDelete={(id) => deleteMutation.mutate(id)}
                  currentProfile={currentProfile}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}