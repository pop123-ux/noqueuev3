/**
 * SmartDocAnalyzer — Smart Document Intelligence main page
 */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/noqueue/Navbar';
import SmartDocUploader from '@/components/smartDoc/SmartDocUploader';
import SmartDocPipeline from '@/components/smartDoc/SmartDocPipeline';
import SmartDocReport from '@/components/smartDoc/SmartDocReport';
import { analyzeDocument } from '@/services/documents/smartDocumentAnalyzer';

export default function SmartDocAnalyzer() {
  const [phase, setPhase] = useState('idle'); // idle | analyzing | done | error
  const [step, setStep] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    setPhase('analyzing');
    setStep(0);
    setReport(null);
    setError(null);

    try {
      const result = await analyzeDocument(file, (i, label) => {
        setStep(i);
        setStepLabel(label);
      });
      setReport(result);
      setPhase('done');
    } catch (err) {
      console.warn('SmartDoc analysis failed:', err);
      setError(err?.message || 'Eroare la analiza documentului');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setPhase('idle');
    setReport(null);
    setError(null);
    setStep(0);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Înapoi la NoQueue AI
        </Link>

        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Smart Document Intelligence</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-bold">NEW</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Analiză inteligentă a documentelor</h1>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Încarcă orice document oficial. NoQueue AI extrage datele, verifică validitatea conform legislației în vigoare și îți explică totul în română simplă.
          </p>
        </motion.div>

        {/* Main content */}
        {phase === 'idle' && <SmartDocUploader onFile={handleFile} />}

        {phase === 'analyzing' && (
          <SmartDocPipeline currentStep={step} currentLabel={stepLabel} />
        )}

        {phase === 'done' && report && (
          <SmartDocReport report={report} onReset={handleReset} />
        )}

        {phase === 'error' && (
          <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm font-semibold text-white mb-1">Analiza a eșuat</p>
            <p className="text-xs text-slate-400 mb-4">{error}</p>
            <button onClick={handleReset} className="text-xs text-primary hover:text-primary/80 font-semibold">Încearcă din nou →</button>
          </div>
        )}

        {/* Feature highlights — only on idle */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8"
          >
            {[
              { icon: '🔍', title: 'OCR avansat', desc: 'Extrage automat câmpuri, date și texte din orice document.' },
              { icon: '⚖️', title: 'Validare legală', desc: 'Verifică legislația românească în vigoare în timp real.' },
              { icon: '💡', title: 'Explicat simplu', desc: 'Glosar, sumar și pași concreți — fără jargon juridic.' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl p-4" style={{ background: 'rgba(17,28,51,0.5)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="text-2xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold text-white mb-1">{f.title}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}