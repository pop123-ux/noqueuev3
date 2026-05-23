import React from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function getExpiryInfo(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  const exp = new Date(expiryDate);
  const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (days < 0) return { status: 'expired', days, label: 'Expired', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)' };
  if (days <= 30) return { status: 'expiring_soon', days, label: `${days}d left`, color: '#facc15', bg: 'rgba(250,204,21,0.1)', border: 'rgba(250,204,21,0.2)' };
  if (days <= 90) return { status: 'soon', days, label: `${days}d left`, color: '#fb923c', bg: 'rgba(251,146,60,0.1)', border: 'rgba(251,146,60,0.2)' };
  return { status: 'valid', days, label: `${Math.floor(days / 30)}mo left`, color: '#22c55e', bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.2)' };
}

export default function ExpirationBadge({ expiryDate, compact = false }) {
  const info = getExpiryInfo(expiryDate);
  if (!info) return null;

  const Icon = info.status === 'expired' ? AlertTriangle : info.status === 'expiring_soon' ? Clock : CheckCircle;

  return (
    <span
      className={`inline-flex items-center gap-1 ${compact ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-1'} rounded-full font-semibold`}
      style={{ color: info.color, background: info.bg, border: `1px solid ${info.border}` }}
    >
      <Icon className={compact ? 'w-2.5 h-2.5' : 'w-3 h-3'} />
      {info.label}
    </span>
  );
}