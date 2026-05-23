/**
 * Home — Premium Civic OS Dashboard
 * Linear/Stripe-inspired minimal layout
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/noqueue/Navbar';
import SafeCasesCard from '@/components/dashboard/SafeCasesCard';
import VaultCard from '@/components/dashboard/VaultCard';

export default function Home() {
  return (
    <div
      className="min-h-screen font-inter"
      style={{ background: '#0B0F19', color: '#f8fafc' }}
    >
      <Navbar />

      <main className="max-w-5xl mx-auto px-5 sm:px-8 pt-28 pb-20">

        {/* Welcome header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600 mb-2">
            NoQueue · Civic OS
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
            Bun venit înapoi.
          </h1>
          <p className="text-slate-500 text-sm mt-1.5 max-w-md leading-relaxed">
            Identitatea ta civică și documentele tale sunt protejate și gata de utilizare.
          </p>
        </motion.div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SafeCasesCard />
          <VaultCard />
        </div>

        {/* Secondary actions — minimal row */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          {[
            { label: 'Identity Vault', href: '/vault' },
            { label: 'Seif Documente', href: '/digital-vault' },
            { label: 'Cazuri Active', href: '/cases' },
            { label: 'Programare', href: '/appointments/watch' },
          ].map(item => (
            <Link
              key={item.href}
              to={item.href}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-white/20"
              style={{ border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {item.label}
              <ArrowRight className="w-3 h-3" />
            </Link>
          ))}
        </motion.div>

      </main>

      {/* Subtle footer */}
      <div className="border-t border-white/[0.04] py-6 text-center">
        <p className="text-[11px] text-slate-700">
          NoQueue · Civic OS · Cluj-Napoca · 2026
        </p>
      </div>
    </div>
  );
}