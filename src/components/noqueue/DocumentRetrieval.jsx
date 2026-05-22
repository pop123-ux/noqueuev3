import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileSearch, Sparkles, Scale, X, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import DocumentCard from './documents/DocumentCard';
import DivorceWizard from './documents/DivorceWizard';
import { civicDocuments, retrieveDocuments } from '@/lib/data/civicDocuments';

const CATEGORIES = [
  { id: 'all', label: 'All Documents', emoji: '📂' },
  { id: 'id-renewal', label: 'ID Renewal', emoji: '🪪' },
  { id: 'lost-id', label: 'Lost ID', emoji: '🔍' },
  { id: 'passport', label: 'Passport', emoji: '✈️' },
  { id: 'driver-license', label: 'Driving License', emoji: '🚗' },
  { id: 'vehicle-registration', label: 'Vehicle', emoji: '🚘' },
  { id: 'anaf', label: 'ANAF / Tax', emoji: '💼' },
  { id: 'health-insurance', label: 'Health Insurance', emoji: '🏥' },
  { id: 'business-registration', label: 'Business', emoji: '🏢' },
  { id: 'residence-permit', label: 'Residence', emoji: '🏠' },
  { id: 'student', label: 'Student', emoji: '🎓' },
  { id: 'divorce-notary', label: 'Divorce', emoji: '⚖️' },
  { id: 'police', label: 'Police / Cazier', emoji: '🔒' },
  { id: 'civil-status', label: 'Civil Status', emoji: '📜' },
];

const EXAMPLE_SEARCHES = [
  "I lost my ID card",
  "I need divorce papers",
  "passport for my child",
  "register a company in Cluj",
  "ANAF fiscal certificate",
  "driving license renewal",
  "health insurance student",
  "residence permit foreigner",
];

const divorceCategories = ['divorce-notary', 'divorce-civil', 'divorce-court'];

export default function DocumentRetrieval({ initialWorkflowId = null }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(initialWorkflowId || 'all');
  const [showDivorceWizard, setShowDivorceWizard] = useState(false);

  const isDivorceCategory = divorceCategories.includes(activeCategory) || activeCategory === 'divorce-notary';

  const displayed = useMemo(() => {
    if (search.trim().length > 2) {
      return retrieveDocuments(search);
    }
    if (activeCategory === 'all') return civicDocuments;
    // Show all divorce types together
    if (divorceCategories.includes(activeCategory)) {
      return civicDocuments.filter(d => divorceCategories.includes(d.category));
    }
    return civicDocuments.filter(d => d.category === activeCategory);
  }, [search, activeCategory]);

  const handleSearch = (val) => {
    setSearch(val);
    if (val.trim().length > 2) setActiveCategory('all');
  };

  return (
    <section id="documents" className="py-20 sm:py-28">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <FileSearch className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-medium text-primary">Civic Document Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Document Retrieval</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Every official form for Cluj-Napoca bureaucracy — explained, downloadable, and guided by AI. No Google needed.
          </p>
        </motion.div>

        {/* Search bar */}
        <div className="relative max-w-2xl mx-auto mb-5">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Sparkles className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
          <Input
            value={search}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Search naturally: 'I lost my ID', 'divorce papers', 'register company'..."
            className="pl-11 pr-11 h-12 bg-white/[0.04] border-white/10 text-white placeholder:text-slate-500 rounded-2xl text-sm"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Example searches */}
        {!search && (
          <div className="flex flex-wrap gap-2 justify-center mb-7">
            {EXAMPLE_SEARCHES.map(ex => (
              <button
                key={ex}
                onClick={() => handleSearch(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/8 text-slate-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearch(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full border transition-all ${
                activeCategory === cat.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/[0.03] text-slate-400 border-white/8 hover:border-white/20 hover:text-white'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Divorce wizard */}
        <AnimatePresence>
          {(divorceCategories.includes(activeCategory) || search.toLowerCase().includes('divort') || search.toLowerCase().includes('divorce')) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              {!showDivorceWizard ? (
                <button
                  onClick={() => setShowDivorceWizard(true)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Scale className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-semibold text-white">Not sure which divorce route applies to you?</p>
                      <p className="text-xs text-slate-400 mt-0.5">Answer 3 questions — AI classifies your case automatically</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-primary shrink-0" />
                </button>
              ) : (
                <DivorceWizard onClose={() => setShowDivorceWizard(false)} />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-slate-500">
            {search.trim().length > 2
              ? `${displayed.length} document${displayed.length !== 1 ? 's' : ''} matching "${search}"`
              : `${displayed.length} document${displayed.length !== 1 ? 's' : ''}`
            }
          </p>
          {search.trim().length > 2 && (
            <button onClick={() => setSearch('')} className="text-xs text-primary hover:text-primary/80 transition-colors">
              Clear search
            </button>
          )}
        </div>

        {/* Document grid */}
        <div className="space-y-3">
          <AnimatePresence>
            {displayed.map(doc => (
              <DocumentCard key={doc.id} doc={doc} />
            ))}
          </AnimatePresence>
        </div>

        {displayed.length === 0 && (
          <div className="text-center py-10">
            <FileSearch className="w-8 h-8 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No documents found for "{search}"</p>
            <button onClick={() => { setSearch(''); setActiveCategory('all'); }} className="mt-2 text-xs text-primary">
              Show all documents
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <p className="mt-8 text-[10px] text-slate-600 text-center leading-relaxed">
          ⚖️ All documents are for informational purposes only. Official forms may change. Always verify final requirements with the issuing institution before submitting. NoQueue AI provides civic guidance, not legal advice.
        </p>
      </div>
    </section>
  );
}