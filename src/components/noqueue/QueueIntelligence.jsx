import React from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, TrendingDown, Minus, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import institutions from '@/lib/data/institutions';

const queueTrends = {
  'dep-cluj': 'stable',
  'pasapoarte-cluj': 'rising',
  'drpciv-cluj': 'rising',
  'primaria-cluj': 'falling',
  'taxe-locale': 'stable',
  'anaf-cluj': 'rising',
  'cas-cluj': 'stable',
  'ipj-cluj': 'falling',
  'starea-civila': 'stable',
  'asistenta-sociala': 'rising',
  'reg-comert': 'stable',
  'ocpi-cluj': 'rising',
  'apa-somes': 'falling',
  'electrica': 'stable',
  'ctp-cluj': 'falling',
};

const trendIcons = {
  rising: { icon: TrendingUp, color: 'text-destructive', label: 'Rising' },
  stable: { icon: Minus, color: 'text-warning', label: 'Stable' },
  falling: { icon: TrendingDown, color: 'text-success', label: 'Falling' },
};

const crowdBg = {
  low: 'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  high: 'bg-destructive/10 text-destructive',
};

// Synthetic hourly data
const hourlyData = [
  { hour: '08:00', level: 30 },
  { hour: '09:00', level: 70 },
  { hour: '10:00', level: 90 },
  { hour: '11:00', level: 85 },
  { hour: '12:00', level: 50 },
  { hour: '13:00', level: 40 },
  { hour: '14:00', level: 55 },
  { hour: '15:00', level: 35 },
  { hour: '16:00', level: 20 },
];

export default function QueueIntelligence() {
  const sorted = [...institutions].sort((a, b) => a.queue - b.queue);

  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <span className="text-xs font-semibold uppercase tracking-wider text-warning">Real-time data</span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-white">Queue Intelligence</h2>
          <p className="mt-3 text-slate-400 max-w-xl mx-auto">
            Synthetic queue data showing estimated wait times, crowd levels, and trends.
          </p>
        </motion.div>

        {/* Hourly chart */}
        <div className="glass-card rounded-3xl p-6 mb-8 max-w-2xl mx-auto">
          <h3 className="text-sm font-semibold text-white mb-4">Average Crowd Level Today</h3>
          <div className="flex items-end gap-2 h-32">
            {hourlyData.map(h => {
              const height = `${h.level}%`;
              const color = h.level > 75 ? 'bg-destructive' : h.level > 45 ? 'bg-warning' : 'bg-success';
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full relative flex items-end" style={{ height: '100px' }}>
                    <div
                      className={`w-full ${color} rounded-t-md transition-all`}
                      style={{ height }}
                    />
                  </div>
                  <span className="text-[9px] text-slate-500">{h.hour}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 mt-3 text-center">
            Best times: 08:00, 12:00–13:00, and after 15:00
          </p>
        </div>

        {/* Queue table */}
        <div className="glass-card rounded-3xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left py-3 px-4 text-xs font-medium text-slate-400">Institution</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Queue</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Crowd</th>
                  <th className="text-center py-3 px-4 text-xs font-medium text-slate-400">Trend</th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-slate-400 hidden sm:table-cell">Best Time</th>
                </tr>
              </thead>
              <tbody>
                {sorted.slice(0, 10).map(inst => {
                  const trend = trendIcons[queueTrends[inst.id] || 'stable'];
                  const TrendIcon = trend.icon;
                  return (
                    <tr key={inst.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium text-white">{inst.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-primary" />
                          <span className="text-xs text-slate-300">{inst.queue} min</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className={`text-[10px] ${crowdBg[inst.crowd]}`}>
                          {inst.crowd}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`flex items-center justify-center gap-1 ${trend.color}`}>
                          <TrendIcon className="w-3 h-3" />
                          <span className="text-[10px]">{trend.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right hidden sm:table-cell">
                        <span className="text-xs text-slate-400">{inst.bestTime}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}