/**
 * DocumentsTab — Clean document vault list
 * Shows user's uploaded/generated government documents
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Plus, FileText, AlertTriangle, X, ExternalLink } from 'lucide-react';
import { getExpiryInfo } from '@/components/vault/ExpirationBadge';
import UploadModal from '@/components/vault/UploadModal';

const TYPE_ICONS = {
  id_card: '🪪',
  passport: '🛂',
  driver_license: '🚗',
  birth_certificate: '📋',
  marriage_certificate: '💒',
  divorce_document: '⚖️',
  tax_form: '💰',
  health_insurance: '🏥',
  residency_permit: '🏠',
  vehicle_registration: '🚙',
  criminal_record: '⚖️',
  property_paper: '🏡',
  fine: '🚦',
  other: '📁',
};

const TYPE_LABELS = {
  id_card: 'Carte de Identitate',
  passport: 'Pașaport',
  driver_license: 'Permis Auto',
  birth_certificate: 'Certificat de Naștere',
  marriage_certificate: 'Certificat de Căsătorie',
  divorce_document: 'Act Divorț',
  tax_form: 'Declarație Fiscală',
  health_insurance: 'Asigurare Sănătate',
  residency_permit: 'Permis Rezidență',
  vehicle_registration: 'Talon Auto',
  criminal_record: 'Cazier Judiciar',
  property_paper: 'Act Proprietate',
  fine: 'Amendă',
  other: 'Alt Document',
};

function StatusBadge({ expiryInfo }) {
  if (!expiryInfo) return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
      Valid
    </span>
  );
  const { status, label } = expiryInfo;
  if (status === 'expired') return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
      Expirat
    </span>
  );
  if (status === 'expiring_soon' || status === 'soon') return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: 'rgba(250,204,21,0.12)', color: '#facc15' }}>
      <AlertTriangle className="w-2.5 h-2.5" /> Expiră curând
    </span>
  );
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e' }}>
      Valid
    </span>
  );
}

function DocCard({ doc, onDelete }) {
  const expiryInfo = getExpiryInfo(doc.expiry_date);
  const icon = TYPE_ICONS[doc.document_type] || '📁';
  const label = TYPE_LABELS[doc.document_type] || doc.document_title || 'Document';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="flex items-center gap-3 p-4 rounded-2xl active:scale-[0.98] transition-transform"
      style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
    >
      {/* Icon */}
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
        style={{ background: 'rgba(59,130,246,0.08)' }}
      >
        {icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{doc.document_title || label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{label}</p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <StatusBadge expiryInfo={expiryInfo} />
          {doc.expiry_date && (
            <span className="text-[10px] text-slate-600">
              Exp: {new Date(doc.expiry_date).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-end gap-2 shrink-0">
        {doc.file_url && (
          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <button
          onClick={() => onDelete(doc.id)}
          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444' }}
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

export default function DocumentsTab() {
  const [user, setUser] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['gov-documents', user?.email],
    queryFn: () => base44.entities.GovDocument.filter({ user_id: user.email }, '-created_date'),
    enabled: !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.GovDocument.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gov-documents'] }),
  });

  const enriched = docs.map(doc => ({ ...doc, _expiryInfo: getExpiryInfo(doc.expiry_date) }));
  const expiringSoon = enriched.filter(d => d._expiryInfo?.status === 'expiring_soon' || d._expiryInfo?.status === 'soon').length;

  return (
    <div className="flex flex-col h-full" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <div
        className="shrink-0 px-4 pt-4 pb-3"
        style={{ background: '#13131A', borderBottom: '1px solid #1E1E2E' }}
      >
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-lg font-bold text-white">Documente</h1>
          <button
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            style={{ background: '#3B82F6' }}
          >
            <Plus className="w-3.5 h-3.5" /> Adaugă
          </button>
        </div>
        <p className="text-xs text-slate-500">
          {docs.length} {docs.length === 1 ? 'document stocat' : 'documente stocate'}
          {expiringSoon > 0 && (
            <span style={{ color: '#facc15' }}> · {expiringSoon} expiră curând</span>
          )}
        </p>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#3B82F6', borderTopColor: 'transparent' }} />
          </div>
        ) : enriched.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-4 text-center pt-16"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
            >
              🗂️
            </div>
            <div>
              <p className="text-base font-semibold text-white mb-1">Vault gol</p>
              <p className="text-sm text-slate-500 max-w-xs">
                Adaugă primul tău document guvernamental. AI-ul va extrage toate câmpurile automat.
              </p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all"
              style={{ background: '#3B82F6' }}
            >
              Adaugă primul document
            </button>
          </motion.div>
        ) : (
          <AnimatePresence>
            {enriched.map(doc => (
              <DocCard
                key={doc.id}
                doc={doc}
                onDelete={(id) => deleteMutation.mutate(id)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Upload modal */}
      <AnimatePresence>
        {showUpload && (
          <UploadModal
            user={user}
            onClose={() => setShowUpload(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['gov-documents'] });
              setShowUpload(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}