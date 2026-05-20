import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock, Building2, AlertTriangle, Globe, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import workflows from '@/lib/data/workflows';

const urgencyColors = {
  low: 'bg-success/10 text-success border-success/20',
  medium: 'bg-warning/10 text-warning border-warning/20',
  high: 'bg-destructive/10 text-destructive border-destructive/20',
  critical: 'bg-destructive/20 text-destructive border-destructive/30',
};

function WorkflowCard({ wf, onSelect }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      layout
      className="glass-card rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="outline" className={`text-xs ${urgencyColors[wf.urgency]} border`}>
                {wf.urgency}
              </Badge>
              {wf.online && (
                <Badge variant="outline" className="text-xs bg-accent/10 text-accent border-accent/20">
                  <Globe className="w-3 h-3 mr-1" /> Online
                </Badge>
              )}
            </div>
            <h3 className="text-base font-semibold text-white">{wf.title}</h3>
            <p className="text-sm text-slate-400 mt-1 line-clamp-2">{wf.description}</p>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1 text-sm text-slate-300">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>{wf.queue} min</span>
            </div>
            {expanded ? <ChevronUp className="w-4 h-4 text-slate-500 mt-2" /> : <ChevronDown className="w-4 h-4 text-slate-500 mt-2" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300 mb-1.5">
                    <FileText className="w-3.5 h-3.5 text-primary" /> Required Documents
                  </div>
                  <ul className="space-y-1">
                    {wf.documents.map((doc, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-accent" />
                  <span>{wf.institution}</span>
                </div>

                <div className="flex items-start gap-1.5 text-xs">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0 mt-0.5" />
                  <span className="text-warning">{wf.commonMistake}</span>
                </div>

                <div className="text-xs text-slate-400">
                  <span className="text-slate-300">Processing: </span>{wf.processingTime}
                </div>
                <div className="text-xs text-slate-400">
                  <span className="text-slate-300">Best time: </span>{wf.bestTime}
                </div>

                <button
                  onClick={(e) => { e.stopPropagation(); onSelect(wf); }}
                  className="mt-2 w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                >
                  Use this workflow →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function WorkflowCards({ onSelectWorkflow }) {
  const [search, setSearch] = useState('');

  const filtered = workflows.filter(wf => {
    const q = search.toLowerCase();
    return wf.title.toLowerCase().includes(q) ||
      wf.description.toLowerCase().includes(q) ||
      wf.keywords.some(kw => kw.includes(q));
  });

  return (
    <section id="workflows" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Procedures</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Supported Workflows</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            {workflows.length} realistic Romanian bureaucracy procedures, fully mapped with documents, institutions, and common mistakes.
          </p>
        </motion.div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search workflows... (e.g. passport, ID, taxes)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-navy-700 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-11"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(wf => (
            <WorkflowCard key={wf.id} wf={wf} onSelect={onSelectWorkflow} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-500 mt-8">No workflows match your search.</p>
        )}
      </div>
    </section>
  );
}