import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, Clock, Users, Globe, Phone, X, Navigation,
  ChevronRight, Wifi, Star, AlertCircle, ZoomIn, ZoomOut
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { clujInstitutions, getQueueStatus, getHourlyPattern } from '@/lib/data/clujInstitutions';

/**
 * GOOGLE MAPS INTEGRATION
 * 
 * Future environment variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 * 
 * Future integrations:
 * - Google Maps JavaScript API (dark navy custom theme)
 * - Places API (nearby institution search)
 * - Directions API (route to institution)
 * - Distance Matrix API (travel time estimation)
 * - Geolocation API (user position)
 * 
 * Current: Premium simulated SVG map for hackathon MVP
 */

const CLUJ_BOUNDS = {
  latMin: 46.747, latMax: 46.793,
  lngMin: 23.570, lngMax: 23.630,
};

function toPercent(lat, lng) {
  const x = ((lng - CLUJ_BOUNDS.lngMin) / (CLUJ_BOUNDS.lngMax - CLUJ_BOUNDS.lngMin)) * 100;
  const y = ((CLUJ_BOUNDS.latMax - lat) / (CLUJ_BOUNDS.latMax - CLUJ_BOUNDS.latMin)) * 100;
  return { x: Math.min(96, Math.max(2, x)), y: Math.min(96, Math.max(2, y)) };
}

// Crowd level bar
function QueueBar({ value, max = 100 }) {
  const pct = Math.round((value / max) * 100);
  const color = pct > 70 ? '#ef4444' : pct > 45 ? '#facc15' : '#22c55e';
  return (
    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
    </div>
  );
}

// Hourly pattern mini chart
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

// Detailed institution panel
function InstitutionPanel({ inst, onClose }) {
  const status = getQueueStatus(inst.queue);
  const pattern = getHourlyPattern(inst.id);
  const isOpen = true; // Simulated — always open during demo

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.97 }}
      className="absolute right-3 top-3 bottom-3 w-72 glass rounded-2xl border border-white/10 flex flex-col z-30 overflow-hidden shadow-2xl"
    >
      {/* Header */}
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
        {/* Status row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-success animate-pulse' : 'bg-destructive'}`} />
            <span className="text-xs text-slate-300">{isOpen ? 'Open now' : 'Closed'}</span>
          </div>
          <div
            className="flex items-center gap-1 text-xs font-semibold"
            style={{ color: status.color }}
          >
            <Users className="w-3 h-3" />
            {status.label}
          </div>
        </div>

        {/* Queue */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-400">Estimated wait</span>
            <span className="text-sm font-bold text-white">~{inst.queue.current} min</span>
          </div>
          <QueueBar value={inst.queue.current} max={120} />
          <div className="flex justify-between text-[9px] text-slate-600 mt-1">
            <span>Min: {inst.queue.min}m</span>
            <span>Max: {inst.queue.max}m</span>
          </div>
        </div>

        {/* Hourly chart */}
        <div>
          <p className="text-xs text-slate-400 mb-1.5">Crowd pattern today</p>
          <HourlyChart data={pattern} />
        </div>

        {/* Info */}
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

        {/* Services */}
        <div>
          <p className="text-xs font-semibold text-slate-400 mb-1.5">Services</p>
          <div className="flex flex-wrap gap-1">
            {inst.services.map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{s}</span>
            ))}
          </div>
        </div>

        {/* Smart tip */}
        <div className="rounded-xl bg-primary/8 border border-primary/20 p-3">
          <p className="text-[10px] font-semibold text-primary mb-1">💡 Smart Tip</p>
          <p className="text-[10px] text-slate-300 leading-relaxed">{inst.tips}</p>
        </div>

        {/* Warning */}
        <div className="rounded-xl bg-warning/8 border border-warning/20 p-3">
          <p className="text-[10px] font-semibold text-warning mb-1">⚠️ Common Mistake</p>
          <p className="text-[10px] text-slate-300 leading-relaxed">{inst.commonMistake}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="p-3 border-t border-white/5 grid grid-cols-2 gap-2">
        <a
          href={`https://www.google.com/maps/search/${encodeURIComponent(inst.fullName + ' Cluj-Napoca')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
        >
          <Navigation className="w-3.5 h-3.5" />
          Navigate
        </a>
        <a
          href="#chat"
          className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-medium hover:bg-white/10 transition-colors"
        >
          Ask AI
          <ChevronRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

const CATEGORY_COLORS = {
  identity: '#2563eb',
  passport: '#06b6d4',
  vehicles: '#ef4444',
  taxes: '#facc15',
  'city-hall': '#22c55e',
  health: '#06b6d4',
  immigration: '#8b5cf6',
  'civil-status': '#f97316',
  'local-taxes': '#22c55e',
  police: '#2563eb',
  business: '#8b5cf6',
};

export default function ClujMap({ selectedInstitution: externalSelected, onSelectInstitution }) {
  const [selected, setSelected] = useState(null);
  const [hovered, setHoveredId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (externalSelected) setSelected(externalSelected);
  }, [externalSelected]);

  const categories = ['all', ...new Set(clujInstitutions.map(i => i.category))];

  const filtered = filter === 'all'
    ? clujInstitutions
    : clujInstitutions.filter(i => i.category === filter);

  const handleSelect = (inst) => {
    setSelected(selected?.id === inst.id ? null : inst);
    onSelectInstitution?.(inst);
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

  return (
    <section id="map" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Navigate</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Cluj-Napoca Institution Map</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Interactive map of all civic institutions with live queue simulation.
            <span className="text-slate-600"> · Google Maps API ready.</span>
          </p>
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

        {/* Map */}
        <div className="relative">
          <div className="relative glass-card rounded-3xl overflow-hidden" style={{ paddingBottom: '50%' }}>
            {/* Background grid */}
            <div className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, #020617 0%, #071426 50%, #0f172a 100%)',
                backgroundImage: `
                  linear-gradient(rgba(37, 99, 235, 0.04) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(37, 99, 235, 0.04) 1px, transparent 1px)
                `,
                backgroundSize: '48px 48px'
              }}
            />

            {/* Glow aura */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Street lines SVG */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Main roads */}
              <path d="M0,48 Q30,46 50,50 Q70,54 100,52" stroke="rgba(37,99,235,0.12)" strokeWidth="0.4" fill="none" />
              <path d="M48,0 Q50,30 50,50 Q50,70 52,100" stroke="rgba(37,99,235,0.12)" strokeWidth="0.4" fill="none" />
              <path d="M0,30 Q25,35 45,40 Q60,45 80,35 L100,28" stroke="rgba(37,99,235,0.07)" strokeWidth="0.25" fill="none" />
              <path d="M10,70 Q30,65 55,68 Q70,70 90,75 L100,78" stroke="rgba(37,99,235,0.07)" strokeWidth="0.25" fill="none" />
              <path d="M30,0 Q35,40 38,100" stroke="rgba(37,99,235,0.05)" strokeWidth="0.2" fill="none" />
              <path d="M70,0 Q65,30 62,100" stroke="rgba(37,99,235,0.05)" strokeWidth="0.2" fill="none" />
              {/* City center area */}
              <rect x="44" y="44" width="12" height="12" rx="1" stroke="rgba(37,99,235,0.08)" strokeWidth="0.2" fill="none" />
            </svg>

            {/* Labels */}
            <div className="absolute top-3 left-4 text-[10px] text-slate-600 font-mono">46.77°N 23.59°E</div>
            <div className="absolute bottom-3 left-4 text-[10px] text-slate-600">Cluj-Napoca</div>
            <div className="absolute bottom-3 right-3 text-[10px] text-slate-700">Simulated · Google Maps API ready</div>

            {/* District labels */}
            {[
              { label: 'Mărăști', x: 62, y: 25 },
              { label: 'Grigorescu', x: 72, y: 50 },
              { label: 'Mănăștur', x: 20, y: 55 },
              { label: 'Zorilor', x: 35, y: 30 },
              { label: 'Iris', x: 80, y: 70 },
              { label: 'Bună Ziua', x: 30, y: 75 },
            ].map(d => (
              <div
                key={d.label}
                className="absolute text-[9px] text-slate-700 pointer-events-none select-none font-medium"
                style={{ left: `${d.x}%`, top: `${d.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                {d.label}
              </div>
            ))}

            {/* Institution markers */}
            {filtered.map(inst => {
              const pos = toPercent(inst.coords[0], inst.coords[1]);
              const isSelected = selected?.id === inst.id;
              const isHovered = hovered === inst.id;
              const qStatus = getQueueStatus(inst.queue);
              const color = inst.color || CATEGORY_COLORS[inst.category] || '#2563eb';

              return (
                <div
                  key={inst.id}
                  className="absolute cursor-pointer z-10"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%`, transform: 'translate(-50%, -50%)' }}
                  onClick={() => handleSelect(inst)}
                  onMouseEnter={() => setHoveredId(inst.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Outer pulse */}
                  {(isSelected || isHovered) && (
                    <div
                      className="absolute rounded-full animate-ping"
                      style={{
                        width: '24px', height: '24px',
                        top: '-10px', left: '-10px',
                        backgroundColor: color,
                        opacity: 0.15,
                      }}
                    />
                  )}

                  {/* Glow ring for selected */}
                  {isSelected && (
                    <div
                      className="absolute rounded-full"
                      style={{
                        width: '20px', height: '20px',
                        top: '-8px', left: '-8px',
                        boxShadow: `0 0 16px ${color}`,
                        backgroundColor: `${color}20`,
                        border: `1px solid ${color}60`,
                        borderRadius: '50%',
                      }}
                    />
                  )}

                  {/* Dot */}
                  <div
                    className="rounded-full transition-all duration-200"
                    style={{
                      width: isSelected ? '14px' : isHovered ? '12px' : '10px',
                      height: isSelected ? '14px' : isHovered ? '12px' : '10px',
                      backgroundColor: color,
                      boxShadow: `0 0 ${isSelected ? 16 : 8}px ${color}70`,
                      border: '2px solid rgba(2,6,23,0.8)',
                    }}
                  />

                  {/* Queue badge */}
                  {(isSelected || isHovered) && (
                    <div
                      className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-[9px] font-semibold text-white glass"
                      style={{ border: `1px solid ${color}40` }}
                    >
                      ~{inst.queue.current}m
                    </div>
                  )}
                </div>
              );
            })}
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

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-4">
          {[
            { color: '#22c55e', label: 'Short wait (<20m)' },
            { color: '#facc15', label: 'Moderate (20-40m)' },
            { color: '#ef4444', label: 'Long wait (>40m)' },
          ].map(l => (
            <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: l.color }} />
              {l.label}
            </div>
          ))}
          <span className="text-xs text-slate-600">Click marker for details</span>
        </div>
      </div>
    </section>
  );
}