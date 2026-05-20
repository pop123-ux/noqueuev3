import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Users } from 'lucide-react';
import institutions from '@/lib/data/institutions';

/**
 * Simulated map for MVP demo.
 * 
 * Future integrations:
 * - Google Maps JavaScript API
 * - Places API
 * - Directions API
 * - Distance Matrix API
 * 
 * Environment variable: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
 */

const crowdDotColors = { low: '#22c55e', medium: '#facc15', high: '#ef4444' };

const mapCenter = { lat: 46.7712, lng: 23.5897 };
const mapBounds = { latMin: 46.755, latMax: 46.785, lngMin: 23.575, lngMax: 23.615 };

function latLngToPos(lat, lng) {
  const x = ((lng - mapBounds.lngMin) / (mapBounds.lngMax - mapBounds.lngMin)) * 100;
  const y = ((mapBounds.latMax - lat) / (mapBounds.latMax - mapBounds.latMin)) * 100;
  return { x: Math.min(92, Math.max(4, x)), y: Math.min(92, Math.max(4, y)) };
}

export default function SimulatedMap({ selectedInstitution, onSelectInstitution }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <section id="map" className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Navigate</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Cluj-Napoca Map</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Simulated map showing institution locations with live queue status.
          </p>
        </motion.div>

        <div className="relative glass-card rounded-3xl overflow-hidden aspect-[16/10] sm:aspect-[2/1] glow-blue">
          {/* Grid background */}
          <div className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(37, 99, 235, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(37, 99, 235, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />

          {/* Map labels */}
          <div className="absolute top-4 left-4 text-xs text-slate-600 font-mono">46.77°N, 23.59°E</div>
          <div className="absolute bottom-4 right-4 text-[10px] text-slate-600">Cluj-Napoca • Simulated</div>

          {/* Road hints */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <line x1="10%" y1="50%" x2="90%" y2="50%" stroke="rgba(37, 99, 235, 0.08)" strokeWidth="2" />
            <line x1="50%" y1="10%" x2="50%" y2="90%" stroke="rgba(37, 99, 235, 0.08)" strokeWidth="2" />
            <line x1="20%" y1="20%" x2="80%" y2="80%" stroke="rgba(37, 99, 235, 0.05)" strokeWidth="1" />
          </svg>

          {/* Institution markers */}
          {institutions.map(inst => {
            const pos = latLngToPos(inst.coords[0], inst.coords[1]);
            const isSelected = selectedInstitution?.id === inst.id;
            const isHovered = hoveredId === inst.id;
            const dotColor = crowdDotColors[inst.crowd];

            return (
              <div
                key={inst.id}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                onClick={() => onSelectInstitution?.(inst)}
                onMouseEnter={() => setHoveredId(inst.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Pulse ring */}
                {(isSelected || isHovered) && (
                  <div
                    className="absolute w-10 h-10 rounded-full -top-3 -left-3 animate-ping opacity-20"
                    style={{ backgroundColor: dotColor }}
                  />
                )}

                {/* Dot */}
                <div
                  className={`w-4 h-4 rounded-full border-2 border-navy-900 transition-transform ${isSelected ? 'scale-150' : 'group-hover:scale-125'}`}
                  style={{ backgroundColor: dotColor, boxShadow: `0 0 12px ${dotColor}40` }}
                />

                {/* Tooltip */}
                {(isSelected || isHovered) && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 glass rounded-xl px-3 py-2 min-w-[180px] z-20 pointer-events-none">
                    <p className="text-xs font-semibold text-white whitespace-nowrap">{inst.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock className="w-3 h-3" /> {inst.queue} min
                      </div>
                      <div className="flex items-center gap-1 text-[10px]" style={{ color: dotColor }}>
                        <Users className="w-3 h-3" /> {inst.crowd}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Center pin */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-4">
          {Object.entries(crowdDotColors).map(([level, color]) => (
            <div key={level} className="flex items-center gap-1.5 text-xs text-slate-400">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
              <span className="capitalize">{level} crowd</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}