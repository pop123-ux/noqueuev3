import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, Globe, Users, Award, AlertCircle, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { clujInstitutions, getQueueStatus } from '@/lib/data/clujInstitutions';
import CopyablePhoneNumber from '@/components/ui/CopyablePhoneNumber';

const crowdConfig = {
  low:    { bg: 'bg-success/10',     text: 'text-success',     label: 'Short wait' },
  medium: { bg: 'bg-warning/10',     text: 'text-warning',     label: 'Moderate wait' },
  high:   { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Long wait' },
};

const categories = ['All', ...new Set(clujInstitutions.map(i => i.categoryLabel))];

function InstitutionCard({ inst, isBest, onViewMap }) {
  const [expanded, setExpanded] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const crowd = crowdConfig[inst.crowd];
  const status = getQueueStatus(inst.queue);

  function handleViewMap(e) {
    e.stopPropagation();
    onViewMap?.(inst);
    setTimeout(() => {
      document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  function handleGoogleMaps(e) {
    e.stopPropagation();
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inst.address)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-card rounded-2xl overflow-hidden hover:border-white/10 transition-all cursor-pointer ${isBest ? 'glow-green' : ''}`}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="p-5">
        {isBest && (
          <div className="flex items-center gap-1 mb-2">
            <Award className="w-3.5 h-3.5 text-success" />
            <span className="text-[10px] font-semibold text-success uppercase tracking-wider">Best Now</span>
          </div>
        )}

        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: inst.color }} />
              <span className="text-[10px] text-slate-500 font-medium">{inst.categoryLabel}</span>
            </div>
            <h3 className="text-sm font-semibold text-white leading-snug">{inst.name}</h3>
          </div>
          <div className="text-right shrink-0">
            <div className="text-sm font-bold" style={{ color: status.color }}>~{inst.queue.current}m</div>
            <div className="text-[10px] text-slate-500">{status.label}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{inst.address}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px]">
          {inst.onlineServices && (
            <span className="flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded-full">
              <Globe className="w-3 h-3" /> Online
            </span>
          )}
          {inst.appointmentRequired && (
            <span className="flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" /> Appt needed
            </span>
          )}
          <span className={`flex items-center gap-1 ${crowd.text} ${crowd.bg} px-2 py-0.5 rounded-full`}>
            <Users className="w-3 h-3" /> {crowd.label}
          </span>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>{inst.hours.weekdays}</span>
              {inst.hours.saturday !== 'Closed' && (
                <span className="text-slate-600">· Sat {inst.hours.saturday}</span>
              )}
            </div>
            <CopyablePhoneNumber phone={inst.phone} />
            <div className="flex flex-wrap gap-1">
              {inst.services.slice(0, 4).map(s => (
                <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{s}</span>
              ))}
            </div>

            {/* More details toggle */}
            {inst.description && (
              <div>
                <button
                  onClick={e => { e.stopPropagation(); setShowMore(!showMore); }}
                  className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80 transition-colors"
                >
                  {showMore ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showMore ? 'Less info' : 'More about this institution'}
                </button>
                <AnimatePresence>
                  {showMore && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-2 space-y-2.5 pt-2 border-t border-white/5">
                        <p className="text-[10px] text-slate-400 leading-relaxed">{inst.description}</p>
                        {inst.whatYouCanDo && (
                          <div>
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">What you can do here</p>
                            <ul className="space-y-1">
                              {inst.whatYouCanDo.map(item => (
                                <li key={item} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                                  <CheckCircle2 className="w-3 h-3 text-success shrink-0 mt-0.5" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="rounded-xl px-3 py-2 text-[10px] text-warning" style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
              ⚠️ {inst.commonMistake}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleViewMap}
                className="py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 active:scale-95 transition-all"
              >
                View on map →
              </button>
              <button
                onClick={handleGoogleMaps}
                aria-label="Open institution location in Google Maps"
                title="Open external navigation"
                className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 active:scale-95 transition-all"
              >
                <ExternalLink className="w-3 h-3" />
                Google Maps
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function InstitutionFinder({ onSelectInstitution }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const bestNow = [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current)[0];

  const filtered = clujInstitutions.filter(inst => {
    const q = search.toLowerCase();
    const matchSearch = search === '' ||
      inst.name.toLowerCase().includes(q) ||
      inst.services.some(s => s.toLowerCase().includes(q)) ||
      inst.district?.toLowerCase().includes(q) ||
      inst.categoryLabel?.toLowerCase().includes(q);
    const matchCategory = category === 'All' || inst.categoryLabel === category;
    return matchSearch && matchCategory;
  });

  return (
    <section id="institutions" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-success">Find your office</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Institution Finder</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            {clujInstitutions.length} Cluj-Napoca institutions with queue intelligence.
          </p>
        </motion.div>

        <div className="relative max-w-md mx-auto mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search by name, service, district..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 bg-navy-700 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-11"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                category === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(inst => (
            <InstitutionCard
              key={inst.id}
              inst={inst}
              isBest={inst.id === bestNow?.id}
              onViewMap={onSelectInstitution}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-slate-500 mt-8">No institutions match your search.</p>
        )}
      </div>
    </section>
  );
}