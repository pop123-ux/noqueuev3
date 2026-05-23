/**
 * CivicNavbar — Premium 3-tab civic OS navigation
 */
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User } from 'lucide-react';
import OthersDropdown from '@/components/layout/OthersDropdown';
import { base44 } from '@/api/base44Client';

const TABS = [
  { id: 'noqueue',   label: 'NoQueue' },
  { id: 'chats',     label: 'Chats' },
  { id: 'documents', label: 'Documente' },
];

export default function CivicNavbar({ activeTab, onTabChange }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(11, 15, 25, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center h-14 gap-4">

          {/* LEFT — Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight hidden sm:inline">NoQueue</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline"
              style={{ color: '#60a5fa', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)' }}
            >
              Cluj·2026
            </span>
          </div>

          {/* CENTER — Tabs */}
          <div className="flex-1 flex items-center justify-center">
            <div
              className="flex items-center gap-0.5 p-0.5 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all focus:outline-none"
                  style={{ color: activeTab === tab.id ? '#f8fafc' : '#64748b' }}
                >
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="active-tab"
                      className="absolute inset-0 rounded-lg"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.08)' }}
                      transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <OthersDropdown />
            <Link
              to="/profile"
              aria-label="Profil"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all focus:outline-none ml-1"
            >
              {user?.full_name ? (
                <span className="text-xs font-bold text-white">
                  {user.full_name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
              ) : (
                <User className="w-4 h-4" />
              )}
            </Link>
          </div>

        </div>
      </div>
    </nav>
  );
}