import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Loader2, Plus, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import GeneratedDocumentCard from './GeneratedDocumentCard';
import { generateDocument } from '@/lib/documents/documentGenerationService';
import { getTemplate } from '@/lib/documents/templateRegistry';

export default function GeneratedDocumentsPanel({ caseId, procedureKey, currentProfile }) {
  const [generating, setGenerating] = useState(false);
  const queryClient = useQueryClient();

  const { data: docs = [], isLoading } = useQuery({
    queryKey: ['generated-docs', caseId],
    queryFn: () => base44.entities.GeneratedDocument.filter({ case_id: caseId }, '-created_date', 20),
    enabled: !!caseId,
  });

  const handleRegenerate = async (doc) => {
    setGenerating(true);
    const template = getTemplate(doc.document_key);
    if (!template) { setGenerating(false); return; }

    // Delete old doc
    await base44.entities.GeneratedDocument.delete(doc.id);

    const docResult = {
      template,
      status: 'ready',
      missing_assets: [],
      special_instruction_labels: [],
    };

    await generateDocument({
      docResult,
      profile: currentProfile,
      caseId,
      procedureKey,
    });

    queryClient.invalidateQueries({ queryKey: ['generated-docs', caseId] });
    setGenerating(false);
  };

  const readyCount = docs.filter(d => d.status === 'ready').length;
  const reviewCount = docs.filter(d => d.status === 'needs_review' || d.status === 'missing_profile_data').length;
  const driveCount = docs.filter(d => d.drive_upload_status === 'uploaded').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 text-center">
        <FileText className="w-6 h-6 text-slate-600 mx-auto mb-2" />
        <p className="text-xs text-slate-500 mb-3">No documents generated yet</p>
        <Link to="/start" className="text-xs text-primary hover:text-primary/80 flex items-center justify-center gap-1">
          <Plus className="w-3 h-3" /> Generate from case
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Stats row */}
      <div className="flex items-center gap-3 flex-wrap">
        {readyCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-success bg-success/10 px-2 py-1 rounded-full">
            <CheckCircle2 className="w-3 h-3" /> {readyCount} ready
          </span>
        )}
        {reviewCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-warning bg-warning/10 px-2 py-1 rounded-full">
            <AlertTriangle className="w-3 h-3" /> {reviewCount} needs attention
          </span>
        )}
        {driveCount > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">
            ☁ {driveCount} in Drive
          </span>
        )}
        {generating && (
          <span className="flex items-center gap-1 text-[11px] text-slate-400">
            <Loader2 className="w-3 h-3 animate-spin" /> Regenerating…
          </span>
        )}
      </div>

      <AnimatePresence>
        {docs.map(doc => (
          <GeneratedDocumentCard
            key={doc.id}
            doc={doc}
            currentProfile={currentProfile}
            onRegenerate={handleRegenerate}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}