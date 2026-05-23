/**
 * DocumentsTab — Unified civic document wallet
 * Merges Safe + Vault into one premium list
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Plus, ChevronRight, Shield } from 'lucide-react';
import DocumentRow from '@/components/documents/DocumentRow';
import { differenceInDays, parseISO } from 'date-fns';

// ── Anchor documents (shown even if vault is empty) ──────────────────
const ANCHOR_DOCS = [
  {
    id: 'anchor-ci',
    icon: '🪪',
    document_title: 'Carte de Identitate',
    document_type: 'id_card',
    expiry_date: '2026-10-14',
    status: 'expiring_soon',
    canRenewOnline: true,
    renewUrl: '/start',
    renewLabel: 'Reînnoire Online',
    institution: 'SPCLEP Cluj-Napoca',
  },
  {
    id: 'anchor-passport',
    icon: '🛂',
    document_title: 'Pașaport Simplu Electronic',
    document_type: 'passport',
    expiry_date: '2026-01-02',
    status: 'expired',
    canRenewOnline: false,
    renewUrl: '/demo/passport',
    renewLabel: 'Începe Fluxul',
    institution: 'Serviciul Pașapoarte Cluj',
  },
  {
    id: 'anchor-drive',
    icon: '🚗',
    document_title: 'Permis de Conducere',
    document_type: 'driver_license',
    expiry_date: '2026-09-09',
    status: 'expiring_soon',
    canRenewOnline: true,
    renewUrl: '/start',
    renewLabel: 'Actualizează Online',
    institution: 'DRPCIV',
  },
  {
    id: 'anchor-health',
    icon: '🏥',
    document_title: 'Card European de Sănătate',
    document_type: 'health_insurance',
    expiry_date: '2028-08-22',
    status: 'active',
    canRenewOnline: true,
    renewUrl: '/start',
    renewLabel: 'Detalii',
    institution: 'CNAS',
  },
];

function computeStatus(doc) {
  if (!doc.expiry_date) return doc.status || 'active';
  const days = differenceInDays(parseISO(doc.expiry_date), new Date());
  if (days < 0) return 'expired';
  if (days <= 90) return 'expiring_soon';
  return 'active';
}

export default function DocumentsTab() {
  const [filter, setFilter] = useState('all');

  const { data: vaultDocs = [] } = useQuery({
    queryKey: ['govDocuments'],
    queryFn: () => base44.entities.GovDocument.list('-created_date', 50),
    initialData: [],
  });

  // Merge vault docs with anchors (vault docs take priority if same type exists)
  const vaultTypes = new Set(vaultDocs.map(d => d.document_type));
  const filteredAnchors = ANCHOR_DOCS.filter(a => !vaultTypes.has(a.document_type));

  const allDocs = [
    ...vaultDocs.map(d => ({
      ...d,
      icon: DOC_ICONS[d.document_type] || '📄',
      status: computeStatus(d),
      canRenewOnline: ['id_card','driver_license','health_insurance'].includes(d.document_type),
      renewUrl: d.document_type === 'passport' ? '/demo/passport' : '/start',
      renewLabel: computeStatus(d) === 'expired' ? 'Începe Fluxul' : 'Reînnoire Online',
    })),
    ...filteredAnchors,
  ];

  const filters = [
    { id: 'all',     label: 'Toate' },
    { id: 'expired', label: 'Expirate' },
    { id: 'expiring_soon', label: 'Expiră curând' },
    { id: 'active',  label: 'Valide' },
  ];

  const displayed = filter === 'all' ? allDocs : allDocs.filter(d => d.status === filter);

  const expiredCount    = allDocs.filter(d => d.status === 'expired').length;
  const expiringSoon    = allDocs.filter(d => d.status === 'expiring_soon').length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-1">Portofel civic</p>
          <h1 className="text-xl font-bold text-white">Documentele tale</h1>
        </div>
        <Link
          to="/digital-vault"
          className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" /> Adaugă
        </Link>
      </div>

      {/* Status summary */}
      {(expiredCount > 0 || expiringSoon > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex gap-2"
        >
          {expiredCount > 0 && (
            <div
              className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
            >
              <span className="text-base">🔴</span>
              <div>
                <p className="text-xs font-bold text-red-400">{expiredCount} Expirat{expiredCount > 1 ? 'e' : ''}</p>
                <p className="text-[10px] text-red-500/70">Acțiune necesară</p>
              </div>
            </div>
          )}
          {expiringSoon > 0 && (
            <div
              className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
              style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
            >
              <span className="text-base">🟡</span>
              <div>
                <p className="text-xs font-bold text-amber-400">{expiringSoon} Expiră curând</p>
                <p className="text-[10px] text-amber-500/70">Reînnoire recomandată</p>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className="px-3 py-1 rounded-full text-xs font-semibold transition-all"
            style={filter === f.id
              ? { background: 'rgba(37,99,235,0.25)', color: '#93c5fd', border: '1px solid rgba(37,99,235,0.4)' }
              : { background: 'rgba(255,255,255,0.03)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
            }
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Document list */}
      <div
        className="rounded-2xl overflow-hidden divide-y"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <AnimatePresence>
          {displayed.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: i * 0.04 }}
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <DocumentRow doc={doc} />
            </motion.div>
          ))}
        </AnimatePresence>

        {displayed.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-slate-600 text-sm">Niciun document în această categorie</p>
          </div>
        )}
      </div>

      {/* Identity Vault link */}
      <Link
        to="/vault"
        className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl group transition-all"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-3">
          <Shield className="w-4 h-4 text-primary" />
          <div>
            <p className="text-sm font-semibold text-white">Identity Vault</p>
            <p className="text-[11px] text-slate-600">Date personale · Semnătură · Biometrie · Seif securizat</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors" />
      </Link>
    </div>
  );
}

const DOC_ICONS = {
  id_card: '🪪',
  passport: '🛂',
  driver_license: '🚗',
  birth_certificate: '📜',
  marriage_certificate: '💍',
  divorce_document: '📋',
  tax_form: '🧾',
  health_insurance: '🏥',
  residency_permit: '🏠',
  vehicle_registration: '🚘',
  criminal_record: '📋',
  property_paper: '🏛️',
  fine: '⚠️',
  other: '📄',
};