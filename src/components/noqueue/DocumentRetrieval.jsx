import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { templateRegistry } from '@/lib/documents/templateRegistry';

const allTemplates = Object.values(templateRegistry);

export default function DocumentRetrieval() {
  const [search, setSearch] = useState('');

  const filtered = search.trim()
    ? allTemplates.filter(t =>
        t.title?.toLowerCase().includes(search.toLowerCase()) ||
        t.titleRo?.toLowerCase().includes(search.toLowerCase()) ||
        t.institution?.toLowerCase().includes(search.toLowerCase())
      )
    : allTemplates.slice(0, 6);

  return (
    <section id="documents" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-accent">Document Hub</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Document & Procedure Guide</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Search {allTemplates.length}+ official procedures. Get auto-filled preparation sheets from your Identity Vault.
          </p>
        </motion.div>

        <div className="relative max-w-md mx-auto mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search procedures, e.g. pașaport, cazier, buletin..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-navy-700 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-11"
          />
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((template, i) => (
            <motion.div
              key={template.id || i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="glass-card rounded-2xl p-5 hover:border-white/10 transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-accent/10 shrink-0">
                  <FileText className="w-4 h-4 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-white leading-snug mb-0.5">
                    {template.titleRo || template.title}
                  </h3>
                  {template.institution && (
                    <p className="text-[11px] text-slate-500 truncate">{template.institution}</p>
                  )}
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {template.needsNotary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-warning/10 text-warning">Notariat</span>
                    )}
                    {template.needsAppointment && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary">Programare</span>
                    )}
                    {template.needsPhysicalPresence && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">Prezență fizică</span>
                    )}
                    {!template.needsNotary && !template.needsAppointment && !template.needsPhysicalPresence && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/10 text-success">Standard</span>
                    )}
                  </div>
                </div>
              </div>
              {template.instructionsShort && (
                <p className="mt-3 text-[11px] text-slate-400 leading-relaxed line-clamp-2">
                  {template.instructionsShort}
                </p>
              )}
              {template.onlineUrl && (
                <a
                  href={template.onlineUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={e => e.stopPropagation()}
                  className="mt-3 flex items-center gap-1 text-[11px] text-primary hover:text-primary/80 transition-colors"
                >
                  <BookOpen className="w-3 h-3" /> Online disponibil <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-500 mt-8">No procedures match your search.</p>
        )}
      </div>
    </section>
  );
}