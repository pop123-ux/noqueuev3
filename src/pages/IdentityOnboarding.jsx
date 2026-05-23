/**
 * IdentityOnboarding — NoQueue AI 2.0 ROeID-style Identity Flow
 *
 * Full journey: Email → ID Upload → OCR → Review → 2FA → Profile Generated
 *
 * On completion:
 *   - Encrypted Safe Profile (UserPrivateProfile + IdentitySecret)
 *   - ID card stored in My Cases / GovDocument
 *   - NoQueue AI + Export PDF Draft instantly use profile fields
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Zap } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { STATES } from '@/state/onboardingStateMachine';
import { extractRomanianIdData } from '@/services/ocr/romanianIdOcrService';
import { logAuditEvent } from '@/lib/security/auditLogger';
import { syncScannedIdentityToProfile } from '@/lib/profile/syncScannedIdentityToProfile';
import StepProgressBar from '@/components/identityOnboarding/StepProgressBar';
import EmailEntryStep from '@/components/identityOnboarding/EmailEntryStep';
import IdUploadStep from '@/components/identityOnboarding/IdUploadStep';
import OcrProcessingStep from '@/components/identityOnboarding/OcrProcessingStep';
import ReviewExtractedIdentity from '@/components/identityOnboarding/ReviewExtractedIdentity';
import TwoFactorStep from '@/components/identityOnboarding/TwoFactorStep';
import ProfileGeneratedStep from '@/components/identityOnboarding/ProfileGeneratedStep';
import OcrRecoveryPanel from '@/components/identityOnboarding/OcrRecoveryPanel';
import ManualIdentityForm from '@/components/identityOnboarding/ManualIdentityForm';

/** Demo Romanian identity used when judges click "Continue with demo identity". */
const DEMO_IDENTITY = {
  first_name: 'Andrei',
  last_name: 'Popescu',
  full_name: 'Andrei Popescu',
  cnp: '1960515123456',
  id_series: 'CJ',
  id_number: '345621',
  address: 'Str. Memorandumului nr. 21, ap. 4',
  city: 'Cluj-Napoca',
  county: 'Cluj',
  id_issued_by: 'SPCJEP Cluj',
  id_issue_date: '2020-05-15',
  id_expiry_date: '2030-05-15',
  birth_date: '1996-05-15',
  birth_place: 'Cluj-Napoca',
  sex: 'M',
  citizenship: 'ROU',
  nationality: 'Română',
};

export default function IdentityOnboarding() {
  const [state, setState] = useState(STATES.EMAIL_ENTRY);
  const [email, setEmail] = useState('');
  const [file, setFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);   // { extractedData, confidence, warnings, fileUrl, auditTrail }
  const [verifiedData, setVerifiedData] = useState(null);
  const [profile, setProfile] = useState(null);
  const [ocrStep, setOcrStep] = useState(0);
  const [ocrLabel, setOcrLabel] = useState('');
  const [error, setError] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const queryClient = useQueryClient();

  // Pre-fill email from auth (best effort)
  useEffect(() => {
    base44.auth.me().then(u => { if (u?.email) setEmail(u.email); }).catch(() => {});
  }, []);

  // ── Step transitions ───────────────────────────────────────────────

  const handleEmailNext = (em) => {
    setEmail(em);
    setState(STATES.ID_UPLOAD);
  };

  const handleIdNext = async (f) => {
    setFile(f);
    setState(STATES.OCR_PROCESSING);
    setError(null);
    try {
      const result = await extractRomanianIdData({
        file: f,
        onProgress: (i, label) => { setOcrStep(i); setOcrLabel(label); },
      });
      logAuditEvent({ userId: email, action: 'identity_ocr_completed', resourceType: 'IdentityOnboarding', details: `confidence=${result.confidence.overall.toFixed(2)}` });
      if (!result.success) {
        // Keep partial result so the recovery panel can show confidence + prefill manual form
        setOcrResult(result);
        setError('Nu am putut citi clar cartea de identitate.');
        setState(STATES.ERROR);
        return;
      }
      setOcrResult(result);
      setState(STATES.REVIEW_DATA);
    } catch (err) {
      console.warn('OCR failed:', err);
      setOcrResult(null);
      setError('Eroare la procesarea OCR. Te rugăm să încerci din nou.');
      setState(STATES.ERROR);
    }
  };

  // ── Recovery paths ──────────────────────────────────────────────────

  const handleManualEntry = () => {
    logAuditEvent({ userId: email, action: 'identity_manual_entry_started', resourceType: 'IdentityOnboarding' });
    setState(STATES.MANUAL_ENTRY);
  };

  const handleManualSubmit = (data) => {
    // Synthesize an ocrResult shape so downstream save logic works unchanged.
    setOcrResult({
      extractedData: data,
      confidence: { overall: 1, _source: 'manual' },
      warnings: [],
      fileUrl: ocrResult?.fileUrl || null,
      auditTrail: [],
    });
    logAuditEvent({ userId: email, action: 'identity_manual_entry_submitted', resourceType: 'IdentityOnboarding' });
    setVerifiedData(data);
    setState(STATES.TWO_FACTOR);
  };

  const handleDemoIdentity = () => {
    setOcrResult({
      extractedData: DEMO_IDENTITY,
      confidence: { overall: 1, _source: 'demo' },
      warnings: [],
      fileUrl: null,
      auditTrail: [],
    });
    logAuditEvent({ userId: email, action: 'identity_demo_continued', resourceType: 'IdentityOnboarding' });
    setVerifiedData(DEMO_IDENTITY);
    setState(STATES.TWO_FACTOR);
  };

  const handleReviewConfirm = (data) => {
    setVerifiedData(data);
    logAuditEvent({ userId: email, action: 'identity_user_confirmed', resourceType: 'IdentityOnboarding' });
    setState(STATES.TWO_FACTOR);
  };

  const handleRescan = () => {
    setOcrResult(null);
    setFile(null);
    setState(STATES.ID_UPLOAD);
  };

  const handleTwoFactorVerified = async () => {
    setSavingProfile(true);
    try {
      // Resolve the authenticated user (fall back to the typed email for demo).
      const authUser = await base44.auth.me().catch(() => null);
      const user = authUser?.email ? authUser : { email };

      const sourceLabel =
        ocrResult?.confidence?._source === 'manual' ? 'manual_entry' :
        ocrResult?.confidence?._source === 'demo'   ? 'demo_identity' :
        'identity_card_scan';

      const savedProfile = await syncScannedIdentityToProfile({
        user,
        extractedData: verifiedData,
        ocrResult,
        sourceFileUrl: ocrResult?.fileUrl,
        markOnboardingComplete: true,
        sourceLabel,
      });

      // Invalidate Cont + Seif caches so they show the freshly synced data.
      queryClient.invalidateQueries({ queryKey: ['profile-hub'] });
      queryClient.invalidateQueries({ queryKey: ['vault-profile'] });
      queryClient.invalidateQueries({ queryKey: ['vault-secret'] });
      queryClient.invalidateQueries({ queryKey: ['gov-documents'] });
      queryClient.invalidateQueries({ queryKey: ['me'] });

      setProfile(savedProfile);
      logAuditEvent({ userId: user.email, action: 'identity_2fa_verified', resourceType: 'IdentityOnboarding' });
      setState(STATES.PROFILE_GENERATED);
    } catch (err) {
      console.warn('Profile save failed:', err);
      setError('Eroare la salvarea profilului. Încearcă din nou.');
      setState(STATES.ERROR);
    }
    setSavingProfile(false);
  };

  // ── Render ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background text-foreground font-inter relative overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(37,99,235,0.4) 0%, transparent 60%)' }} />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.4) 0%, transparent 60%)' }} />

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 pt-8 pb-16">
        {/* Top header */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Înapoi
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white">NoQueue</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent/20 text-accent">2.0</span>
          </div>
        </div>

        {/* Progress bar (hidden on complete + recovery paths) */}
        {state !== STATES.PROFILE_GENERATED &&
         state !== STATES.ERROR &&
         state !== STATES.MANUAL_ENTRY && (
          <StepProgressBar currentState={state} />
        )}

        {/* Step content */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 glow-blue">
          <AnimatePresence mode="wait">
            {state === STATES.EMAIL_ENTRY && (
              <motion.div key="email" exit={{ opacity: 0 }}>
                <EmailEntryStep initialEmail={email} onNext={handleEmailNext} />
              </motion.div>
            )}

            {state === STATES.ID_UPLOAD && (
              <motion.div key="upload" exit={{ opacity: 0 }}>
                <IdUploadStep onNext={handleIdNext} onBack={() => setState(STATES.EMAIL_ENTRY)} />
              </motion.div>
            )}

            {state === STATES.OCR_PROCESSING && (
              <motion.div key="ocr" exit={{ opacity: 0 }}>
                <OcrProcessingStep currentStep={ocrStep} currentLabel={ocrLabel} />
              </motion.div>
            )}

            {state === STATES.REVIEW_DATA && ocrResult && (
              <motion.div key="review" exit={{ opacity: 0 }}>
                <ReviewExtractedIdentity
                  extracted={ocrResult.extractedData}
                  confidence={ocrResult.confidence}
                  warnings={ocrResult.warnings}
                  onConfirm={handleReviewConfirm}
                  onRescan={handleRescan}
                />
              </motion.div>
            )}

            {state === STATES.TWO_FACTOR && (
              <motion.div key="2fa" exit={{ opacity: 0 }}>
                {savingProfile ? (
                  <div className="text-center py-10">
                    <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-3 animate-pulse" />
                    <p className="text-sm font-semibold text-white">Se construiește Safe Profile...</p>
                  </div>
                ) : (
                  <TwoFactorStep email={email} onVerified={handleTwoFactorVerified} />
                )}
              </motion.div>
            )}

            {state === STATES.PROFILE_GENERATED && (
              <motion.div key="done" exit={{ opacity: 0 }}>
                <ProfileGeneratedStep profile={profile} />
              </motion.div>
            )}

            {state === STATES.ERROR && (
              <motion.div key="error" exit={{ opacity: 0 }}>
                <OcrRecoveryPanel
                  confidence={ocrResult?.confidence}
                  missingCritical={ocrResult?.missingCritical}
                  unreliableCritical={ocrResult?.unreliableCritical}
                  onRetry={handleRescan}
                  onManualEntry={handleManualEntry}
                  onDemoIdentity={handleDemoIdentity}
                  onUploadDifferent={handleRescan}
                />
              </motion.div>
            )}

            {state === STATES.MANUAL_ENTRY && (
              <motion.div key="manual" exit={{ opacity: 0 }}>
                <ManualIdentityForm
                  initialData={ocrResult?.extractedData || {}}
                  onBack={() => setState(STATES.ERROR)}
                  onSubmit={handleManualSubmit}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="text-[10px] text-slate-600 text-center mt-6 max-w-md mx-auto">
          🧪 <strong>Simulare prototip</strong> — Acest flux imită experiența verificării digitale ROeID în scop demonstrativ pentru hackathonul Cluj. Nu este sistem oficial de autentificare guvernamentală.
        </p>
      </div>
    </div>
  );
}