/**
 * /profile — Private Profile Vault
 * User's secure identity data for auto-filling civic documents.
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Zap, User, Upload, Cloud, Shield, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import ProfileIdentityForm from '@/components/profile/ProfileIdentityForm';
import ProfileUploadsForm from '@/components/profile/ProfileUploadsForm';
import DriveConnectButton from '@/components/profile/DriveConnectButton';
import ProfileCompletenessCard from '@/components/profile/ProfileCompletenessCard';

const TABS = [
  { id: 'identity', label: 'Identity', icon: User },
  { id: 'uploads', label: 'Documents & Assets', icon: Upload },
  { id: 'drive', label: 'Google Drive', icon: Cloud },
];

export default function Profile() {
  const [tab, setTab] = useState('identity');
  const [saveMsg, setSaveMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: () => base44.entities.UserPrivateProfile.filter({ user_id: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || null;

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        user_id: user.email,
        full_name: `${data.last_name || ''} ${data.first_name || ''}`.trim(),
        profile_version: (profile?.profile_version || 0) + 1,
        is_profile_complete: !!(data.first_name && data.last_name && data.cnp && data.birth_date),
        last_verified_at: new Date().toISOString(),
      };
      if (profile?.id) {
        return base44.entities.UserPrivateProfile.update(profile.id, payload);
      }
      return base44.entities.UserPrivateProfile.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSaveMsg('Saved ✓');
      setTimeout(() => setSaveMsg(''), 2500);
    },
  });

  const handleUpload = async (fieldKey, fileUrl) => {
    if (!user?.email) return;
    if (profile?.id) {
      await base44.entities.UserPrivateProfile.update(profile.id, {
        [fieldKey]: fileUrl,
        profile_version: (profile?.profile_version || 1) + 1,
      });
    } else {
      await base44.entities.UserPrivateProfile.create({
        user_id: user.email,
        [fieldKey]: fileUrl,
        profile_version: 1,
      });
    }
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    setSaveMsg('Asset saved ✓');
    setTimeout(() => setSaveMsg(''), 2500);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

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
        <nav className="flex items-center gap-3 text-xs text-slate-400">
          <Link to="/cases" className="hover:text-white transition-colors">Cases</Link>
          <Link to="/start" className="hover:text-white transition-colors">New Case</Link>
        </nav>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Page title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-white">Private Profile Vault</h1>
          </div>
          <p className="text-sm text-slate-400">
            Your data is stored privately and used only to auto-fill your civic documents. Never shared publicly.
          </p>
          {user?.email && (
            <p className="text-xs text-slate-600 mt-1">{user.email}</p>
          )}
        </motion.div>

        {/* Completeness card */}
        <div className="mb-6">
          <ProfileCompletenessCard profile={profile} />
        </div>

        {/* Save confirmation */}
        <AnimatePresence>
          {saveMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-success/10 border border-success/25 text-success text-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              {saveMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/8 rounded-2xl p-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  tab === t.id
                    ? 'bg-primary text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          {tab === 'identity' && (
            <motion.div key="identity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8">
                <ProfileIdentityForm
                  profile={profile}
                  onSave={(data) => saveMutation.mutate(data)}
                  saving={saveMutation.isPending}
                />
              </div>
            </motion.div>
          )}

          {tab === 'uploads' && (
            <motion.div key="uploads" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8">
                <h2 className="text-sm font-semibold text-white mb-4">Document Assets</h2>
                <ProfileUploadsForm profile={profile} onUpload={handleUpload} />
              </div>
            </motion.div>
          )}

          {tab === 'drive' && (
            <motion.div key="drive" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="glass-card rounded-2xl p-5 border border-white/8 space-y-4">
                <div>
                  <h2 className="text-sm font-semibold text-white mb-1">Google Drive Integration</h2>
                  <p className="text-xs text-slate-400">
                    Connect your Drive to automatically save generated PDFs to a <em>NoQueue Documents</em> folder.
                    Access tokens are kept in memory only — never stored in the browser.
                  </p>
                </div>
                <DriveConnectButton
                  userId={user?.email}
                  onConnectionChange={() => {}}
                />
                <div className="rounded-xl bg-white/[0.02] border border-white/6 p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-400">Drive permissions used</p>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-success mt-0.5 shrink-0" />
                    <p className="text-[11px] text-slate-400">
                      <strong className="text-white">drive.file</strong> — Only files created by this app. Cannot read your existing Drive files.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}