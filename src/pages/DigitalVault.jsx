/**
 * DigitalVault — Redesigned AI-powered Civic Operating System
 * Apple Wallet + Revolut + Government Portal + AI Assistant
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Zap, Clock, Grid3X3, List, ArrowLeft, Cloud, CheckCircle2, Loader2 } from 'lucide-react';

import Navbar from '@/components/noqueue/Navbar';
import VaultDashboardStats from '@/components/vault/VaultDashboardStats';
import { syncAllPendingToDrive } from '@/lib/google/vaultDriveSync';
import VaultSearch from '@/components/vault/VaultSearch';
import VaultAIAssistant from '@/components/vault/VaultAIAssistant';
import RenewalAlert from '@/components/vault/RenewalAlert';
import NotificationCenter from '@/components/vault/NotificationCenter';
import WorkflowLauncher from '@/components/vault/WorkflowLauncher';
import VaultDocumentCard from '@/components/vault/VaultDocumentCard';
import CivicTimeline from '@/components/vault/CivicTimeline';
import UploadModal from '@/components/vault/UploadModal';
import { getExpiryInfo } from '@/components/vault/ExpirationBadge';
import { DOC_TYPES } from '@/components/vault/DocumentCard';

const FILTERS = [
  { key: 'all',        label: 'All Docs' },
  { key: 'expiring',   label: '⚠️ Expiring' },
  { key: 'expired',    label: '🔴 Expired' },
  { key: 'id_card',    label: '🪪 ID' },
  { key: 'passport',   label: '🛂 Passport' },
  { key: 'driver_license', label: '🚗 License' },
  { key: 'health_insurance', label: '🏥 Health' },
  { key: 'tax_form',   label: '💰 Tax' },
  { key: 'vehicle_registration', label: '🚙 Vehicle' },
  { key: 'criminal_record', label: '⚖️ Cazier' },
  { key: 'other',      label: '📁 Other' },
];

const TABS = [
  { key: 'vault',    label: 'My Documents',    icon: Grid3X3 },
  { key: 'timeline', label: 'Civic Timeline',  icon: Clock },
];

export default function DigitalVault() {
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const [tab, setTab] = useState('vault');
  const [showUpload, setShowUpload] = useState(false);
  const [highlightDoc, setHighlightDoc] = useState(null);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncedCount, setSyncedCount] = useState(null);
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

  const enriched = docs.map(doc => ({
    ...doc,
    _expiryInfo: getExpiryInfo(doc.expiry_date),
  }));

  const stats = {
    total: docs.length,
    valid: enriched.filter(d => !d._expiryInfo || d._expiryInfo.status === 'valid').length,
    expiring: enriched.filter(d => d._expiryInfo?.status === 'expiring_soon' || d._expiryInfo?.status === 'soon').length,
    expired: enriched.filter(d => d._expiryInfo?.status === 'expired').length,
  };

  const filtered = enriched.filter(doc => {
    if (highlightDoc) return doc.id === highlightDoc;
    const matchFilter =
      filter === 'all' ||
      (filter === 'expiring' && (doc._expiryInfo?.status === 'expiring_soon' || doc._expiryInfo?.status === 'soon')) ||
      (filter === 'expired' && doc._expiryInfo?.status === 'expired') ||
      doc.document_type === filter;
    return matchFilter;
  });

  function handleSearchSelect(doc) {
    setHighlightDoc(doc.id);
    setTab('vault');
    setTimeout(() => {
      document.getElementById(`doc-${doc.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  async function handleSyncAll() {
    setSyncingAll(true);
    setSyncedCount(null);
    const n = await syncAllPendingToDrive(docs);
    setSyncedCount(n);
    queryClient.invalidateQueries({ queryKey: ['gov-documents'] });
    setSyncingAll(false);
    setTimeout(() => setSyncedCount(null), 4000);
  }

  const pendingSyncCount = docs.filter(
    d => d.file_url && d.drive_upload_status !== 'uploaded' && !d.google_drive_file_id
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">

          {/* Stats header */}
          <VaultDashboardStats stats={stats} onUpload={() => setShowUpload(true)} />

          {/* Google Drive sync banner */}
          {docs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 px-4 py-3 mb-5 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, rgba(66,133,244,0.10), rgba(52,168,83,0.06))', border: '1px solid rgba(66,133,244,0.20)' }}
            >
              <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <Cloud className="w-4 h-4 text-[#4285F4]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white">Google Drive backup</p>
                <p className="text-[11px] text-slate-400">
                  {syncedCount !== null
                    ? `${syncedCount} document${syncedCount === 1 ? '' : 's'} synced to your Drive.`
                    : pendingSyncCount === 0
                      ? 'All documents are backed up to your Drive.'
                      : `${pendingSyncCount} document${pendingSyncCount === 1 ? '' : 's'} not yet on your Drive.`}
                </p>
              </div>
              {pendingSyncCount > 0 ? (
                <button
                  onClick={handleSyncAll}
                  disabled={syncingAll}
                  className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-xl bg-[#4285F4]/15 hover:bg-[#4285F4]/25 text-[#4285F4] border border-[#4285F4]/30 disabled:opacity-50 transition-all"
                >
                  {syncingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Cloud className="w-3 h-3" />}
                  {syncingAll ? 'Syncing…' : 'Sync all to Drive'}
                </button>
              ) : (
                <span className="shrink-0 inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" /> All synced
                </span>
              )}
            </motion.div>
          )}

          {/* Notifications */}
          <NotificationCenter docs={docs} />

          {/* Renewal Alerts */}
          <RenewalAlert docs={docs} />

          {/* AI Assistant */}
          <VaultAIAssistant docs={docs} />

          {/* Quick Workflows */}
          <WorkflowLauncher />

          {/* Tab Navigation */}
          <div className="flex gap-1 p-1 glass-card rounded-2xl mb-5">
            {TABS.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.key}
                  onClick={() => { setTab(t.key); setHighlightDoc(null); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all ${
                    tab === t.key
                      ? 'bg-primary text-white shadow'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {tab === 'vault' && (
            <>
              {/* Search */}
              <VaultSearch docs={docs} onSelect={handleSearchSelect} />

              {/* Clear highlight */}
              {highlightDoc && (
                <div className="flex items-center gap-2 mb-3">
                  <button
                    onClick={() => setHighlightDoc(null)}
                    className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Show all documents
                  </button>
                </div>
              )}

              {/* Filter chips (hidden when searching) */}
              {!highlightDoc && (
                <div className="flex flex-wrap gap-2 mb-5">
                  {FILTERS.map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFilter(f.key)}
                      className={`px-3 py-1.5 text-[10px] font-medium rounded-full border transition-all ${
                        filter === f.key
                          ? 'bg-primary text-white border-primary'
                          : 'bg-white/5 text-slate-500 border-white/8 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Document Grid */}
              {isLoading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div className="text-5xl mb-4">🗂️</div>
                  <p className="text-base font-semibold text-white mb-2">
                    {docs.length === 0 ? 'Your vault is empty' : 'No documents match'}
                  </p>
                  <p className="text-slate-500 text-sm mb-6 max-w-xs">
                    {docs.length === 0
                      ? 'Upload your first government document. AI will extract all fields and unlock smart actions.'
                      : 'Try a different filter.'}
                  </p>
                  {docs.length === 0 && (
                    <button
                      onClick={() => setShowUpload(true)}
                      className="px-5 py-2.5 bg-primary text-white text-sm font-bold rounded-2xl hover:bg-primary/90 transition-all"
                    >
                      Upload First Document
                    </button>
                  )}
                </motion.div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {filtered.map(doc => (
                      <div key={doc.id} id={`doc-${doc.id}`}>
                        <VaultDocumentCard
                          doc={doc}
                          onDelete={(id) => deleteMutation.mutate(id)}
                        />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}

          {tab === 'timeline' && (
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <Clock className="w-4 h-4 text-accent" />
                <h2 className="text-sm font-bold text-white">Civic Timeline</h2>
                <span className="text-[10px] text-slate-500">Your government document history</span>
              </div>
              <CivicTimeline docs={docs} />
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
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