/**
 * ProcedureDocumentResults
 * Shows generated document cards after a procedure is routed.
 * Document-first output: no prose, just cards.
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2, FileText, CheckCircle2, AlertTriangle, Link as LinkIcon,
  RefreshCw, ArrowRight, UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import GeneratedDocumentCard from './GeneratedDocumentCard';
import { generateDocumentsForCase } from '@/lib/documents/documentGenerationService';
import { routeDocuments } from '@/lib/documents/documentRouter';
import { REQUIRED_FIELDS_LABELS } from '@/lib/documents/profileFieldMap';

export default function ProcedureDocumentResults({ query, profile, onDocumentsGenerated }) {
  const [phase, setPhase] = useState('idle'); // idle | routing | generating | done | error
  const [routerResult, setRouterResult] = useState(null);
  const [generatedDocs, setGeneratedDocs] = useState([]);
  const [error, setError] = useState(null);

  const run = async () => {
    if (!query?.trim()) return;
    setPhase('routing');
    setError(null);
    setGeneratedDocs([]);
    setRouterResult(null);

    const result = await routeDocuments(query, null, profile);
    setRouterResult(result);

    if (result.documents.length === 0) {
      setPhase('done');
      return;
    }

    setPhase('generating');
    const docs = await generateDocumentsForCase({
      routerResult: result,
      profile,
      caseId: '',
    });
    setGeneratedDocs(docs);
    setPhase('done');
    onDocumentsGenerated?.(docs);
  };

  // Auto-run when query changes
  useEffect(() => {
    if (query?.trim()) run();
  }, [query]);

  if (phase === 'idle') return null;

  const allMissingFields = routerResult?.documents
    ?.flatMap(d => d.missing_profile_fields || [])
    .filter((v, i, a) => a.indexOf(v) === i) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4 mt-6"
    >
      {/* Routing / generating states */}
      {(phase === 'routing' || phase === 'generating') && (
        <div className="flex flex-col items-center gap-3 py-8">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
          <p className="text-slate-300 text-sm">
            {phase === 'routing' ? 'Identifying required documents…' : 'Generating your documents…'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Results */}
      {phase === 'done' && routerResult && (
        <>
          {/* Summary header */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h3 className="text-sm font-bold text-white">
                {generatedDocs.length} Document{generatedDocs.length !== 1 ? 's' : ''} Generated
              </h3>
              {routerResult.documents.length > 0 && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {routerResult.ready_count} ready · {routerResult.missing_data_count} need profile data
                </p>
              )}
            </div>
            {routerResult.documents.length === 0 && (
              <p className="text-slate-400 text-sm">No matching documents found for this request.</p>
            )}
          </div>

          {/* Missing profile fields warning */}
          {allMissingFields.length > 0 && (
            <div className="rounded-2xl bg-warning/8 border border-warning/20 p-4 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-warning mb-1">Profile data missing</p>
                <p className="text-[11px] text-slate-400 mb-2">
                  Complete your profile to auto-fill these fields:
                  {' '}{allMissingFields.map(f => REQUIRED_FIELDS_LABELS[f] || f).join(', ')}
                </p>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-1.5 text-[11px] text-warning font-semibold hover:text-warning/80 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" /> Complete Profile →
                </Link>
              </div>
            </div>
          )}

          {/* Document cards */}
          <div className="space-y-3">
            <AnimatePresence>
              {generatedDocs.map(doc => (
                <GeneratedDocumentCard
                  key={doc.id}
                  doc={doc}
                  currentProfile={profile}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}
    </motion.div>
  );
}