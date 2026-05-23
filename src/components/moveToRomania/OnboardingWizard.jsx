/**
 * Move to Romania — onboarding questionnaire wizard
 */
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Sparkles, Globe2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { tr } from '@/lib/moveToRomania/translations';

const QUESTIONS = [
  {
    id: 'citizenship',
    qKey: 'q_citizenship',
    options: [
      { value: 'eu', labelKey: 'eu', icon: '🇪🇺' },
      { value: 'non_eu', labelKey: 'non_eu', icon: '🌍' },
    ],
  },
  {
    id: 'country',
    qKey: 'q_country',
    type: 'text',
    placeholder: { en: 'e.g. Germany, India, Brazil', ro: 'ex: Germania, India', ua: 'напр. Україна', fr: 'ex: France' },
  },
  {
    id: 'reason',
    qKey: 'q_reason',
    options: [
      { value: 'work', labelKey: 'work', icon: '💼' },
      { value: 'study', labelKey: 'study', icon: '🎓' },
      { value: 'family', labelKey: 'family', icon: '👨‍👩‍👧' },
      { value: 'business', labelKey: 'business', icon: '🏢' },
      { value: 'refugee', labelKey: 'refugee', icon: '🛡️' },
      { value: 'long_stay', labelKey: 'long_stay', icon: '✈️' },
    ],
  },
  {
    id: 'city',
    qKey: 'q_city',
    type: 'text',
    placeholder: { en: 'e.g. Cluj-Napoca', ro: 'ex: Cluj-Napoca', ua: 'напр. Клуж-Напока', fr: 'ex: Cluj-Napoca' },
    default: 'Cluj-Napoca',
  },
  { id: 'housing', qKey: 'q_housing', options: [{ value: 'yes', labelKey: 'yes', icon: '✅' }, { value: 'no', labelKey: 'no', icon: '❌' }] },
  { id: 'contract', qKey: 'q_contract', options: [{ value: 'yes', labelKey: 'yes', icon: '✅' }, { value: 'no', labelKey: 'no', icon: '❌' }] },
  { id: 'healthcare', qKey: 'q_healthcare', options: [{ value: 'yes', labelKey: 'yes', icon: '✅' }, { value: 'no', labelKey: 'no', icon: '❌' }] },
  { id: 'residence', qKey: 'q_residence', options: [{ value: 'yes', labelKey: 'yes', icon: '✅' }, { value: 'no', labelKey: 'no', icon: '❌' }] },
];

export default function OnboardingWizard({ lang, onComplete }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({ city: 'Cluj-Napoca' });

  const q = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const canNext = q.type === 'text' ? !!answers[q.id]?.trim() : !!answers[q.id];

  const next = () => {
    if (isLast) onComplete(answers);
    else setStep(s => s + 1);
  };
  const back = () => setStep(s => Math.max(0, s - 1));
  const select = (val) => {
    setAnswers(prev => ({ ...prev, [q.id]: val }));
    // Auto-advance for buttons
    if (q.type !== 'text') {
      setTimeout(() => {
        if (step === QUESTIONS.length - 1) onComplete({ ...answers, [q.id]: val });
        else setStep(s => s + 1);
      }, 250);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-semibold">
          <span>Step {step + 1} of {QUESTIONS.length}</span>
          <span>{Math.round(((step + 1) / QUESTIONS.length) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="glass-card rounded-3xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-2 mb-2">
            <Globe2 className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{tr('title', lang)}</span>
          </div>
          <h3 className="text-2xl font-bold text-white mb-6 leading-tight">{tr(q.qKey, lang)}</h3>

          {q.type === 'text' ? (
            <input
              autoFocus
              value={answers[q.id] || ''}
              onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
              onKeyDown={e => { if (e.key === 'Enter' && canNext) next(); }}
              placeholder={q.placeholder[lang] || q.placeholder.en}
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-4 text-base text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
            />
          ) : (
            <div className={`grid gap-3 ${q.options.length > 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => select(opt.value)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                      selected ? 'bg-primary/20 border-primary/40 scale-[1.02]' : 'bg-white/[0.03] border-white/8 hover:bg-white/5'
                    }`}
                    style={{ border: '1px solid' }}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`text-sm font-semibold ${selected ? 'text-white' : 'text-slate-300'}`}>
                      {tr(opt.labelKey, lang)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Nav */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={back}
              disabled={step === 0}
              className="text-slate-400 hover:text-white disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />{tr('back', lang)}
            </Button>
            <Button
              onClick={next}
              disabled={!canNext}
              className="bg-primary hover:bg-primary/90 rounded-2xl px-6"
            >
              {isLast ? <><Sparkles className="w-4 h-4 mr-2" />{tr('finish', lang)}</> : <>{tr('next', lang)}<ChevronRight className="w-4 h-4 ml-1" /></>}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}