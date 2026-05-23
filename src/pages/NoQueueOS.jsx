/**
 * NoQueueOS — futuristic civic operating-system dashboard.
 *
 * Hero metric: estimated bureaucracy time saved.
 * Sections: passport card • active life events • metrics • civic timeline • next actions.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Clock, FileCheck2, RotateCcw, Briefcase, Sparkles, ShieldCheck,
  ArrowRight, Calendar, AlertTriangle, Hash, Activity, Zap,
} from 'lucide-react';
import Navbar from '@/components/noqueue/Navbar';
import BureaucraticPassportCard from '@/components/civic/BureaucraticPassportCard';
import OsMetricTile from '@/components/civic/OsMetricTile';
import ImmutableTimeline from '@/components/civic/ImmutableTimeline';
import AnimatedCounter from '@/components/civic/AnimatedCounter';

function computeTrustScore({ profile, docs, lifeEvents }) {
  let score = 0;
  if (profile?.onboarding_completed) score += 35;
  if (profile?.identity_ocr_verified) score += 15;
  if (profile?.signature_collected) score += 10;
  score += Math.min(20, (docs?.length || 0) * 3);
  score += Math.min(20, (lifeEvents?.length || 0) * 5);
  return Math.min(100, score);
}

function computeCompletionPct(profile) {
  if (!profile) return 0;
  const fields = ['first_name', 'last_name', 'cnp', 'address_line_1', 'id_series', 'id_number', 'id_expiry_date'];
  const filled = fields.filter(f => profile[f]).length;
  return Math.round((filled / fields.length) * 100);
}

export default function NoQueueOS() {
  const [user, setUser] = useState(null);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const { data: profile } = useQuery({
    queryKey: ['profile', user?.email],
    queryFn: async () => {
      const r = await base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1);
      return r?.[0] || null;
    },
    enabled: !!user,
  });

  const { data: docs = [] } = useQuery({
    queryKey: ['os-docs', user?.email],
    queryFn: () => base44.entities.GovDocument.filter({ user_id: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: cases = [] } = useQuery({
    queryKey: ['os-cases', user?.email],
    queryFn: () => base44.entities.Case.filter({}, '-created_date'),
    enabled: !!user,
  });

  const { data: lifeEvents = [] } = useQuery({
    queryKey: ['os-life-events', user?.email],
    queryFn: () => base44.entities.LifeEvent.filter({ user_id: user.email }, '-created_date'),
    enabled: !!user,
  });

  const { data: timeline = [] } = useQuery({
    queryKey: ['os-timeline', user?.email],
    queryFn: () => base44.entities.CivicTimelineEvent.filter({ user_id: user.email }, '-created_date', 20),
    enabled: !!user,
  });

  const stats = useMemo(() => {
    const savedFromEvents = lifeEvents.reduce((s, le) => s + (le.estimated_time_saved_min || 0), 0);
    const queuesAvoided = lifeEvents.length * 2 + cases.length;
    const formsAutofilled = docs.filter(d => d.ocr_full_name).length;
    const tripsAvoided = Math.round(savedFromEvents / 90);
    const docsReused = formsAutofilled;
    const activeCases = cases.filter(c => c.status !== 'completed').length;
    const expiringSoon = docs.filter(d => {
      if (!d.expiry_date) return false;
      const days = (new Date(d.expiry_date) - new Date()) / 86400000;
      return days >= 0 && days <= 90;
    }).length;

    return {
      savedMin: savedFromEvents + cases.length * 35,
      queuesAvoided,
      formsAutofilled,
      tripsAvoided,
      docsReused,
      activeCases,
      expiringSoon,
      activeLifeEvents: lifeEvents.filter(le => le.status !== 'completed' && le.status !== 'dismissed').length,
    };
  }, [lifeEvents, cases, docs]);

  const trustScore = computeTrustScore({ profile, docs, lifeEvents });
  const completionPct = computeCompletionPct(profile);
  const verified = !!profile?.identity_ocr_verified;
  const autofillReady = completionPct >= 70;
  const fullName = profile?.full_name || user?.full_name || 'Cetățean NoQueue';

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-[1fr_auto] gap-6 items-start mb-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
                <Activity className="w-3 h-3 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">NoQueue OS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Welcome back, <span className="text-primary">{fullName.split(' ')[0]}</span>.
              </h1>
              <p className="text-sm text-slate-400 mt-2 max-w-xl">
                Your civic operating system. Once your identity is verified, bureaucracy becomes automatic.
              </p>

              {/* Hero saved-time metric */}
              <div className="mt-6 rounded-2xl p-5 border"
                style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.08))', borderColor: 'rgba(37,99,235,0.3)' }}>
                <p className="text-[10px] uppercase font-bold tracking-wider text-primary">Estimated bureaucracy time saved</p>
                <p className="text-5xl font-black text-white mt-1">
                  <AnimatedCounter value={Math.round(stats.savedMin / 60)} />
                  <span className="text-2xl text-slate-400 font-bold ml-1">h</span>
                  <span className="text-2xl text-slate-300 font-black ml-2">
                    <AnimatedCounter value={stats.savedMin % 60} />
                  </span>
                  <span className="text-2xl text-slate-400 font-bold ml-1">min</span>
                </p>
                <p className="text-xs text-slate-400 mt-2">
                  Across {lifeEvents.length} life event{lifeEvents.length !== 1 ? 's' : ''} and {cases.length} case{cases.length !== 1 ? 's' : ''}.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                <Link to="/life-events" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-primary text-white text-sm font-bold hover:bg-primary/90">
                  <Sparkles className="w-3.5 h-3.5" /> Start a life event
                </Link>
                <Link to="/run-demo" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-accent/30 text-accent bg-accent/10 text-sm font-bold hover:bg-accent/20">
                  <Zap className="w-3.5 h-3.5" /> Run 90s demo
                </Link>
                <Link to="/cases" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-white/10 text-white text-sm font-bold hover:bg-white/5">
                  <Briefcase className="w-3.5 h-3.5" /> My cases
                </Link>
              </div>
            </div>

            <BureaucraticPassportCard
              fullName={fullName}
              verified={verified}
              completionPct={completionPct}
              trustScore={trustScore}
              verifiedDocs={docs.length}
              autofillReady={autofillReady}
              activeCases={stats.activeCases}
            />
          </motion.div>

          {/* Metrics grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mb-8">
            <OsMetricTile icon={Clock}      label="Saved time"      value={Math.round(stats.savedMin / 60)} suffix="h"  accent="primary" />
            <OsMetricTile icon={RotateCcw}  label="Queues avoided"  value={stats.queuesAvoided} accent="accent" />
            <OsMetricTile icon={FileCheck2} label="Forms autofilled" value={stats.formsAutofilled} accent="success" />
            <OsMetricTile icon={Calendar}   label="Trips avoided"   value={stats.tripsAvoided} accent="success" />
            <OsMetricTile icon={Briefcase}  label="Active cases"    value={stats.activeCases} accent="warning" />
            <OsMetricTile icon={AlertTriangle} label="Expiring soon" value={stats.expiringSoon} accent="warning" hint="next 90 days" />
          </div>

          {/* Two-column: life events + timeline */}
          <div className="grid lg:grid-cols-[1fr_1.2fr] gap-5">
            {/* Active life events */}
            <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-bold text-white">Active life events</h2>
                </div>
                <Link to="/life-events" className="text-[10px] font-bold text-primary hover:text-primary/80 flex items-center gap-1">
                  Browse all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {lifeEvents.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 mb-3">No life events yet.</p>
                  <Link to="/life-events" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:text-primary/80">
                    Start your first one <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ) : (
                <ul className="space-y-2">
                  {lifeEvents.slice(0, 5).map(le => (
                    <li key={le.id} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 transition-all">
                      <div className="w-9 h-9 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-white">{le.event_title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[9px] uppercase tracking-wider font-bold text-slate-500">{le.category}</span>
                          <span className="text-[9px] text-emerald-400">~{Math.round((le.estimated_time_saved_min || 0) / 60)}h saved</span>
                        </div>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        le.status === 'completed' ? 'bg-emerald-500/15 text-emerald-300'
                        : le.status === 'in_progress' ? 'bg-primary/15 text-primary'
                        : 'bg-white/5 text-slate-400'
                      }`}>{le.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Civic timeline */}
            <div className="rounded-2xl p-5 bg-white/[0.02] border border-white/8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-accent" />
                  <h2 className="text-sm font-bold text-white">Civic history ledger</h2>
                </div>
                <span className="text-[9px] text-slate-500 uppercase tracking-wider">{timeline.length} entries</span>
              </div>
              <ImmutableTimeline events={timeline} />
            </div>
          </div>

          {/* Identity nudge */}
          {!verified && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 rounded-2xl p-4 border flex items-center gap-3"
              style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.25)' }}
            >
              <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">Verify your identity once to unlock automatic bureaucracy.</p>
                <p className="text-[11px] text-slate-400">Scanning your ID will auto-fill every future form.</p>
              </div>
              <Link to="/identity-onboarding" className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-500/30">
                Verify now
              </Link>
            </motion.div>
          )}

          <p className="text-[10px] text-slate-700 text-center mt-8">
            🧪 Prototype — Conceptual civic operating system inspired by Estonia's e-governance UX. Not an official Romanian government platform.
          </p>
        </div>
      </div>
    </div>
  );
}