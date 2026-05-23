/**
 * DocumentRow — premium single document row
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { differenceInDays, parseISO, format } from 'date-fns';
import { CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

function ExpirationBadge({ status, expiryDate }) {
  const days = expiryDate ? differenceInDays(parseISO(expiryDate), new Date()) : null;

  const config = {
    expired:      { label: 'Expirat',         color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.25)',  Icon: XCircle },
    expiring_soon:{ label: days !== null ? `Expiră în ${days}z` : 'Expiră curând', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)', Icon: AlertTriangle },
    active:       { label: 'Valid',            color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  border: 'rgba(34,197,94,0.2)',   Icon: CheckCircle2 },
    pending_review:{ label: 'În verificare',  color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)',  Icon: RefreshCw },
  }[status] || { label: status, color: '#94a3b8', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', Icon: CheckCircle2 };

  const { label, color, bg, border, Icon } = config;

  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ color, background: bg, border: `1px solid ${border}` }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function DocumentRow({ doc }) {
  const formattedExpiry = doc.expiry_date
    ? format(parseISO(doc.expiry_date), 'd MMM yyyy')
    : null;

  const actionStyle = doc.status === 'expired'
    ? { background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }
    : doc.status === 'expiring_soon'
    ? { background: 'rgba(37,99,235,0.15)', color: '#93c5fd', border: '1px solid rgba(37,99,235,0.3)' }
    : { background: 'rgba(255,255,255,0.04)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)' };

  return (
    <div className="flex items-center gap-4 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
      {/* Icon */}
      <span className="text-xl shrink-0 w-8 text-center">{doc.icon || '📄'}</span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate leading-snug">{doc.document_title}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <ExpirationBadge status={doc.status} expiryDate={doc.expiry_date} />
          {formattedExpiry && (
            <span className="text-[10px] text-slate-600">{formattedExpiry}</span>
          )}
        </div>
      </div>

      {/* Action */}
      {doc.renewUrl && (
        <Link
          to={doc.renewUrl}
          className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-all hover:brightness-110 whitespace-nowrap"
          style={actionStyle}
        >
          {doc.renewLabel || 'Detalii'}
        </Link>
      )}
    </div>
  );
}