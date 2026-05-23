/**
 * /profile — Identity Hub
 * Central profile page: links to vault, cases, privacy settings, and logout.
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Zap, Shield, Briefcase, Bell, LogOut, User, ChevronRight, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';

export default function Profile() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: () => base44.auth.me(),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profile-hub'],
    queryFn: () => base44.entities.UserPrivateProfile.filter({ user_id: user?.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || {};

  const completedFields = [
    profile.first_name, profile.last_name, profile.phone,
    profile.city, profile.county,
  ].filter(Boolean).length;
  const completionPct = Math.round((completedFields / 5) * 100);

  if (isLoading) {
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
        <button
          onClick={() => base44.auth.logout()}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-destructive transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Deconectare
        </button>
      </div>

      <div className="max-w-xl mx-auto px-4 py-8 space-y-5">
        {/* User info */}
        <div className="glass-card rounded-2xl p-5 border border-white/8 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{user?.full_name || 'Utilizator'}</p>
            <p className="text-xs text-slate-400">{user?.email}</p>
          </div>
        </div>

        {/* Identity Vault card */}
        <Link to="/vault" className="block">
          <div className="glass-card rounded-2xl p-5 border border-white/8 hover:border-primary/30 transition-all group">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-white">Seiful de Identitate</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-colors" />
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Date personale, act de identitate, semnătură — completate o dată, folosite oriunde.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${completionPct}%` }} />
              </div>
              <span className="text-xs text-slate-400">{completionPct}% completat</span>
            </div>
          </div>
        </Link>

        {/* Navigation links */}
        <div className="space-y-2">
          {[
            { to: '/cases', icon: Briefcase, label: 'Dosarele mele', desc: 'Urmărește procedurile active' },
            { to: '/appointments/watch', icon: Bell, label: 'Alerte programări', desc: 'Monitorizare automată disponibilitate' },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="block">
              <div className="glass-card rounded-2xl px-4 py-3.5 border border-white/8 hover:border-white/20 transition-all flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">{label}</p>
                    <p className="text-[10px] text-slate-500">{desc}</p>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors" />
              </div>
            </Link>
          ))}
        </div>

        {/* Privacy note */}
        <div className="rounded-2xl border border-white/5 p-4">
          <p className="text-[10px] text-slate-600 text-center leading-relaxed">
            Datele tale sunt stocate securizat și nu sunt împărtășite cu terți fără consimțământul tău explicit.{' '}
            <Link to="/vault" className="text-primary hover:underline">Gestionează consimțămintele</Link>
          </p>
        </div>
      </div>
    </div>
  );
}