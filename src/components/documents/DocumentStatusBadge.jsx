import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, Building2, Eye, RefreshCw } from 'lucide-react';

const STATUS_CONFIG = {
  ready: {
    label: 'Ready to print',
    color: 'text-success',
    bg: 'bg-success/10',
    border: 'border-success/20',
    icon: CheckCircle2,
  },
  needs_review: {
    label: 'Needs review',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: Eye,
  },
  missing_profile_data: {
    label: 'Profile incomplete',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: AlertTriangle,
  },
  office_only: {
    label: 'Prep sheet only',
    color: 'text-slate-400',
    bg: 'bg-white/5',
    border: 'border-white/10',
    icon: Building2,
  },
  error: {
    label: 'Error',
    color: 'text-destructive',
    bg: 'bg-destructive/10',
    border: 'border-destructive/20',
    icon: AlertTriangle,
  },
  stale: {
    label: 'Stale — regenerate',
    color: 'text-warning',
    bg: 'bg-warning/10',
    border: 'border-warning/20',
    icon: RefreshCw,
  },
};

export default function DocumentStatusBadge({ status, stale = false }) {
  const key = stale ? 'stale' : (status || 'needs_review');
  const cfg = STATUS_CONFIG[key] || STATUS_CONFIG.needs_review;
  const Icon = cfg.icon;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}