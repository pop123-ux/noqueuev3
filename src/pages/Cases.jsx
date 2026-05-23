/**
 * Cases — AI Civic Case Workspace Dashboard
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Zap, Plus, ChevronRight, Globe, Clock, CheckCircle2,
  Circle, AlertTriangle, Loader2, Trash2, FileText,
  Building2, User, Sparkles, ArrowLeft } from
'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import CaseWorkspace from '@/components/cases/CaseWorkspace';

const STATUS_CONFIG = {
  open: { label: 'Open', color: 'text-primary', bg: 'bg-primary/10', icon: Circle },
  'in-progress': { label: 'In Progress', color: 'text-warning', bg: 'bg-warning/10', icon: Loader2 },
  completed: { label: 'Completed', color: 'text-success', bg: 'bg-success/10', icon: CheckCircle2 },
  blocked: { label: 'Blocked', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle }
};

const CHANNEL_ICONS = { online: '🌐', appointment: '📅', 'walk-in': '🚶', concierge: '👑' };

function CaseCard({ cas, onSelect, onUpdateStatus, onDelete }) {
  const status = STATUS_CONFIG[cas.status] || STATUS_CONFIG.open;
  const StatusIcon = status.icon;
  const completedCount = cas.completed_documents?.length || 0;
  const totalCount = cas.required_documents?.length || 0;
  const progress = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="glass-card rounded-2xl overflow-hidden border border-white/[0.06] hover:border-primary/20 transition-all cursor-pointer"
      onClick={() => onSelect(cas)}>
      
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-xl ${status.bg} flex items-center justify-center shrink-0 mt-0.5`}>
              <StatusIcon className={`w-4 h-4 ${status.color} ${cas.status === 'in-progress' ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">{cas.procedure_title}</h3>
              {cas.institution_name &&
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Building2 className="w-3 h-3" /> {cas.institution_name}
                </p>
              }
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="text-xs text-slate-400">{CHANNEL_ICONS[cas.channel]} {cas.channel}</span>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.color}`}>{status.label}</span>
                {cas.can_do_online &&
                <span className="text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full">Online</span>
                }
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <button
              onClick={(e) => {e.stopPropagation();onDelete(cas.id);}}
              className="p-1 rounded-lg text-slate-600 hover:text-destructive hover:bg-destructive/10 transition-colors">
              
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </div>
        </div>

        {totalCount > 0 &&
        <div>
            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>Docs ready</span><span>{completedCount}/{totalCount}</span>
            </div>
            <div className="h-1 bg-white/5 rounded-full overflow-hidden">
              <motion.div className="h-full bg-primary rounded-full" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
            </div>
          </div>
        }

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5" onClick={(e) => e.stopPropagation()}>
          {['open', 'in-progress', 'completed', 'blocked'].map((s) =>
          <button
            key={s}
            onClick={() => onUpdateStatus(cas.id, { status: s })}
            className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
            cas.status === s ?
            `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} border-transparent` :
            'bg-white/[0.03] text-slate-600 border-white/8 hover:border-white/20'}`
            }>
            
              {STATUS_CONFIG[s].label}
            </button>
          )}
        </div>
      </div>
    </motion.div>);

}

export default function Cases() {
  const [filter, setFilter] = useState('all');
  const [selectedCase, setSelectedCase] = useState(null);
  const queryClient = useQueryClient();

  const { data: cases = [], isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: () => base44.entities.Case.list('-created_date', 50)
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profile-cases'],
    queryFn: async () => {
      const user = await base44.auth.me();
      if (!user?.email) return [];
      return base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1);
    }
  });
  const currentProfile = profiles[0] || null;

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Case.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] })
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Case.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cases'] })
  });

  const filtered = filter === 'all' ? cases : cases.filter((c) => c.status === filter);
  const stats = {
    total: cases.length,
    open: cases.filter((c) => c.status === 'open').length,
    completed: cases.filter((c) => c.status === 'completed').length,
    online: cases.filter((c) => c.can_do_online).length
  };

  if (selectedCase) {
    const cas = cases.find((c) => c.id === selectedCase.id) || selectedCase;
    return (
      <div className="min-h-screen bg-background text-foreground">
        <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
          <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back to Cases</span>
          </button>
          <Link to="/start">
            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> New Case
            </Button>
          </Link>
        </div>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <CaseWorkspace cas={cas} profile={currentProfile} onClose={() => setSelectedCase(null)} />
        </div>
      </div>);

  }

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue AI</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/profile" className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors px-2 py-1.5 rounded-lg hover:bg-white/5">
            <User className="w-3.5 h-3.5" /> Profile
          </Link>
          <Link to="/start">
            <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
              <Plus className="w-4 h-4 mr-1.5" /> New Case
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white"></h1>
            <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Auto-Complete Documents
            </p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Open', value: stats.open, color: 'text-primary' },
          { label: 'Done', value: stats.completed, color: 'text-success' },
          { label: 'Online', value: stats.online, color: 'text-accent' }].
          map((s) =>
          <div key={s.label} className="glass-card rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{s.label}</div>
            </div>
          )}
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {['all', 'open', 'in-progress', 'completed', 'blocked'].map((f) =>
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all ${
            filter === f ?
            'bg-primary text-white border-primary' :
            'bg-white/[0.03] text-slate-400 border-white/8 hover:border-white/20'}`
            }>
            
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          )}
        </div>

        {isLoading ?
        <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div> :
        filtered.length === 0 ?
        <div className="text-center py-12">
            <FileText className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm mb-4">{filter === 'all' ? 'No cases yet' : `No ${filter} cases`}</p>
            <Link to="/start">
              <Button size="sm" className="bg-primary hover:bg-primary/90 rounded-xl">
                <Plus className="w-4 h-4 mr-1.5" /> Start a case
              </Button>
            </Link>
          </div> :

        <div className="space-y-3">
            <p className="text-xs text-slate-600 mb-2">Click any case to open the AI Workspace →</p>
            <AnimatePresence>
              {filtered.map((cas) =>
            <CaseCard
              key={cas.id}
              cas={cas}
              onSelect={setSelectedCase}
              onUpdateStatus={(id, data) => updateMutation.mutate({ id, data })}
              onDelete={(id) => deleteMutation.mutate(id)} />

            )}
            </AnimatePresence>
          </div>
        }
      </div>
    </div>);

}