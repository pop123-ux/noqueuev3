/**
 * LifeEvents page — Estonia-inspired civic entry point.
 *
 * "What happened in your life?" → automatic bureaucracy bundle.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { ChevronLeft, Sparkles } from 'lucide-react';
import Navbar from '@/components/noqueue/Navbar';
import LIFE_EVENTS, { LIFE_EVENT_CATEGORIES } from '@/lib/data/lifeEvents';
import LifeEventCard from '@/components/civic/LifeEventCard';
import LifeEventBundle from '@/components/civic/LifeEventBundle';
import { recordCivicEvent } from '@/lib/civic/civicTimeline';

const FILTERS = ['all', ...Object.keys(LIFE_EVENT_CATEGORIES)];

export default function LifeEvents() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('all');
  const [launching, setLaunching] = useState(false);

  useEffect(() => { base44.auth.me().then(setUser).catch(() => {}); }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? LIFE_EVENTS : LIFE_EVENTS.filter(e => e.category === filter)),
    [filter],
  );

  async function handleLaunch(event) {
    setLaunching(true);
    try {
      const userId = user?.email || 'anonymous';
      // Persist life event
      await base44.entities.LifeEvent.create({
        user_id: userId,
        event_key: event.key,
        event_title: event.title,
        category: event.category,
        status: 'in_progress',
        linked_workflow_ids: event.workflowIds || [],
        estimated_time_saved_min: event.estimatedSavedMin || 0,
      });
      // Record on civic timeline
      await recordCivicEvent({
        userId,
        eventType: 'life_event_started',
        title: `Life event: ${event.title}`,
        description: `Automatically assembled ${(event.workflowIds || []).length} workflow(s).`,
        source: 'life-events',
        resourceType: 'LifeEvent',
        resourceId: event.key,
      });
      // Send the user to the OS dashboard so they feel the assembly happened
      navigate('/os');
    } catch (err) {
      console.warn(err);
      setLaunching(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-20 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-white mb-3"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 mb-3">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Life Events Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">What happened in your life?</h1>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">
              Tell NoQueue about a life event. We assemble the cases, institutions, documents and next steps automatically — no more figuring out what form goes where.
            </p>
          </motion.div>

          {/* Filter chips */}
          <div className="flex flex-wrap gap-2 mb-5">
            {FILTERS.map(f => {
              const cat = LIFE_EVENT_CATEGORIES[f];
              const active = filter === f;
              return (
                <button
                  key={f}
                  onClick={() => { setFilter(f); setSelected(null); }}
                  className={`px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${
                    active
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white/5 text-slate-400 border-white/8 hover:border-white/20'
                  }`}
                  style={cat && !active ? { color: cat.color, borderColor: `${cat.color}33` } : undefined}
                >
                  {cat ? `${cat.emoji} ${cat.label}` : 'All'}
                </button>
              );
            })}
          </div>

          {/* Grid + bundle preview */}
          <div className="grid lg:grid-cols-[1fr_380px] gap-5">
            <div className="grid sm:grid-cols-2 gap-3">
              {filtered.map(ev => (
                <LifeEventCard
                  key={ev.key}
                  event={ev}
                  onSelect={setSelected}
                  loading={launching}
                />
              ))}
            </div>

            <div className="lg:sticky lg:top-24 self-start">
              {selected ? (
                <LifeEventBundle
                  event={selected}
                  onLaunch={handleLaunch}
                  launching={launching}
                />
              ) : (
                <div className="rounded-2xl p-6 bg-white/[0.02] border border-dashed border-white/10 text-center">
                  <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold text-white">Select a life event</p>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    NoQueue will instantly assemble the workflows, documents and institutions you need.
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-[10px] text-slate-700 text-center mt-8">
            🧪 Prototype — Conceptual digital civic OS for ClujHackathon2026. Not an official government service.
          </p>
        </div>
      </div>
    </div>
  );
}