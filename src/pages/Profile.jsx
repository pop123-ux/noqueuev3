/**
 * /profile — Cont (Identity Hub)
 * Tabbed civic identity hub: Overview · Auto-completare · Seif · Securitate.
 * Business logic for profile data (useQuery + EditableProfileForm) is unchanged;
 * only the surrounding presentation and navigation were upgraded.
 */
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Zap, LogOut, Loader2, Shield, ArrowRight,
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import EditableProfileForm from '@/components/profile/EditableProfileForm';
import ProfileOverviewTab from '@/components/profile/ProfileOverviewTab';
import ProfileSeifTab from '@/components/profile/ProfileSeifTab';
import ProfileSecurityTab from '@/components/profile/ProfileSecurityTab';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'autofill', label: 'Auto-completare' },
  { id: 'seif', label: 'Seif' },
  { id: 'security', label: 'Securitate' },
];

export default function Profile() {
  const [tab, setTab] = useState('overview');

  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profile-hub'],
    queryFn: () => base44.entities.UserPrivateProfile.filter({ user_id: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['profile-cases-summary'],
    queryFn: () => base44.entities.Case.filter({ user_id: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['profile-docs-summary'],
    queryFn: () => base44.entities.GeneratedDocument.filter({ user_id: user?.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || {};

  const completedFields = [
    profile.first_name, profile.last_name, profile.phone,
    profile.city, profile.county,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 5) * 100);

  const activeCases = cases.filter(c => c.status === 'open' || c.status === 'in-progress').length;
  const stats = {
    docs: docs.length,
    cases: activeCases,
    savedHours: docs.length > 0 ? `~${docs.length * 1}h` : '~0h',
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Top bar */}
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline-block text-[9px] text-primary/40 uppercase tracking-widest">
            Demo MVP · ClujHackathon 2026
          </span>
          <button
            onClick={() => base44.auth.logout()}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-destructive transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Deconectare
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="rounded-2xl p-1 border border-white/6 bg-white/[0.02] flex gap-1 mb-6">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 px-3 text-xs font-semibold transition-all duration-200 rounded-xl ${
                tab === t.id
                  ? 'bg-primary text-white shadow-lg shadow-primary/20'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === 'overview' && (
          <ProfileOverviewTab user={user} completionPct={completionPct} stats={stats} />
        )}
        {tab === 'autofill' && (
          <EditableProfileForm profile={profile} userEmail={user?.email} />
        )}
        {tab === 'seif' && (
          <ProfileSeifTab profile={profile} completionPct={completionPct} />
        )}
        {tab === 'security' && <ProfileSecurityTab />}

        {/* Scan CTA banner — visible when profile is incomplete */}
        {completionPct < 60 && (
          <div className="mt-6 rounded-2xl p-4 border border-primary/20 bg-gradient-to-br from-primary/10 to-accent/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-white">Scanează buletinul</p>
              <p className="text-[11px] text-slate-400">Auto-completează profilul în 30 de secunde</p>
            </div>
            <Link to="/identity-onboarding">
              <Button size="sm" className="rounded-xl bg-primary hover:bg-primary/85 text-white font-semibold shadow-lg shadow-primary/20">
                Scanează <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}