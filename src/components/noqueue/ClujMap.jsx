import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Users, Globe, Phone, X, Navigation,
  ChevronRight, Star, AlertCircle, Locate, Radio,
  ExternalLink, FileText, Play
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { clujInstitutions, getQueueStatus, getHourlyPattern } from '@/lib/data/clujInstitutions';

const CLUJ_BOUNDS = {
  latMin: 46.747, latMax: 46.793,
  lngMin: 23.570, lngMax: 23.630,
};

function toPercent(lat, lng) {
  const x = ((lng - CLUJ_BOUNDS.lngMin) / (CLUJ_BOUNDS.lngMax - CLUJ_BOUNDS.lngMin)) * 100;
  const y = ((CLUJ_BOUNDS.latMax - lat) / (CLUJ_BOUNDS.latMax - CLUJ_BOUNDS.latMin)) * 100;
  return { x: Math.min(96, Math.max(2, x)), y: Math.min(96, Math.max(2, y)) };
}

function QueueBadge({ minutes, size = 'sm' }) {
  const color = minutes <= 20 ? '#22c55e' : minutes <= 40 ? '#facc15' : '#ef4444';
  const label = minutes <= 20 ? 'Short wait' : minutes <= 40 ? 'Moderate' : 'Long wait';
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold" style={{ color }}>
      <Clock className="w-3 h-3" />
      ~{minutes}m · {label}
    </span>
  );
}

function HourlyChart({ data }) {
  const max = Math.max(...data);
  const hours = ['08', '09', '10', '11', '12', '13', '14', '15', '16'];
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((val, i) => {
        const h = `${Math.round((val / max) * 100)}%`;
        const color = val > 70 ? '#ef4444' : val > 45 ? '#facc15' : '#22c55e';
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
            <div className="w-full rounded-sm" style={{ height: h, backgroundColor: color, minHeight: '2px' }} />
            <span className="text-[8px] text-slate-600">{hours[i]}</span>
          </div>
        );
      })}
    </div>
  );
}

function InstitutionPanel({ inst, onClose }) {
  const status = getQueueStatus(inst.queue);
  const pattern = getHourlyPattern(inst.id);
  const now = new Date();
  const hour = now.getHours();
  const isOpen = hour >= 8 && hour < 16;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      className="absolute right-3 top-3 bottom-3 w-72 glass rounded-2xl border border-white/10 flex flex-col z-30 overflow-hidden shadow-2xl"
    >
      <div className="px-4 py-3 border-b border-white/5 flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div
            className="w-2 h-2 rounded-full inline-block mr-1.5 mb-0.5"
            style={{ backgroundColor: inst.color }}
          />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{inst.categoryLabel}</span>
          <h3 className="text-sm font-bold text-white leading-tight mt-0.5">{inst.name}</h3>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            <span className="text-xs text-slate-300">{isOpen ? 'Open now' : 'Closed'}</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold" style={{ color: status.color }}>
            <Users className="w-3 h-3" />
            {status.label}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Community queue estimate</span>
            <span className="text-sm font-bold text-white">~{inst.queue.current} min</span>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: status.color }}
              initial={{ width: 0 }}
              animate={{ width: `${Math.round((inst.queue.current / 120) * 100)}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>Best: {inst.queue.min}m</span>
            <span>Worst: {inst.queue.max}m</span>
          </div>
        </div>

        <div>
          <p className="text-xs text-slate-400 mb-1.5">Typical crowd pattern</p>
          <HourlyChart data={pattern} />
        </div>

        <div className="space-y-2 text-xs text-slate-400">
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <span>{inst.address}</span>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
            <div>
              <div>Weekdays: {inst.hours.weekdays}</div>
              {inst.hours.saturday !== 'Closed' && <div>Saturday: {inst.hours.saturday}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-500" />
            <span>{inst.phone}</span>
          </div>
          {inst.onlineServices && (
            <div className="flex items-center gap-2 text-success">
              <Globe className="w-3.5 h-3.5" />
              <span>Online services available</span>
            </div>
          )}
          {inst.appointmentRequired && (
            <div className="flex items-center gap-2 text-warning">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Appointment required</span>
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1.5">Services</p>
          <div className="flex flex-wrap gap-1">
            {inst.services.map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{s}</span>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-primary/8 border border-primary/20 p-3">
          <p className="text-[10px] font-semibold text-primary mb-1">💡 Best Time to Visit</p>
          <p className="text-[10px] text-slate-300 leading-relaxed">{inst.tips}</p>
        </div>

        <div className="rounded-xl bg-warning/8 border border-warning/20 p-3">
          <p className="text-[10px] font-semibold text-warning mb-1">⚠️ Common Mistake</p>
          <p className="text-[10px] text-slate-300 leading-relaxed">{inst.commonMistake}</p>
        </div>

        {/* Source note */}
        <div className="flex items-center gap-1.5 text-[9px] text-slate-600">
          <Radio className="w-3 h-3" />
          <span>Queue data from community reports · Last updated just now</span>
        </div>
      </div>

      <div className="p-3 border-t border-white/5 grid grid-cols-2 gap-2">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(inst.address + ', Cluj-Napoca')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Directions
        </a>
        <a
          href={`https://${inst.website}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Official site
        </a>
        <a
          href="#documents"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          Documents
        </a>
        <a
          href="#chat"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent/10 text-accent text-xs font-medium hover:bg-accent/20 transition-colors"
        >
          <Play className="w-3.5 h-3.5" />
          Ask AI
        </a>
      </div>
    </motion.div>
  );
}

const CATEGORY_COLORS = {
  identity: '#2563eb',
  passport: '#7c3aed',
  vehicles: '#f97316',
  taxes: '#facc15',
  'city-hall': '#06b6d4',
  health: '#22c55e',
  immigration: '#6366f1',
  'civil-status': '#ec4899',
  'local-taxes': '#22c55e',
  police: '#ef4444',
  business: '#14b8a6',
};

const categoryLabels = {
  all: 'All',
  identity: 'Identity',
  passport: 'Passport',
  vehicles: 'Vehicles',
  taxes: 'Tax',
  'city-hall': 'City Hall',
  health: 'Health',
  immigration: 'Immigration',
  'civil-status': 'Civil',
  'local-taxes': 'Local Tax',
  police: 'Police',
  business: 'Business',
};

export default function ClujMap({ selectedInstitution: externalSelected, onSelectInstitution }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHoveredId] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (externalSelected) setSelected(externalSelected);
  }, [externalSelected]);

  const categories = ['all', ...new Set(clujInstitutions.map(i => i.category))];
  const filtered = filter === 'all' ? clujInstitutions : clujInstitutions.filter(i => i.category === filter);

  const handleSelect = (inst) => {
    setSelected(selected?.id === inst.id ? null : inst);
    onSelectInstitution?.(inst);
  };

  return (
    <section id="map" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Location Intelligence</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Find the Right Institution Near You</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Nearby civic institutions with real-time community queue reports and official details.
          </p>
          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] text-slate-500">
            <Radio className="w-3 h-3 text-success animate-pulse" />
            <span>Queue data from community reports · Cluj-Napoca</span>
          </div>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 justify-center mb-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                filter === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {categoryLabels[cat] || cat}
            </button>
          ))}
        </div>

        {/* Map container */}
        <div className="relative">
          <div
            className="relative rounded-3xl overflow-hidden border border-white/8"
            style={{ paddingBottom: '52%' }}
          >
            {/* Colorful satellite-style map background */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  radial-gradient(ellipse at 30% 40%, rgba(15, 60, 120, 0.8) 0%, transparent 50%),
                  radial-gradient(ellipse at 70% 60%, rgba(10, 40, 90, 0.7) 0%, transparent 50%),
                  radial-gradient(ellipse at 50% 50%, rgba(5, 30, 70, 0.9) 0%, transparent 70%),
                  linear-gradient(160deg, #0a1628 0%, #0d2040 30%, #071526 60%, #0a1a30 100%)
                `
              }}
            />

            {/* Terrain-like color blobs */}
            <div className="absolute inset-0 overflow-hidden">
              {/* Green areas (parks/nature) */}
              <div className="absolute rounded-full opacity-25" style={{ left: '15%', top: '55%', width: '12%', height: '18%', background: 'radial-gradient(#166534, transparent)' }} />
              <div className="absolute rounded-full opacity-20" style={{ left: '75%', top: '65%', width: '10%', height: '14%', background: 'radial-gradient(#15803d, transparent)' }} />
              <div className="absolute rounded-full opacity-15" style={{ left: '85%', top: '20%', width: '8%', height: '12%', background: 'radial-gradient(#14532d, transparent)' }} />
              {/* River */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                {/* Someș River */}
                <path d="M0,42 Q15,40 28,43 Q42,46 58,44 Q72,42 85,45 L100,44" stroke="rgba(30,80,180,0.45)" strokeWidth="1.2" fill="none" />
                <path d="M0,42 Q15,40 28,43 Q42,46 58,44 Q72,42 85,45 L100,44" stroke="rgba(60,120,220,0.2)" strokeWidth="2.5" fill="none" />
                {/* Main roads */}
                <path d="M0,47 Q25,45 48,50 Q65,54 100,52" stroke="rgba(180,160,90,0.25)" strokeWidth="0.6" fill="none" />
                <path d="M47,0 Q49,25 50,50 Q51,72 53,100" stroke="rgba(180,160,90,0.25)" strokeWidth="0.6" fill="none" />
                <path d="M0,28 Q20,32 40,38 Q58,43 78,33 L100,26" stroke="rgba(140,130,80,0.15)" strokeWidth="0.4" fill="none" />
                <path d="M12,68 Q30,63 55,67 Q70,69 90,74 L100,76" stroke="rgba(140,130,80,0.15)" strokeWidth="0.4" fill="none" />
                <path d="M28,0 Q33,38 36,100" stroke="rgba(140,130,80,0.12)" strokeWidth="0.3" fill="none" />
                <path d="M68,0 Q63,30 60,100" stroke="rgba(140,130,80,0.12)" strokeWidth="0.3" fill="none" />
                {/* City center blocks */}
                <rect x="43" y="43" width="14" height="14" rx="0.5" stroke="rgba(100,120,180,0.12)" strokeWidth="0.3" fill="rgba(20,40,90,0.15)" />
                <rect x="36" y="38" width="8" height="6" rx="0.3" stroke="rgba(100,120,180,0.08)" strokeWidth="0.2" fill="none" />
                <rect x="56" y="48" width="10" height="7" rx="0.3" stroke="rgba(100,120,180,0.08)" strokeWidth="0.2" fill="none" />
              </svg>
            </div>

            {/* Grid overlay for depth */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(100,150,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(100,150,255,1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* Neighborhood labels */}
            {[
              { label: 'Mărăști', x: 62, y: 22 },
              { label: 'Grigorescu', x: 73, y: 50 },
              { label: 'Mănăștur', x: 18, y: 57 },
              { label: 'Zorilor', x: 34, y: 28 },
              { label: 'Iris', x: 82, y: 68 },
              { label: 'Bună Ziua', x: 28, y: 76 },
              { label: 'Centru', x: 50, y: 50 },
            ].map(d => (
              <div
                key={d.label}
                className="absolute text-[9px] text-slate-500 pointer-events-none select-none font-semibold tracking-wide uppercase"
                style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {d.label}
              </div>
            ))}

            {/* User location indicator */}
            <div className="absolute z-20" style={{ left: '50%', top: '52%', transform: 'translate(-50%, -50%)' }}>
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-blue-400 border-2 border-white shadow-lg z-10 relative" />
                <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-30" style={{ transform: 'scale(2.5)' }} />
                <div className="absolute inset-0 rounded-full bg-blue-300 opacity-10" style={{ transform: 'scale(4)' }} />
              </div>
            </div>

            {/* River label */}
            <div className="absolute text-[8px] text-blue-400/60 font-medium pointer-events-none select-none" style={{ left: '20%', top: '39%', transform: 'rotate(-2deg)' }}>
              Someș
            </div>

            {/* Top info bar */}
            <div className="absolute top-3 left-4 flex items-center gap-2 z-10">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 text-[10px] text-slate-300">
                <Locate className="w-3 h-3 text-blue-400" />
                <span>Cluj-Napoca · 46.77°N 23.59°E</span>
              </div>
            </div>

            {/* Institution markers */}
            {filtered.map(inst => {
              const pos = toPercent(inst.coords[0], inst.coords[1]);
              const isSelected = selected?.id === inst.id;
              const isHovered = hovered === inst.id;
              const qStatus = getQueueStatus(inst.queue);
              const color = inst.color || CATEGORY_COLORS[inst.category] || '#2563eb';
              const ringColor = inst.queue.current <= 20 ? '#22c55e' : inst.queue.current <= 40 ? '#facc15' : '#ef4444';

              return (
                <div
                  key={inst.id}
                  className="absolute cursor-pointer z-10"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={() => handleSelect(inst)}
                  onMouseEnter={() => setHoveredId(inst.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Queue ring */}
                  <div
                    className="absolute rounded-full"
                    style={{
                      width: isSelected ? '28px' : '22px',
                      height: isSelected ? '28px' : '22px',
                      top: isSelected ? '-12px' : '-9px',
                      left: isSelected ? '-12px' : '-9px',
                      border: `2px solid ${ringColor}`,
                      opacity: isSelected ? 0.8 : 0.5,
                      transition: 'all 0.2s',
                    }}
                  />

                  {/* Pulse for selected */}
                  {(isSelected || isHovered) && (
                    <div
                      className="absolute rounded-full animate-ping"
                      style={{
                        width: '32px', height: '32px',
                        top: '-14px', left: '-14px',
                        backgroundColor: color,
                        opacity: 0.1,
                      }}
                    />
                  )}

                  {/* Pin dot */}
                  <div
                    className="rounded-full transition-all duration-200 relative z-10"
                    style={{
                      width: isSelected ? '16px' : isHovered ? '13px' : '10px',
                      height: isSelected ? '16px' : isHovered ? '13px' : '10px',
                      backgroundColor: color,
                      boxShadow: `0 0 ${isSelected ? 20 : 10}px ${color}80, 0 2px 6px rgba(0,0,0,0.5)`,
                      border: '2px solid rgba(255,255,255,0.25)',
                    }}
                  />

                  {/* Hover label */}
                  {(isSelected || isHovered) && (
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 rounded-lg text-[10px] font-semibold text-white shadow-xl z-20"
                      style={{
                        background: 'rgba(5,15,35,0.9)',
                        border: `1px solid ${color}40`,
                        backdropFilter: 'blur(8px)'
                      }}
                    >
                      {inst.name.split(' ').slice(0, 2).join(' ')} · ~{inst.queue.current}m
                    </div>
                  )}
                </div>
              );
            })}

            {/* Selected panel overlay on mobile — shown below */}
          </div>

          {/* Institution detail panel */}
          <AnimatePresence>
            {selected && (
              <div className="relative mt-3 sm:absolute sm:right-0 sm:top-0 sm:h-full sm:mt-0 sm:w-72">
                <InstitutionPanel inst={selected} onClose={() => setSelected(null)} />
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Legend + nearby list */}
        <div className="flex flex-wrap justify-between items-center gap-4 mt-4">
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {[
              { color: '#22c55e', label: 'Short wait (<20m)' },
              { color: '#facc15', label: 'Moderate (20–40m)' },
              { color: '#ef4444', label: 'Long wait (>40m)' },
              { color: 'rgba(100,150,255,0.8)', label: 'Your location' },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
          <span className="text-xs text-slate-600 flex items-center gap-1">
            <Radio className="w-3 h-3" /> Select a marker for details
          </span>
        </div>

        {/* Nearby institutions grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...clujInstitutions].slice(0, 6).map(inst => {
            const status = getQueueStatus(inst.queue);
            const now = new Date();
            const hour = now.getHours();
            const isOpen = hour >= 8 && hour < 16;
            return (
              <button
                key={inst.id}
                onClick={() => handleSelect(inst)}
                className={`text-left p-4 rounded-2xl border transition-all hover:border-primary/30 ${
                  selected?.id === inst.id
                    ? 'bg-primary/10 border-primary/40'
                    : 'bg-white/[0.03] border-white/8 hover:bg-white/5'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${inst.color}20`, border: `1px solid ${inst.color}30` }}>
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: inst.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white leading-tight truncate">{inst.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{inst.categoryLabel}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <QueueBadge minutes={inst.queue.current} />
                      <span className={`text-[9px] font-medium ${isOpen ? 'text-success' : 'text-destructive'}`}>
                        {isOpen ? '● Open' : '● Closed'}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}