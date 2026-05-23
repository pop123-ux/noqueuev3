import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/noqueue/Navbar';
import VaultHeader from '@/components/vault/VaultHeader';
import DocumentCard, { DOC_TYPES } from '@/components/vault/DocumentCard';
import UploadModal from '@/components/vault/UploadModal';
import { getExpiryInfo } from '@/components/vault/ExpirationBadge';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'expiring', label: '⚠️ Expiring' },
  { key: 'expired', label: '🔴 Expired' },
  { key: 'id_card', label: '🪪 ID' },
  { key: 'passport', label: '🛂 Passport' },
  { key: 'driver_license', label: '🚗 License' },
  { key: 'health_insurance', label: '🏥 Health' },
  { key: 'tax_form', label: '💰 Tax' },
  { key: 'vehicle_registration', label: '🚙 Vehicle' },
  { key: 'other', label: '📁 Other' },
];

export default function DigitalVault() {
  const [user, setUser] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
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

  const enriched = docs.map(doc => {
    const info = getExpiryInfo(doc.expiry_date);
    return { ...doc, _expiryInfo: info };
  });

  const stats = {
    total: docs.length,
    expiring: enriched.filter(d => d._expiryInfo?.status === 'expiring_soon' || d._expiryInfo?.status === 'soon').length,
    expired: enriched.filter(d => d._expiryInfo?.status === 'expired').length,
  };

  const filtered = enriched.filter(doc => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      doc.document_title?.toLowerCase().includes(q) ||
      doc.document_type?.toLowerCase().includes(q) ||
      doc.institution?.toLowerCase().includes(q) ||
      doc.ocr_full_name?.toLowerCase().includes(q) ||
      doc.tags?.some(t => t.toLowerCase().includes(q));
    const matchFilter =
      filter === 'all' ||
      (filter === 'expiring' && (doc._expiryInfo?.status === 'expiring_soon' || doc._expiryInfo?.status === 'soon')) ||
      (filter === 'expired' && doc._expiryInfo?.status === 'expired') ||
      doc.document_type === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <VaultHeader stats={stats} onUpload={() => setShowUpload(true)} />

          {/* Search */}
          <div className="relative mb-5">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search documents, institutions, names…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-11"
            />
          </div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-8">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                  filter === f.key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="text-5xl mb-4">🗂️</div>
              <p className="text-lg font-semibold text-white mb-2">
                {docs.length === 0 ? 'Your vault is empty' : 'No documents match'}
              </p>
              <p className="text-slate-500 text-sm mb-6 max-w-xs">
                {docs.length === 0
                  ? 'Upload your first government document to get started. AI will extract the key fields automatically.'
                  : 'Try a different search or filter.'}
              </p>
              {docs.length === 0 && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-5 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-all"
                >
                  Upload First Document
                </button>
              )}
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filtered.map(doc => (
                  <DocumentCard
                    key={doc.id}
                    doc={doc}
                    onDelete={(id) => deleteMutation.mutate(id)}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

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