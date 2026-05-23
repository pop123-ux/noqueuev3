import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, ZoomControl, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, ExternalLink, Clock, Globe, AlertCircle } from 'lucide-react';
import { clujInstitutions, getQueueStatus } from '@/lib/data/clujInstitutions';

const CLUJ_CENTER = [46.7712, 23.6000];
const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const TILE_ATTR = '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>';

// Spread markers that share nearly identical real-world coordinates
const COORD_OVERRIDES = {
  'spclep-cluj':       [46.7626, 23.5953],
  'cjas-cluj':         [46.7633, 23.5970],
  'stare-civila-cluj': [46.7639, 23.5950],
  'primaria-cluj':     [46.7703, 23.5891],
  'taxe-locale-cluj':  [46.7713, 23.5907],
};

function getDisplayCoords(inst) {
  return COORD_OVERRIDES[inst.id] || inst.coords;
}

function queueColor(v) {
  if (v <= 20) return '#22c55e';
  if (v <= 40) return '#facc15';
  return '#ef4444';
}

function instIcon(color, minutes) {
  return L.divIcon({
    className: '',
    html: `<div style="width:34px;height:34px;border-radius:50%;background:${color};border:2px solid rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#060d1a;box-shadow:0 0 14px ${color}55;cursor:pointer;">${minutes}m</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function makeUserIcon() {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 5px rgba(59,130,246,0.25);"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function makeNeighborhoodIcon(name) {
  return L.divIcon({
    className: '',
    html: `<div style="color:rgba(148,163,184,0.42);font-size:8px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;white-space:nowrap;pointer-events:none;text-shadow:0 1px 4px rgba(0,0,0,0.95);">${name}</div>`,
    iconSize: [1, 1],
    iconAnchor: [0, 0],
  });
}

const NEIGHBORHOODS = [
  { name: 'Centru',            coords: [46.7712, 23.5872] },
  { name: 'Mărăști',           coords: [46.7848, 23.6030] },
  { name: 'Gheorgheni',        coords: [46.7645, 23.6125] },
  { name: 'Mănăștur',          coords: [46.7648, 23.5608] },
  { name: 'Zorilor',           coords: [46.7618, 23.5808] },
  { name: 'Grigorescu',        coords: [46.7695, 23.5742] },
  { name: 'Gruia',             coords: [46.7788, 23.5728] },
  { name: 'Bulgaria',          coords: [46.7862, 23.5962] },
  { name: 'Iris',              coords: [46.7915, 23.5852] },
  { name: 'Someșeni',          coords: [46.7878, 23.6438] },
  { name: 'Între Lacuri',      coords: [46.7758, 23.6168] },
  { name: 'Dâmbul Rotund',     coords: [46.7828, 23.5738] },
  { name: 'Andrei Mureșanu',   coords: [46.7640, 23.5998] },
  { name: 'Bună Ziua',         coords: [46.7572, 23.5988] },
  { name: 'Borhanci',          coords: [46.7530, 23.6218] },
  { name: 'Becaș',             coords: [46.7490, 23.6058] },
  { name: 'Sopor',             coords: [46.7570, 23.6318] },
  { name: 'Europa',            coords: [46.7552, 23.5788] },
  { name: 'Făget',             coords: [46.7440, 23.5845] },
  { name: 'Măgura',            coords: [46.7822, 23.5585] },
  { name: 'Grădini Mănăștur',  coords: [46.7680, 23.5660] },
];

function MapController({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) {
      map.flyTo(getDisplayCoords(target), 15, { duration: 1.2 });
    }
  }, [target, map]);
  return null;
}

function InstitutionPanel({ inst, onClose }) {
  const color = queueColor(inst.queue.current);
  const status = getQueueStatus(inst.queue);
  const [lat, lng] = getDisplayCoords(inst);

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 28, stiffness: 220 }}
      className="absolute top-0 right-0 h-full w-72 z-[1000] flex flex-col overflow-hidden"
      style={{ background: 'rgba(4,9,20,0.97)', backdropFilter: 'blur(20px)', borderLeft: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: inst.color }} />
              <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wide">{inst.categoryLabel}</span>
            </div>
            <h3 className="text-sm font-bold text-white leading-snug">{inst.name}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors shrink-0 mt-0.5">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="rounded-xl px-3 py-2.5 flex items-center justify-between" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <div>
            <div className="text-[10px] text-slate-500 mb-0.5">Community queue estimate</div>
            <div className="text-xl font-bold" style={{ color }}>~{inst.queue.current} min</div>
          </div>
          <span className="text-[10px] font-semibold px-2 py-1 rounded-full" style={{ background: `${color}22`, color }}>
            {status.label}
          </span>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">{inst.address}</p>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-accent shrink-0" />
          <span>{inst.hours.weekdays}</span>
          {inst.hours.saturday !== 'Closed' && (
            <span className="text-slate-600">· Sat {inst.hours.saturday}</span>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {inst.onlineServices && (
            <span className="text-[10px] flex items-center gap-1 text-success bg-success/10 px-2 py-0.5 rounded-full">
              <Globe className="w-3 h-3" /> Online available
            </span>
          )}
          {inst.appointmentRequired && (
            <span className="text-[10px] flex items-center gap-1 text-warning bg-warning/10 px-2 py-0.5 rounded-full">
              <AlertCircle className="w-3 h-3" /> Appointment required
            </span>
          )}
        </div>

        <div>
          <div className="text-[10px] text-slate-600 uppercase tracking-wider mb-1.5">Services</div>
          <div className="flex flex-wrap gap-1">
            {inst.services.map(s => (
              <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{s}</span>
            ))}
          </div>
        </div>

        {inst.commonMistake && (
          <div className="rounded-xl px-3 py-2 text-[10px] text-warning" style={{ background: 'rgba(250,204,21,0.05)', border: '1px solid rgba(250,204,21,0.15)' }}>
            ⚠️ {inst.commonMistake}
          </div>
        )}
      </div>

      <div className="p-5 pt-0 space-y-2 border-t border-white/5">
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-semibold transition-all hover:opacity-90 active:scale-95"
          style={{ background: color, color: '#060d1a' }}
        >
          <Navigation className="w-3.5 h-3.5" />
          Get Directions
        </a>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(inst.address)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-xs font-medium text-primary border border-primary/20 hover:bg-primary/10 transition-all"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open in Google Maps
        </a>
      </div>
    </motion.div>
  );
}

const ALL_CATEGORIES = ['All', ...new Set(clujInstitutions.map(i => i.categoryLabel))];

export default function ClujMap({ selectedInstitution, onSelectInstitution }) {
  const [panel, setPanel] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    if (selectedInstitution) setPanel(selectedInstitution);
  }, [selectedInstitution]);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => {}
    );
  }, []);

  const filtered = activeCategory === 'All'
    ? clujInstitutions
    : clujInstitutions.filter(i => i.categoryLabel === activeCategory);

  function handleMarkerClick(inst) {
    setPanel(inst);
    onSelectInstitution?.(inst);
  }

  return (
    <section id="map" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Live Map</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Cluj-Napoca Institution Map</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Real-time queue estimates · Click any marker for details & directions.
          </p>
        </motion.div>

        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                activeCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div
          className="relative rounded-3xl overflow-hidden glow-blue"
          style={{ height: '560px', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <MapContainer
            center={CLUJ_CENTER}
            zoom={13}
            zoomControl={false}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url={TILE_URL} attribution={TILE_ATTR} />
            <ZoomControl position="bottomright" />
            <MapController target={panel} />

            {NEIGHBORHOODS.map(n => (
              <Marker key={n.name} position={n.coords} icon={makeNeighborhoodIcon(n.name)} />
            ))}

            {filtered.map(inst => (
              <Marker
                key={inst.id}
                position={getDisplayCoords(inst)}
                icon={instIcon(queueColor(inst.queue.current), inst.queue.current)}
                eventHandlers={{ click: () => handleMarkerClick(inst) }}
              />
            ))}

            {userLocation && (
              <Marker position={userLocation} icon={makeUserIcon()} />
            )}
          </MapContainer>

          <AnimatePresence>
            {panel && (
              <InstitutionPanel inst={panel} onClose={() => setPanel(null)} />
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap justify-center gap-6 mt-5">
          {[
            { label: '≤20 min · Short wait', color: '#22c55e' },
            { label: '21–40 min · Moderate', color: '#facc15' },
            { label: '>40 min · Long wait', color: '#ef4444' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              {label}
            </div>
          ))}
          {userLocation && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full bg-primary" style={{ boxShadow: '0 0 0 4px rgba(59,130,246,0.2)' }} />
              Your location
            </div>
          )}
        </div>
      </div>
    </section>
  );
}