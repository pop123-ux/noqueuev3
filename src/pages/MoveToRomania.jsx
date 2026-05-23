/**
 * Move to Romania — main page
 * Onboarding wizard → personalized checklist → progress tracking
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Globe2, ArrowLeft, RotateCcw } from 'lucide-react';
import Navbar from '@/components/noqueue/Navbar';
import Footer from '@/components/noqueue/Footer';
import OnboardingWizard from '@/components/moveToRomania/OnboardingWizard';
import ProgressCard from '@/components/moveToRomania/ProgressCard';
import ChecklistItem from '@/components/moveToRomania/ChecklistItem';
import LanguageSwitcher from '@/components/moveToRomania/LanguageSwitcher';
import { generateChecklist, computeProgress } from '@/lib/moveToRomania/checklistEngine';
import { tr } from '@/lib/moveToRomania/translations';

export default function MoveToRomania() {
  const [lang, setLang] = useState('en');
  const [answers, setAnswers] = useState(null);
  const [checklist, setChecklist] = useState([]);

  const handleComplete = (a) => {
    setAnswers(a);
    setChecklist(generateChecklist(a));
  };

  const handleReset = () => {
    setAnswers(null);
    setChecklist([]);
  };

  const handleStatusChange = (id, newStatus) => {
    setChecklist(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
  };

  const progress = computeProgress(checklist);

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to NoQueue
          </Link>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-3">
                <Globe2 className="w-3.5 h-3.5 text-accent" />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">NoQueue Module</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{tr('title', lang)}</h1>
              <p className="text-slate-400 mt-2 max-w-xl text-sm">{tr('subtitle', lang)}</p>
            </div>
            <LanguageSwitcher lang={lang} onChange={setLang} />
          </div>
        </motion.div>

        {/* Body */}
        {!answers ? (
          <OnboardingWizard lang={lang} onComplete={handleComplete} />
        ) : (
          <div className="space-y-5">
            <ProgressCard progress={progress} lang={lang} />

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">{tr('checklist_title', lang)}</h2>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart
              </button>
            </div>

            <div className="space-y-3">
              {checklist.map((item, i) => (
                <ChecklistItem
                  key={item.id}
                  item={item}
                  lang={lang}
                  index={i}
                  onStatusChange={(s) => handleStatusChange(item.id, s)}
                />
              ))}
            </div>

            <p className="text-[10px] text-slate-600 text-center pt-4">
              ⚖️ All information is orientative. Always verify final requirements with the relevant institution.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}