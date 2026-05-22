import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle2, AlertTriangle, User, ArrowRight } from 'lucide-react';
import { getProfileCompleteness, getMissingFields, REQUIRED_FIELDS_LABELS } from '@/lib/documents/profileFieldMap';

const CORE_REQUIRED = ['first_name', 'last_name', 'cnp', 'birth_date', 'address_line_1', 'city', 'id_series', 'id_number'];

export default function ProfileCompletenessCard({ profile, compact = false }) {
  const score = getProfileCompleteness(profile);
  const missingCore = getMissingFields(profile, CORE_REQUIRED);
  const isComplete = score >= 80;

  const barColor = score >= 80 ? '#22c55e' : score >= 50 ? '#facc15' : '#ef4444';

  if (compact) {
    return (
      <Link
        to="/profile"
        className={`flex items-center gap-3 p-3 rounded-xl border transition-all hover:bg-white/5 ${
          isComplete ? 'bg-success/5 border-success/20' : 'bg-warning/5 border-warning/20'
        }`}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isComplete ? 'bg-success/15' : 'bg-warning/15'}`}>
          {isComplete
            ? <CheckCircle2 className="w-4 h-4 text-success" />
            : <AlertTriangle className="w-4 h-4 text-warning" />
          }
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold text-white">Profile {score}% complete</p>
          {!isComplete && (
            <p className="text-[10px] text-slate-400">{missingCore.length} required fields missing</p>
          )}
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
      </Link>
    );
  }

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/8 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-white">Profile Completeness</h3>
        </div>
        <span className="text-sm font-bold" style={{ color: barColor }}>{score}%</span>
      </div>

      <div className="h-2 bg-white/8 rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: barColor }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6 }}
        />
      </div>

      {missingCore.length > 0 ? (
        <div>
          <p className="text-xs text-slate-400 mb-2">Missing required fields:</p>
          <div className="flex flex-wrap gap-1.5">
            {missingCore.map(f => (
              <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                {REQUIRED_FIELDS_LABELS[f] || f}
              </span>
            ))}
          </div>
          <Link
            to="/profile"
            className="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors border border-primary/20"
          >
            Complete your profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-2 text-success text-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>Core fields complete — documents can be auto-filled</span>
        </div>
      )}

      {profile?.signature_file_url && (
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-success" /> Signature uploaded
        </div>
      )}
      {profile?.id_front_file_url && (
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          <CheckCircle2 className="w-3 h-3 text-success" /> ID card uploaded
        </div>
      )}
    </div>
  );
}