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
import { ArrowLeft, ShieldCheck, AlertCircle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { STATES } from '@/state/onboardingStateMachine';
import { extractRomanianIdData } from '@/services/ocr/romanianIdOcrService';
import { encryptField } from '@/lib/security/encryption';
import { logAuditEvent } from '@/lib/security/auditLogger';
import StepProgressBar from '@/components/identityOnboarding/StepProgressBar';
import EmailEntryStep from '@/components/identityOnboarding/EmailEntryStep';
import IdUploadStep from '@/components/identityOnboarding/IdUploadStep';
import OcrProcessingStep from '@/components/identityOnboarding/OcrProcessingStep';
import ReviewExtractedIdentity from '@/components/identityOnboarding/ReviewExtractedIdentity';
import TwoFactorStep from '@/components/identityOnboarding/TwoFactorStep';
import ProfileGeneratedStep from '@/components/identityOnboarding/ProfileGeneratedStep';
import { Button } from '@/components/ui/button';

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
        setError('Nu am putut citi cartea de identitate. Asigură-te că imaginea este clară, fără umbre sau reflexii, și că toate cele 4 colțuri sunt vizibile.');
        setState(STATES.ERROR);
        return;
      }
      setOcrResult(result);
      setState(STATES.REVIEW_DATA);
    } catch (err) {
      console.warn('OCR failed:', err);
      setError('Eroare la procesarea OCR. Te rugăm să încerci din nou.');
      setState(STATES.ERROR);
    }
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
      await saveSafeProfile();
      logAuditEvent({ userId: email, action: 'identity_2fa_verified', resourceType: 'IdentityOnboarding' });
      setState(STATES.PROFILE_GENERATED);
    } catch (err) {
      console.warn('Profile save failed:', err);
      setError('Eroare la salvarea profilului. Încearcă din nou.');
      setState(STATES.ERROR);
    }
    setSavingProfile(false);
  };

  // ── Persist Safe Profile + IdentitySecret + GovDocument ─────────────

  const saveSafeProfile = async () => {
    const d = verifiedData;
    if (!d || !email) throw new Error('Missing data or email');

    // Encrypt sensitive fields
    const enc = async (v) => v ? await encryptField(v, email) : null;
    const [encCnp, encSeries, encNumber] = await Promise.all([
      enc(d.cnp), enc(d.id_series), enc(d.id_number),
    ]);

    const cnpMasked = d.cnp ? d.cnp.slice(0, 4) + '******' + d.cnp.slice(-3) : null;
    const fullName = [d.first_name, d.last_name].filter(Boolean).join(' ');

    // Update or create UserPrivateProfile
    const profilePayload = {
      user_id: email,
      email,
      first_name: d.first_name,
      last_name: d.last_name,
      full_name: fullName,
      sex: d.sex,
      birth_date: d.birth_date,
      birth_place: d.birth_place,
      address_line_1: d.address,
      county: d.county,
      city: d.city,
      country: 'Romania',
      citizenship: d.citizenship || 'ROU',
      id_series: encSeries,
      id_number: encNumber,
      id_issued_by: d.id_issued_by,
      id_issue_date: d.id_issue_date,
      id_expiry_date: d.id_expiry_date,
      id_front_file_url: ocrResult.fileUrl,
      identity_ocr_verified: true,
      onboarding_completed: true,
      is_profile_complete: true,
      last_verified_at: new Date().toISOString(),
    };

    const secretPayload = {
      user_id: email,
      cnp_raw: encCnp,
      cnp_masked: cnpMasked,
      id_series: encSeries,
      id_number: encNumber,
      birth_date: d.birth_date,
      legal_address_full: d.address,
      verified_by_user_at: new Date().toISOString(),
    };

    const [profiles, secrets] = await Promise.all([
      base44.entities.UserPrivateProfile.filter({ user_id: email }, '-created_date', 1),
      base44.entities.IdentitySecret.filter({ user_id: email }, '-created_date', 1),
    ]);

    const [savedProfile] = await Promise.all([
      profiles?.length
        ? base44.entities.UserPrivateProfile.update(profiles[0].id, profilePayload)
        : base44.entities.UserPrivateProfile.create(profilePayload),
      secrets?.length
        ? base44.entities.IdentitySecret.update(secrets[0].id, secretPayload)
        : base44.entities.IdentitySecret.create(secretPayload),
      base44.entities.GovDocument.create({
        user_id: email,
        document_type: 'id_card',
        document_title: 'Carte de Identitate',
        institution: d.id_issued_by || 'SPCJEP',
        file_url: ocrResult.fileUrl,
        ocr_full_name: fullName,
        ocr_document_number: d.id_number,
        ocr_address: d.address,
        ocr_institution: d.id_issued_by,
        issue_date: d.id_issue_date,
        expiry_date: d.id_expiry_date,
        ocr_confidence: String(ocrResult.confidence.overall.toFixed(2)),
        status: 'active',
        tags: ['identity_onboarding', 'noqueue_ocr', 'verified_by_user'],
      }),
    ]);

    setProfile({
      ...d,
      full_name: fullName,
      cnp_masked: cnpMasked,
      id: savedProfile?.id,
    });
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

        {/* Progress bar (hidden on complete) */}
        {state !== STATES.PROFILE_GENERATED && state !== STATES.ERROR && (
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
              <motion.div key="error" exit={{ opacity: 0 }} className="text-center py-6">
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
                <h2 className="text-xl font-bold text-white mb-2">Ceva nu a mers</h2>
                <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto">{error}</p>
                <Button onClick={handleRescan} className="rounded-2xl bg-primary">Încearcă din nou</Button>
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