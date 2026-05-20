import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Clock, Phone, Globe, Users, Award } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import institutions from '@/lib/data/institutions';

const crowdColors = {
  low: { bg: 'bg-success/10', text: 'text-success', border: 'border-success/20', label: 'Low crowd' },
  medium: { bg: 'bg-warning/10', text: 'text-warning', border: 'border-warning/20', label: 'Medium crowd' },
  high: { bg: 'bg-destructive/10', text: 'text-destructive', border: 'border-destructive/20', label: 'High crowd' },
};

const categories = ['All', ...new Set(institutions.map(i => i.category))];

export default function InstitutionFinder({ onSelectInstitution }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const bestNow = institutions.reduce((best, inst) =>
    inst.queue < (best?.queue ?? Infinity) ? inst : best, null
  );

  const filtered = institutions.filter(inst => {
    const matchSearch = inst.name.toLowerCase().includes(search.toLowerCase()) ||
      inst.services.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === 'All' || inst.category === category;
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
            {institutions.length} Cluj-Napoca institutions with real-time queue estimates and crowd levels.
          </p>
        </motion.div>

        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search institutions or services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-navy-700 border-white/10 text-white placeholder:text-slate-500 rounded-xl h-11"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                category === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inst) => {
            const crowd = crowdColors[inst.crowd];
            const isBest = inst.id === bestNow?.id;
            return (
              <motion.div
                key={inst.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                onClick={() => onSelectInstitution?.(inst)}
                className={`glass-card rounded-2xl p-5 hover:border-white/10 transition-all cursor-pointer relative ${isBest ? 'glow-green' : ''}`}
              >
                {isBest && (
                  <div className="absolute -top-2 right-4">
                    <Badge className="bg-success text-white text-[10px] font-semibold gap-1">
                      <Award className="w-3 h-3" /> Best Now
                    </Badge>
                  </div>
                )}

                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-tight">{inst.name}</h3>
                    <span className="text-xs text-slate-500">{inst.category}</span>
                  </div>
                  <Badge variant="outline" className={`${crowd.bg} ${crowd.text} ${crowd.border} border text-[10px] shrink-0`}>
                    <Users className="w-3 h-3 mr-1" />{crowd.label}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span>{inst.address}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-accent" />
                    <span>Queue: ~{inst.queue} min • Best: {inst.bestTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>{inst.phone}</span>
                  </div>
                  {inst.online && (
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-success" />
                      <span className="text-success">Online services available</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t border-white/5">
                  {inst.services.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}