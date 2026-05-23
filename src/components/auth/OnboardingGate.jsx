/**
 * OnboardingGate — Full-screen identity verification onboarding
 * Shown when user.onboarding_completed is false.
 * Steps: 1=Email, 2=OTP, 3=ID OCR, 4=Signature, 5=Consents
 */
import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import StepAuth from './StepAuth';
import StepIdUpload from './StepIdUpload';
import StepSignature from './StepSignature';
import StepConsents from './StepConsents';

const STEPS = [
  { label: 'Email' },
  { label: 'Verificare' },
  { label: 'Identitate' },
  { label: 'Semnătură' },
  { label: 'Activare' },
];

function StepProgress({ current }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                i < current ? 'bg-success' : i === current ? 'bg-primary scale-125' : 'bg-white/15'
              }`}
            />
            <span className={`text-[9px] font-medium hidden sm:block transition-colors ${
              i === current ? 'text-primary' : i < current ? 'text-success' : 'text-slate-600'
            }`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-8 h-px mb-3 transition-colors ${i < current ? 'bg-success/50' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
    </div>
  );
}

const variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

export default function OnboardingGate({ user, onComplete }) {
  // Start at step 2 (ID upload) if user is already authenticated via platform
  // Steps: 0=Email, 1=OTP, 2=ID, 3=Signature, 4=Consents
  const [step, setStep] = useState(2);

  const advance = () => setStep(s => s + 1);

  const handleFinalComplete = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-4 py-12">
      {/* Brand */}
      <div className="flex items-center gap-2 mb-10">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-lg font-bold text-white">NoQueue</span>
          <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Cluj</span>
        </div>
        <p className="ml-3 text-sm text-slate-500 hidden sm:block">Birocrația fără coadă.</p>
      </div>

      <div className="w-full max-w-lg">
        <StepProgress current={step} />

        <div className="glass-card rounded-2xl border border-white/8 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="email" {...variants} transition={{ duration: 0.3 }}>
                <StepAuth user={user} onComplete={advance} />
              </motion.div>
            )}
            {step === 1 && (
              <motion.div key="otp" {...variants} transition={{ duration: 0.3 }}>
                <StepAuth user={user} onComplete={advance} startAtOTP />
              </motion.div>
            )}
            {step === 2 && (
              <motion.div key="id" {...variants} transition={{ duration: 0.3 }}>
                <StepIdUpload user={user} onComplete={advance} />
              </motion.div>
            )}
            {step === 3 && (
              <motion.div key="sig" {...variants} transition={{ duration: 0.3 }}>
                <StepSignature user={user} onComplete={advance} />
              </motion.div>
            )}
            {step === 4 && (
              <motion.div key="consents" {...variants} transition={{ duration: 0.3 }}>
                <StepConsents user={user} onComplete={handleFinalComplete} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs text-slate-700 mt-6">
          NoQueue · Date criptate · Conform GDPR
        </p>
      </div>
    </div>
  );
}