/**
 * AnticipatoryDashboard — Home page section showing proactive predictions
 *
 * Hydrates from UserPrivateProfile + GovDocument and renders prediction cards.
 */
import React from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Sparkles, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { predictCivicNeeds, summarizePredictions } from '@/services/anticipatory/lifeEventPredictor';
import PredictionCard from './PredictionCard';

export default function AnticipatoryDashboard() {
  const { data: user } = useQuery({ queryKey: ['me'], queryFn: () => base44.auth.me() });

  const { data: profiles = [] } = useQuery({
    queryKey: ['anticipatory-profile', user?.email],
    queryFn: () => base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1),
    enabled: !!user?.email,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['anticipatory-docs', user?.email],
    queryFn: () => base44.entities.GovDocument.filter({ user_id: user.email }, '-created_date', 50),
    enabled: !!user?.email,
  });

  const profile = profiles[0] || {};
  const predictions = React.useMemo(
    () => predictCivicNeeds({ profile, documents }),
    [profile, documents]
  );
  const summary = summarizePredictions(predictions);
  const topPredictions = predictions.slice(0, 4);

  // Don't show if user has no profile data yet
  if (!user || !profile.id) {
    return (
      <section className="py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-[2rem] glass-card p-8 sm:p-10 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-4">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">NEW · Anticipatory AI</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Anticipăm ce ai nevoie, înainte să întrebi
            </h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-6">
              Scanează-ți buletinul o singură dată — NoQueue AI îți va spune când să reînnoiești documente, ce să faci la 18 ani, dacă adresa s-a schimbat și multe altele.
            </p>
            <Link to="/identity-onboarding">
              <button className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-white font-semibold text-sm">
                Activează Anticipatory AI <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/25 mb-2">
                <Activity className="w-3 h-3 text-accent" />
                <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Anticipatory AI · NoQueue 2.0</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Ce vine pentru tine în curând
              </h2>
            </div>
            {/* Summary chips */}
            {summary.total > 0 && (
              <div className="hidden sm:flex items-center gap-2 text-xs">
                {summary.critical > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-destructive/15 text-destructive font-bold">
                    {summary.critical} urgent
                  </span>
                )}
                {summary.warning > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-warning/15 text-warning font-bold">
                    {summary.warning} atenție
                  </span>
                )}
                {summary.opportunities > 0 && (
                  <span className="px-2 py-1 rounded-lg bg-green-500/15 text-green-400 font-bold">
                    {summary.opportunities} oportunități
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Predictions grid or empty state */}
          {topPredictions.length === 0 ? (
            <div className="rounded-2xl p-8 text-center glass-card">
              <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-sm font-semibold text-white mb-1">Totul e în regulă — niciun document nu expiră în curând.</p>
              <p className="text-xs text-slate-500">Adaugă mai multe documente în Identity Vault pentru predicții mai bogate.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {topPredictions.map((p, i) => (
                <PredictionCard key={p.id} prediction={p} index={i} />
              ))}
            </div>
          )}

          {predictions.length > 4 && (
            <div className="text-center mt-5">
              <Link to="/copilot" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent/80 font-semibold">
                Vezi toate cele {predictions.length} predicții <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}