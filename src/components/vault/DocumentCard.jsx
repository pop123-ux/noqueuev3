import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Eye, Trash2, Download, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import ExpirationBadge from './ExpirationBadge';

export const DOC_TYPES = {
  id_card:              { label: 'ID Card',              emoji: '🪪', color: '#2563eb' },
  passport:             { label: 'Passport',             emoji: '🛂', color: '#8b5cf6' },
  driver_license:       { label: "Driver's License",    emoji: '🚗', color: '#f97316' },
  birth_certificate:    { label: 'Birth Certificate',    emoji: '📋', color: '#22c55e' },
  marriage_certificate: { label: 'Marriage Certificate', emoji: '💒', color: '#ec4899' },
  divorce_document:     { label: 'Divorce Document',     emoji: '📄', color: '#64748b' },
  tax_form:             { label: 'Tax Form',             emoji: '💰', color: '#facc15' },
  health_insurance:     { label: 'Health Insurance',     emoji: '🏥', color: '#06b6d4' },
  residency_permit:     { label: 'Residency Permit',     emoji: '🏠', color: '#84cc16' },
  vehicle_registration: { label: 'Vehicle Registration', emoji: '🚙', color: '#f97316' },
  criminal_record:      { label: 'Criminal Record',      emoji: '⚖️', color: '#a855f7' },
  property_paper:       { label: 'Property Paper',       emoji: '🏘️', color: '#14b8a6' },
  fine:                 { label: 'Fine',                 emoji: '🚨', color: '#ef4444' },
  other:                { label: 'Other',                emoji: '📁', color: '#64748b' },
};

export default function DocumentCard({ doc, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const meta = DOC_TYPES[doc.document_type] || DOC_TYPES.other;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style={{ background: `${meta.color}18`, border: `1px solid ${meta.color}30` }}
            >
              {meta.emoji}
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-medium uppercase tracking-wider mb-0.5" style={{ color: meta.color }}>
                {meta.label}
              </div>
              <h3 className="text-sm font-semibold text-white leading-snug truncate">
                {doc.document_title || meta.label}
              </h3>
            </div>
          </div>
          <div className="shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {doc.expiry_date && <ExpirationBadge expiryDate={doc.expiry_date} compact />}
          {doc.institution && (
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
              <Building2 className="w-3 h-3" />
              {doc.institution}
            </span>
          )}
          {doc.ocr_document_number && (
            <span className="text-[10px] text-slate-500 font-mono">#{doc.ocr_document_number}</span>
          )}
        </div>

        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-white/5 space-y-3"
          >
            {doc.ocr_full_name && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 w-20 shrink-0">Name</span>
                <span className="text-slate-300">{doc.ocr_full_name}</span>
              </div>
            )}
            {doc.issue_date && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 w-20 shrink-0">Issued</span>
                <span className="text-slate-300">{doc.issue_date}</span>
              </div>
            )}
            {doc.expiry_date && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-600 w-20 shrink-0">Expires</span>
                <ExpirationBadge expiryDate={doc.expiry_date} />
              </div>
            )}
            {doc.ocr_address && (
              <div className="flex items-start gap-2 text-xs">
                <span className="text-slate-600 w-20 shrink-0">Address</span>
                <span className="text-slate-400">{doc.ocr_address}</span>
              </div>
            )}
            {doc.notes && (
              <p className="text-xs text-slate-500 italic">{doc.notes}</p>
            )}

            <div className="flex gap-2 pt-1" onClick={e => e.stopPropagation()}>
              {doc.file_url && (
                <>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </a>
                  <a
                    href={doc.file_url}
                    download
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </>
              )}
              <button
                onClick={() => onDelete(doc.id)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}