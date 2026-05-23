/**
 * SmartDocAnalyzer — Smart Document Intelligence main page
 */
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, AlertCircle } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '@/components/noqueue/Navbar';
import SmartDocUploader from '@/components/smartDoc/SmartDocUploader';
import SmartDocPipeline from '@/components/smartDoc/SmartDocPipeline';
import SmartDocReport from '@/components/smartDoc/SmartDocReport';
import SmartDocBulkQueue from '@/components/smartDoc/SmartDocBulkQueue';
import SmartDocBulkResults from '@/components/smartDoc/SmartDocBulkResults';
import { analyzeDocument } from '@/services/documents/smartDocumentAnalyzer';
import { base44 } from '@/api/base44Client';

export default function SmartDocAnalyzer() {
  const [phase, setPhase] = useState('idle'); // idle | analyzing | done | error | bulk_analyzing | bulk_done
  const [step, setStep] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [report, setReport] = useState(null);
  const [error, setError] = useState(null);
  const [bulkItems, setBulkItems] = useState([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // Cross-app entry: ?fromVault=<docId> → fetch the file from the vault and analyze it.
  useEffect(() => {
    const fromVault = searchParams.get('fromVault');
    if (!fromVault || phase !== 'idle') return;
    (async () => {
      try {
        setPhase('analyzing');
        setStep(0);
        setStepLabel('Încarcă din Vault...');
        const docs = await base44.entities.GovDocument.filter({ id: fromVault }, '', 1);
        const doc = docs?.[0];
        if (!doc?.file_url) throw new Error('Documentul nu a fost găsit în Vault');
        const res = await fetch(doc.file_url);
        const blob = await res.blob();
        const fileName = (doc.document_title || 'document') + (blob.type.includes('pdf') ? '.pdf' : '.jpg');
        const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
        const result = await analyzeDocument(file, (i, label) => { setStep(i); setStepLabel(label); });
        setReport({ ...result, fromVault: doc.id });
        setPhase('done');
      } catch (err) {
        console.warn('SmartDoc fromVault failed:', err);
        setError(err?.message || 'Nu s-a putut analiza documentul din Vault');
        setPhase('error');
      } finally {
        searchParams.delete('fromVault');
        setSearchParams(searchParams, { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handleFiles = async (files) => {
    // Sequential bulk analysis — keeps integration credit usage predictable
    // and lets the user watch progress per file.
    const initial = files.map(file => ({ file, status: 'pending', report: null, error: null }));
    setBulkItems(initial);
    setBulkIndex(0);
    setPhase('bulk_analyzing');

    for (let i = 0; i < files.length; i++) {
      setBulkIndex(i);
      setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'analyzing' } : it));
      try {
        const result = await analyzeDocument(files[i], (_, label) => setStepLabel(label));
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'done', report: result } : it));
      } catch (err) {
        console.warn(`Bulk analysis failed for ${files[i].name}:`, err);
        setBulkItems(prev => prev.map((it, idx) => idx === i ? { ...it, status: 'error', error: err?.message || 'Eroare' } : it));
      }
    }
    setPhase('bulk_done');
  };

  const handleReset = () => {
    setPhase('idle');
    setReport(null);
    setError(null);
    setStep(0);
    setBulkItems([]);
    setBulkIndex(0);
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
        {phase === 'idle' && <SmartDocUploader onFile={handleFile} onFiles={handleFiles} />}

        {phase === 'analyzing' && (
          <SmartDocPipeline currentStep={step} currentLabel={stepLabel} />
        )}

        {phase === 'bulk_analyzing' && (
          <SmartDocBulkQueue items={bulkItems} currentIndex={bulkIndex} currentLabel={stepLabel} />
        )}

        {phase === 'bulk_done' && (
          <SmartDocBulkResults items={bulkItems} onReset={handleReset} />
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

        {/* Bulk feature hint — only on idle */}
        {phase === 'idle' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="rounded-2xl px-4 py-3 mt-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.08), rgba(37,99,235,0.05))', border: '1px solid rgba(6,182,212,0.20)' }}
          >
            <span className="text-2xl">🚀</span>
            <div>
              <p className="text-sm font-semibold text-white">Bulk upload disponibil</p>
              <p className="text-xs text-slate-400">
                Selectează mai multe fișiere odată — fiecare e analizat și primești un raport pe fiecare.
              </p>
            </div>
          </motion.div>
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