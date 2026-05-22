import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Minus, Users, Zap, Radio } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { clujInstitutions, getQueueStatus } from '@/lib/data/clujInstitutions';
import QueueReportModal from './QueueReportModal';

const trendConfig = {
  rising: { icon: TrendingUp, color: 'text-destructive', label: 'Rising' },
  stable: { icon: Minus, color: 'text-warning', label: 'Stable' },
  falling: { icon: TrendingDown, color: 'text-success', label: 'Falling' },
};

const hourlyData = [
  { hour: '08:00', level: 28 },
  { hour: '09:00', level: 72 },
  { hour: '10:00', level: 92 },
  { hour: '11:00', level: 88 },
  { hour: '12:00', level: 52 },
  { hour: '13:00', level: 38 },
  { hour: '14:00', level: 58 },
  { hour: '15:00', level: 32 },
  { hour: '16:00', level: 18 },
];

export default function QueueIntelligence() {
  const [showReport, setShowReport] = useState(false);
  const sorted = [...clujInstitutions].sort((a, b) => a.queue.current - b.queue.current);

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-warning">Live Signal Network</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Queue Intelligence</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Crowd-sourced wait time signals from Cluj-Napoca civic offices. Report your real wait time to help others.
          </p>
          <button
            onClick={() => setShowReport(true)}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold hover:bg-primary/20 transition-colors"
          >
            <Radio className="w-4 h-4" />
            Report your wait time now
          </button>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Hourly chart */}
          <div className="lg:col-span-2 glass-card rounded-3xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-sm font-semibold text-white">Average Crowd Level Today</h3>
              <div className="flex items-center gap-1.5 text-xs text-success">
                <Zap className="w-3.5 h-3.5" />
                <span>Best: 08:00, 13:00, 15:00+</span>
              </div>
            </div>
            <div className="flex items-end gap-2" style={{ height: '100px' }}>
              {hourlyData.map(h => {
                const color = h.level > 75 ? '#ef4444' : h.level > 45 ? '#facc15' : '#22c55e';
                const heightPct = `${h.level}%`;
                return (
                  <div key={h.hour} className="flex-1 flex flex-col items-center gap-1" style={{ height: '100%' }}>
                    <div className="w-full flex items-end" style={{ height: 'calc(100% - 16px)' }}>
                      <motion.div
                        className="w-full rounded-t-md"
                        style={{ height: heightPct, backgroundColor: color }}
                        initial={{ height: 0 }}
                        whileInView={{ height: heightPct }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: hourlyData.findIndex(x => x.hour === h.hour) * 0.05 }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-500">{h.hour.split(':')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick stats */}
          <div className="space-y-3">
            {[
              { label: 'Lowest queue now', inst: sorted[0], color: 'text-success' },
              { label: 'Busiest right now', inst: sorted[sorted.length - 1], color: 'text-destructive' },
            ].map(({ label, inst, color }) => (
              <div key={label} className="glass-card rounded-2xl p-4">
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-sm font-semibold text-white leading-tight">{inst.name}</p>
                <div className={`text-xl font-bold mt-1 ${color}`}>~{inst.queue.current} min</div>
              </div>
            ))}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-1">Avg across all offices</p>
              <div className="text-xl font-bold text-primary">
                ~{Math.round(clujInstitutions.reduce((s, i) => s + i.queue.current, 0) / clujInstitutions.length)} min
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Institution</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400 hidden sm:table-cell">Category</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Wait</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Status</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Trend</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(inst => {
                  const status = getQueueStatus(inst.queue);
                  const trend = trendConfig[inst.queue.trend] || trendConfig.stable;
                  const TrendIcon = trend.icon;
                  return (
                    <tr key={inst.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: inst.color }} />
                          <span className="text-xs font-medium text-white">{inst.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center hidden sm:table-cell">
                        <span className="text-xs text-slate-400">{inst.categoryLabel}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-xs font-semibold text-white">{inst.queue.current}m</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-medium" style={{ color: status.color }}>
                          {status.label}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`flex items-center justify-center gap-1 ${trend.color}`}>
                          <TrendIcon className="w-3 h-3" />
                          <span className="text-[10px]">{trend.label}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-white/5">
            <p className="text-[10px] text-slate-600 text-center">
              Proprietary crowd-sourced signals · Report your wait to help build real-time queue data
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showReport && <QueueReportModal onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </section>
  );
}