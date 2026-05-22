import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, ArrowRight, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { classifyDivorce, divorceCategories } from '@/lib/data/civicDocuments';
import DocumentCard from './DocumentCard';
import civicDocuments from '@/lib/data/civicDocuments';

const questions = [
  {
    id: 'hasConsent',
    question: 'Do you and your spouse both agree on the divorce?',
    questionRo: 'Ambii soți sunt de acord cu divorțul?',
    options: [
      { value: true, label: 'Yes, we both agree', emoji: '✅' },
      { value: false, label: 'No, it\'s contested', emoji: '⚠️' },
    ]
  },
  {
    id: 'hasMinors',
    question: 'Do you have minor children together?',
    questionRo: 'Aveți copii minori împreună?',
    options: [
      { value: true, label: 'Yes, we have minor children', emoji: '👶' },
      { value: false, label: 'No minor children', emoji: '✅' },
    ]
  },
  {
    id: 'hasDisputes',
    question: 'Are there disputed property, financial, or custody matters?',
    questionRo: 'Există bunuri comune, pensie alimentară sau alte aspecte în dispută?',
    options: [
      { value: true, label: 'Yes, there are disputes', emoji: '⚖️' },
      { value: false, label: 'No disputes — everything agreed', emoji: '✅' },
    ]
  }
];

export default function DivorceWizard({ onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);

  const handleAnswer = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);

    // Skip remaining questions if contested
    if (questionId === 'hasConsent' && value === false) {
      const classification = classifyDivorce({ hasConsent: false, hasMinors: false, hasDisputes: true });
      setResult(classification);
      return;
    }

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      const classification = classifyDivorce({
        hasConsent: newAnswers.hasConsent,
        hasMinors: newAnswers.hasMinors,
        hasDisputes: newAnswers.hasDisputes ?? false
      });
      setResult(classification);
    }
  };

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  const resultDocs = result
    ? civicDocuments.filter(d => result.documents.includes(d.id))
    : [];

  return (
    <div className="rounded-2xl bg-white/[0.04] border border-white/10 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
        <Scale className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-white">Divorce Intelligence Wizard</span>
        <span className="ml-auto text-[10px] text-slate-500">AI-guided</span>
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {!result ? (
            <motion.div
              key={`step-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Progress dots */}
              <div className="flex gap-1.5 mb-4">
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-all ${
                      i < step ? 'bg-primary' : i === step ? 'bg-primary/60' : 'bg-white/10'
                    }`}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-400 mb-1">Question {step + 1} of {questions.length}</p>
              <h4 className="text-sm font-semibold text-white mb-4">{questions[step].question}</h4>

              <div className="space-y-2">
                {questions[step].options.map(opt => (
                  <button
                    key={String(opt.value)}
                    onClick={() => handleAnswer(questions[step].id, opt.value)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-left bg-white/[0.03] border border-white/8 text-slate-300 hover:bg-primary/10 hover:text-white hover:border-primary/30 transition-all"
                  >
                    <span className="text-base">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {/* Result header */}
              <div
                className="rounded-2xl p-4 mb-4 border"
                style={{
                  backgroundColor: `${result.color}10`,
                  borderColor: `${result.color}30`
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 className="w-4 h-4" style={{ color: result.color }} />
                  <span className="text-xs font-bold uppercase tracking-wider" style={{ color: result.color }}>
                    Recommended Route
                  </span>
                </div>
                <h4 className="text-base font-bold text-white">{result.label}</h4>
                <p className="text-xs text-slate-400 mt-1">{result.conditions}</p>
              </div>

              {/* Type-specific advice */}
              {result.id === 'divorce-notary' && (
                <div className="rounded-xl bg-success/6 border border-success/15 p-3 mb-4">
                  <p className="text-xs text-slate-300">
                    <span className="text-success font-semibold">Best option:</span> Go to any notary public in Cluj-Napoca together. The notary drafts everything. Fastest and most private route.
                  </p>
                </div>
              )}
              {result.id === 'divorce-civil' && (
                <div className="rounded-xl bg-accent/6 border border-accent/15 p-3 mb-4">
                  <p className="text-xs text-slate-300">
                    <span className="text-accent font-semibold">Easiest option:</span> Visit Starea Civilă Cluj-Napoca with your marriage certificate and IDs. Free of charge, 30-day waiting period.
                  </p>
                </div>
              )}
              {result.id === 'divorce-court' && (
                <div className="rounded-xl bg-destructive/6 border border-destructive/15 p-3 mb-4">
                  <p className="text-xs text-slate-300">
                    <span className="text-destructive font-semibold">Important:</span> Contested divorce requires court proceedings. Strongly recommended to engage a family law lawyer in Cluj-Napoca.
                  </p>
                </div>
              )}

              {/* Documents */}
              {resultDocs.length > 0 && (
                <div className="space-y-2 mb-4">
                  {resultDocs.map(doc => (
                    <DocumentCard key={doc.id} doc={doc} compact />
                  ))}
                </div>
              )}

              <button
                onClick={reset}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors mx-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start over
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}