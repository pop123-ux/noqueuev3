/**
 * CaseStart — Guided intake wizard
 * The "operational layer" entry point: classify need → route online/in-person → save case
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Globe, MapPin, Clock, AlertTriangle,
  CheckCircle2, Loader2, ChevronRight, FileText, BookmarkPlus,
  X, Zap, Building2, Info, FileOutput, User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { classifyIntake } from '@/lib/data/intakeEngine';
import ReactMarkdown from 'react-markdown';
import { routeDocuments } from '@/lib/documents/documentRouter';
import { generateDocumentsForCase } from '@/lib/documents/documentGenerationService';
import GeneratedDocumentCard from '@/components/documents/GeneratedDocumentCard';
import ProfileCompletenessCard from '@/components/profile/ProfileCompletenessCard';
import PassportWorkspace from '@/components/passport/PassportWorkspace';

const QUICK_STARTS = [
  { label: 'Renew ID card', emoji: '🪪', query: 'I need to renew my ID card' },
  { label: 'Urgent passport', emoji: '✈️', query: 'I need an urgent passport' },
  { label: 'ANAF / SPV', emoji: '💼', query: 'I need an ANAF fiscal certificate' },
  { label: 'Driving license', emoji: '🚗', query: 'My driving license expired' },
  { label: 'Register company', emoji: '🏢', query: 'I want to register a company SRL in Cluj' },
  { label: 'Criminal record', emoji: '📋', query: 'I need a cazier judiciar' },
  { label: 'Health insurance', emoji: '🏥', query: 'I need to prove health insurance coverage' },
  { label: 'Divorce', emoji: '⚖️', query: 'I need to get divorced' },
];

function OnlineFirstBanner({ result, onSave }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-gradient-to-r from-success/10 to-accent/10 border border-success/30 p-5 mb-4"
    >
      <div className="flex items-start gap-3">
        <Globe className="w-5 h-5 text-success shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-bold text-success mb-1">✅ This can be done ONLINE — no queue needed</p>
          {result.online_tip && (
            <p className="text-xs text-slate-300 mb-3">{result.online_tip}</p>
          )}
          <div className="flex flex-wrap gap-2">
            {result.online_url && (
              <a
                href={result.online_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success/15 text-success text-xs font-semibold hover:bg-success/25 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                Open Official Portal
              </a>
            )}
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 text-slate-300 text-xs hover:bg-white/10 transition-colors"
            >
              <BookmarkPlus className="w-3.5 h-3.5" />
              Save case anyway
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ClassificationCard({ result, onSave, saving }) {
  const urgencyColors = { normal: 'text-slate-400', urgent: 'text-warning', critical: 'text-destructive' };
  const channelLabels = {
    online: '🌐 Online',
    appointment: '📅 Appointment',
    'walk-in': '🚶 Walk-in',
    concierge: '👑 Concierge',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-4"
    >
      {/* Online-first alert */}
      {result.can_do_online && <OnlineFirstBanner result={result} onSave={onSave} />}

      {/* Case summary */}
      <div className="glass-card rounded-2xl p-5 border border-white/10">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">Classified Case</span>
              <span className={`text-[10px] font-bold uppercase ${urgencyColors[result.urgency]}`}>
                {result.urgency}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white">{result.procedure_title}</h3>
            {result.institution_name && (
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {result.institution_name}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-semibold text-slate-400 mb-0.5">Channel</div>
            <div className="text-sm font-bold text-white">{channelLabels[result.channel] || result.channel}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              {Math.round((result.confidence || 0.8) * 100)}% confidence
            </div>
          </div>
        </div>

        {/* AI Reply */}
        <div className="prose prose-sm prose-invert max-w-none text-slate-300 leading-relaxed mb-4">
          <ReactMarkdown>{result.reply}</ReactMarkdown>
        </div>

        {/* Required documents */}
        {result.required_documents?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Required documents ({result.required_documents.length})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {result.required_documents.map(d => (
                <span key={d} className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {d}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Risks */}
        {result.risks?.length > 0 && (
          <div className="rounded-xl bg-warning/6 border border-warning/15 p-3 mb-4">
            <p className="text-xs font-semibold text-warning mb-1.5 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Watch out for
            </p>
            <ul className="space-y-0.5">
              {result.risks.map((r, i) => (
                <li key={i} className="text-xs text-slate-300">• {r}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Best time */}
        {result.best_time_hint && (
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Clock className="w-3.5 h-3.5 text-accent" />
            <span><strong className="text-white">Best time to visit:</strong> {result.best_time_hint}</span>
          </div>
        )}

        {/* Save case CTA */}
        {!result.can_do_online && (
          <Button
            onClick={onSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 rounded-xl h-11"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin mr-2" />Saving case...</>
            ) : (
              <><BookmarkPlus className="w-4 h-4 mr-2" />Save as active case</>
            )}
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export default function CaseStart() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [savedCaseId, setSavedCaseId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [generatingDocs, setGeneratingDocs] = useState(false);
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [showPassportWorkspace, setShowPassportWorkspace] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Load profile silently
  useEffect(() => {
    base44.auth.me().then(user => {
      if (!user?.email) return;
      base44.entities.UserPrivateProfile.filter({ user_id: user.email }, '-created_date', 1)
        .then(profiles => setProfile(profiles?.[0] || null))
        .catch(() => {});
    }).catch(() => {});
  }, []);

  const classify = async (query) => {
    const q = query || input.trim();
    if (!q) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setSavedCaseId(null);
    setInput(q);
    try {
      const res = await classifyIntake(q);
      setResult(res);
    } catch (err) {
      console.error('[CaseStart] classify failed:', err);
      setError('classify');
    } finally {
      setLoading(false);
    }
  };

  const saveCase = async () => {
    if (!result) return null;
    if (saving) return null; // guard against double-clicks
    setSaving(true);
    setError(null);
    try {
      // Attach user_id so /cases can scope by owner. Falls back to a stable
      // demo id when no auth is available — keeps hackathon flows working.
      let userId = 'anonymous_demo_user';
      try {
        const u = await base44.auth.me();
        if (u?.email) userId = u.email;
      } catch {}

      const newCase = await base44.entities.Case.create({
        user_id: userId,
        procedure_key: result.procedure_key || '',
        procedure_title: result.procedure_title || input,
        institution_key: result.institution_key || '',
        institution_name: result.institution_name || '',
        channel: result.channel || 'walk-in',
        status: 'open',
        urgency: result.urgency || 'normal',
        user_description: input,
        required_documents: result.required_documents || [],
        completed_documents: [],
        next_action: result.next_action || '',
        can_do_online: result.can_do_online || false,
        online_url: result.online_url || '',
        confidence: result.confidence || 0,
      });
      setSavedCaseId(newCase.id);
      return newCase;
    } catch (err) {
      console.error('[CaseStart] saveCase failed:', err);
      setError('save');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const isPassportCase = (text) => {
    const t = (text || '').toLowerCase();
    return t.includes('passport') || t.includes('pasaport') || t.includes('pasport');
  };

  const handleGenerateDocs = async () => {
    if (generatingDocs) return; // guard against double-clicks
    // Passport gets its own dedicated workspace
    if (isPassportCase(input) || isPassportCase(result?.procedure_key) || isPassportCase(result?.procedure_title)) {
      setShowPassportWorkspace(true);
      return;
    }
    setGeneratingDocs(true);
    setGeneratedDocs([]);
    setError(null);
    try {
      let caseId = savedCaseId;
      if (!caseId) {
        const cas = await saveCase();
        caseId = cas?.id;
      }
      const routerResult = await routeDocuments(input, result?.procedure_key, profile);
      if (routerResult.documents.length > 0) {
        const docs = await generateDocumentsForCase({
          routerResult,
          profile,
          caseId,
        });
        setGeneratedDocs(docs);
      }
    } catch (err) {
      console.error('[CaseStart] handleGenerateDocs failed:', err);
      setError('generate');
    } finally {
      setGeneratingDocs(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      {/* Header */}
      <div className="border-b border-white/5 px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-primary" />
          </div>
          <span className="text-sm font-bold text-white">NoQueue AI</span>
        </Link>
        <Link to="/cases" className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          My Cases <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">AI Case Router</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">What do you need to get done?</h1>
          <p className="text-slate-400 text-sm">Describe your civic need in plain language. I'll check if it can be done online first, then plan your case.</p>
        </motion.div>

        {/* Input */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); classify(); } }}
              placeholder="e.g. I need to renew my ID card after changing address..."
              className="w-full bg-white/[0.04] border border-white/10 rounded-2xl px-4 py-4 pr-16 text-white placeholder:text-slate-500 text-sm resize-none focus:outline-none focus:border-primary/50 transition-colors"
              rows={3}
            />
            <button
              onClick={() => classify()}
              disabled={loading || !input.trim()}
              className="absolute bottom-3 right-3 w-10 h-10 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 hover:bg-primary/90 transition-colors"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <ArrowRight className="w-4 h-4 text-white" />}
            </button>
          </div>
        </motion.div>

        {/* Quick starts */}
        {!result && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-xs text-slate-500 mb-3 text-center">Common procedures</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {QUICK_STARTS.map(q => (
                <button
                  key={q.label}
                  onClick={() => classify(q.query)}
                  className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/8 hover:bg-primary/10 hover:border-primary/30 transition-all text-center"
                >
                  <span className="text-xl">{q.emoji}</span>
                  <span className="text-xs text-slate-300 font-medium leading-tight">{q.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Loading state */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-3 py-10"
            >
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                </div>
              </div>
              <p className="text-slate-400 text-sm">Classifying your case…</p>
              <p className="text-slate-600 text-xs">Checking online alternatives first</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friendly error cards */}
        {error === 'classify' && (
          <div role="alert" aria-live="polite" className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 mb-4">
            <p className="text-sm text-white font-medium mb-1">We could not classify this request.</p>
            <p className="text-xs text-slate-400 mb-3">Try one of the quick starts or rephrase the request.</p>
            <button
              onClick={() => classify('I lost my ID')}
              className="text-xs px-3 py-1.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              Use demo: I lost my ID
            </button>
          </div>
        )}
        {error === 'save' && (
          <div role="alert" aria-live="polite" className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 mb-4 text-sm text-white">
            We couldn't save this case. Please try again in a moment.
          </div>
        )}
        {error === 'generate' && (
          <div role="alert" aria-live="polite" className="rounded-2xl bg-warning/10 border border-warning/30 p-4 mb-4 text-sm text-white">
            Document generation failed, but your case is saved. You can still use the checklist.
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <ClassificationCard result={result} onSave={saveCase} saving={saving} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Case saved confirmation + Generate CTA */}
        <AnimatePresence>
          {savedCaseId && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
              <div className="rounded-2xl bg-success/10 border border-success/30 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  <span className="text-sm text-white font-medium">Case saved successfully</span>
                </div>
                <Link to="/cases" className="flex items-center gap-1 text-xs text-success hover:text-success/80 transition-colors">
                  View cases <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {generatedDocs.length === 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={handleGenerateDocs}
                    disabled={generatingDocs}
                    aria-busy={generatingDocs}
                    aria-label="Generate preparation documents for this case"
                    className="bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-xl h-11"
                  >
                    {generatingDocs ? (
                      <><Loader2 className="w-4 h-4 animate-spin mr-2" />Generating…</>
                    ) : (
                      <><FileOutput className="w-4 h-4 mr-2" />Generate preparation documents</>
                    )}
                  </Button>
                  <Link to="/cases" aria-label="Open My Cases">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl h-11 border-white/10 bg-white/[0.03] hover:bg-white/[0.06] text-white"
                    >
                      <FileText className="w-4 h-4 mr-2" />Open My Cases
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generated documents */}
        <AnimatePresence>
          {generatedDocs.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6 space-y-3">
              <div className="mb-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent" />
                    Preparation documents generated ({generatedDocs.length})
                  </h3>
                  <Link to="/cases" className="text-xs text-primary hover:text-primary/80">
                    View in My Cases →
                  </Link>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  NoQueue does not create fake official forms. These PDFs are preparation sheets/checklists unless an official downloadable template is available.
                </p>
              </div>
              {generatedDocs.map(doc => (
                <GeneratedDocumentCard key={doc.id} doc={doc} currentProfile={profile} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Passport Workspace */}
        <AnimatePresence>
          {showPassportWorkspace && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <PassportWorkspace profile={profile} caseData={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile completeness hint if missing */}
        {result && !profile?.first_name && !showPassportWorkspace && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4">
            <ProfileCompletenessCard profile={profile} compact />
          </motion.div>
        )}
      </div>
    </div>
  );
}