import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Globe, Users, Award, AlertCircle, ExternalLink } from 'lucide-react';

function openInGoogleMaps(address) {
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { clujInstitutions, getQueueStatus } from '@/lib/data/clujInstitutions';
import CopyablePhoneNumber from '@/components/ui/CopyablePhoneNumber';

const crowdConfig = {
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', label: 'Short wait' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', label: 'Moderate wait' },
  high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20', label: 'Long wait' },
};

const categories = ['All', ...new Set(clujInstitutions.map(i => i.categoryLabel))];

function InstitutionCard({ inst, isBest, onClick }) {
  const [expanded, setExpanded] = useState(false);
  const crowd = crowdConfig[inst.crowd];
  const status = getQueueStatus(inst.queue);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`glass-card rounded-2xl overflow-hidden hover:border-white/10 transition-all ${isBest ? 'glow-green' : ''} cursor-pointer`}
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
            <div className={`text-sm font-bold`} style={{ color: status.color }}>
              ~{inst.queue.current}m
            </div>
            <div className="text-[10px] text-slate-500">{status.label}</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{inst.address}</span>
        </div>

        <div className="flex items-center gap-2 text-[10px]">
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
            <div className="rounded-xl bg-warning/8 border border-warning/15 px-3 py-2 text-[10px] text-warning">
              ⚠️ {inst.commonMistake}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); openInGoogleMaps(inst.address); }}
              aria-label="Open institution location in Google Maps"
              title="Open external navigation"
              className="w-full py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 active:scale-95 transition-all flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Google Maps
            </button>
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
    const matchSearch = search === '' ||
      inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.services.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
      inst.district?.toLowerCase().includes(search.toLowerCase());
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
            placeholder="Search by name, service, or district..."
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
              onClick={onSelectInstitution}
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