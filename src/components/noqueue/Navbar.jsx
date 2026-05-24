import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Zap, Briefcase, User, Shield, FolderOpen, Globe2,
  FileSearch, Sparkles, Layers, Building2, MapPin, ChevronDown,
  FileText, PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Premium 3-pillar navbar: NoQueue AI · Cont · Altele
 * Right side: Scanează buletin · Start a Case
 * Everything else lives inside the Altele dropdown (desktop) or mobile drawer.
 */

const OTHERS_ITEMS = [
  { to: '/life-events', icon: Sparkles, title: 'Evenimente de viață', desc: 'Pași ghidați pentru situații importante' },
  { to: '/smart-doc', icon: FileSearch, title: 'Smart Documents', desc: 'Documente generate automat', badge: 'NEW' },
  { to: '#map', icon: MapPin, title: 'Hartă & Instituții', desc: 'Locații și disponibilitate' },
  { to: '/move-to-romania', icon: Globe2, title: 'Move to Romania', desc: 'Asistent pentru integrare și relocare' },
  { to: '/os', icon: Layers, title: 'Civic OS', desc: 'Modul experimental pentru infrastructură civică' },
  { to: '/run-demo', icon: PlayCircle, title: 'Demo run', desc: 'Parcurge fluxul complet pentru juriu' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const othersRef = useRef(null);
  const location = useLocation();

  // Close Altele dropdown on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (othersRef.current && !othersRef.current.contains(e.target)) setOthersOpen(false);
    };
    if (othersOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [othersOpen]);

  // Close drawers on route change
  useEffect(() => {
    setMobileOpen(false);
    setOthersOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isOthersActive = OTHERS_ITEMS.some(i => isActive(i.to));

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">NoQueue</span>
              <span className="hidden sm:inline text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                Demo MVP
              </span>
            </Link>

            {/* Center: 3-pillar nav (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 text-sm rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/')
                    ? 'bg-primary/15 text-white font-semibold border border-primary/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-primary" />
                NoQueue AI
              </Link>

              <Link
                to="/profile"
                className={`px-3.5 py-2 text-sm rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/profile')
                    ? 'bg-primary/15 text-white font-semibold border border-primary/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Cont
              </Link>

              {/* Altele dropdown */}
              <div className="relative" ref={othersRef}>
                <button
                  onClick={() => setOthersOpen(o => !o)}
                  className={`px-3.5 py-2 text-sm rounded-xl transition-all flex items-center gap-1.5 ${
                    isOthersActive || othersOpen
                      ? 'bg-primary/15 text-white font-semibold border border-primary/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                  aria-expanded={othersOpen}
                  aria-haspopup="menu"
                >
                  Altele
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${othersOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {othersOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-[380px] rounded-2xl overflow-hidden"
                      style={{
                        background: 'rgba(11, 20, 40, 0.95)',
                        backdropFilter: 'blur(16px)',
                        WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(59, 130, 246, 0.18)',
                        boxShadow: '0 24px 64px rgba(0,0,0,0.5), 0 0 80px rgba(37,99,235,0.08)',
                      }}
                      role="menu"
                    >
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Toate modulele
                        </p>
                      </div>
                      <div className="p-2 max-h-[70vh] overflow-y-auto">
                        {OTHERS_ITEMS.map(({ to, icon: Icon, title, desc, badge }) => (
                          <Link
                            key={to}
                            to={to}
                            onClick={() => setOthersOpen(false)}
                            className={`flex items-start gap-3 p-3 rounded-xl transition-all group ${
                              isActive(to)
                                ? 'bg-primary/10 border border-primary/20'
                                : 'hover:bg-white/5 border border-transparent'
                            }`}
                            role="menuitem"
                          >
                            <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/8 flex items-center justify-center shrink-0 group-hover:border-primary/30 group-hover:bg-primary/10 transition-all">
                              <Icon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <p className="text-sm font-semibold text-white truncate">{title}</p>
                                {badge && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                                    {badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 leading-snug mt-0.5 truncate">{desc}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: CTAs (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/identity-onboarding">
                <Button size="sm" variant="outline" className="border-accent/30 text-accent hover:bg-accent/10 rounded-xl">
                  <Shield className="w-3.5 h-3.5 mr-1" /> Scanează buletin
                </Button>
              </Link>
              <Link to="/start">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg shadow-primary/20">
                  Start a Case
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white p-1.5 rounded-lg hover:bg-white/5"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-[88%] max-w-sm md:hidden flex flex-col"
              style={{
                background: 'rgba(7, 14, 30, 0.98)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(59, 130, 246, 0.18)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-base font-bold text-white">NoQueue</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                {/* Primary CTAs */}
                <div className="space-y-2">
                  <Link to="/identity-onboarding" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-accent/30 text-accent hover:bg-accent/10 rounded-xl h-11">
                      <Shield className="w-4 h-4 mr-2" /> Scanează buletin
                    </Button>
                  </Link>
                  <Link to="/start" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-11 shadow-lg shadow-primary/20">
                      Start a Case
                    </Button>
                  </Link>
                </div>

                {/* 3 pillars */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                    Navigare principală
                  </p>
                  <div className="space-y-1">
                    {[
                      { to: '/', icon: Zap, label: 'NoQueue AI', accent: true },
                      { to: '/profile', icon: User, label: 'Cont' },
                    ].map(({ to, icon: Icon, label, accent }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                          isActive(to)
                            ? 'bg-primary/15 text-white border border-primary/25'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${accent ? 'text-primary' : ''}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Altele items */}
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">
                    Altele
                  </p>
                  <div className="space-y-1">
                    {OTHERS_ITEMS.map(({ to, icon: Icon, title, badge }) => (
                      <Link
                        key={to}
                        to={to}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                          isActive(to)
                            ? 'bg-primary/10 text-white border border-primary/20'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-primary/80" />
                        <span className="text-sm flex-1">{title}</span>
                        {badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-bold">
                            {badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-white/5 flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3 text-primary/70" />
                <span className="text-[10px] text-slate-500">Demo MVP · ClujHackathon 2026</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}