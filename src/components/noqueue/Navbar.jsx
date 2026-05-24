import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Zap, User, Shield, Globe2,
  FileSearch, Sparkles, Layers, MapPin, ChevronDown,
  PlayCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Warm Apple-style 3-pillar navbar: NoQueue AI · Cont · Altele
 * Right side: Scanează buletin · Start a Case
 * Note: items already covered by Cont (Dosarele mele, Seiful de Identitate,
 * Vault digital) are NOT exposed here — they live inside /profile tabs.
 */

const OTHERS_ITEMS = [
  { to: '/move-to-romania', icon: Globe2, title: 'Move to Romania', desc: 'Asistent pentru integrare și relocare' },
  { to: '/life-events', icon: Sparkles, title: 'Evenimente de viață', desc: 'Pași ghidați pentru situații importante' },
  { to: '/#map', icon: MapPin, title: 'Hartă & Programări', desc: 'Locații, trasee și disponibilitate', isHash: true },
  { to: '/smart-doc', icon: FileSearch, title: 'Smart Documents', desc: 'Documente generate automat', badge: 'NEW' },
  { to: '/os', icon: Layers, title: 'Civic OS', desc: 'Modul experimental pentru infrastructură civică' },
  { to: '/run-demo', icon: PlayCircle, title: 'Demo run', desc: 'Parcurge fluxul complet pentru juriu' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const othersRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onClick = (e) => {
      if (othersRef.current && !othersRef.current.contains(e.target)) setOthersOpen(false);
    };
    if (othersOpen) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [othersOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setOthersOpen(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;
  const isOthersActive = OTHERS_ITEMS.some(i => !i.isHash && isActive(i.to));

  const renderOthersLink = (item, onClick) => {
    const { to, icon: Icon, title, desc, badge, isHash } = item;
    const className = `flex items-start gap-3 p-3 rounded-2xl transition-all group ${
      !isHash && isActive(to)
        ? 'bg-[rgba(154,164,56,0.14)] border border-[rgba(154,164,56,0.28)]'
        : 'hover:bg-[rgba(154,164,56,0.08)] border border-transparent'
    }`;
    const inner = (
      <>
        <div className="w-9 h-9 rounded-xl bg-[rgba(154,164,56,0.14)] border border-[rgba(154,164,56,0.22)] flex items-center justify-center shrink-0 group-hover:bg-[rgba(154,164,56,0.22)] transition-all">
          <Icon className="w-4 h-4 text-olive-700" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p className="text-sm font-semibold text-navy-900 truncate">{title}</p>
            {badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-olive-500/20 text-olive-700 font-bold">
                {badge}
              </span>
            )}
          </div>
          {desc && <p className="text-[11px] text-navy-700 leading-snug mt-0.5 truncate">{desc}</p>}
        </div>
      </>
    );
    if (isHash) {
      return (
        <a key={to} href={to} onClick={onClick} className={className}>{inner}</a>
      );
    }
    return (
      <Link key={to} to={to} onClick={onClick} className={className}>{inner}</Link>
    );
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{
          background: 'rgba(255, 250, 238, 0.78)',
          backdropFilter: 'blur(18px)',
          WebkitBackdropFilter: 'blur(18px)',
          borderColor: 'rgba(31, 36, 20, 0.10)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left: Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-xl bg-olive-500 flex items-center justify-center shadow-md" style={{ boxShadow: '0 6px 16px rgba(154,164,56,0.35)' }}>
                <Zap className="w-4 h-4 text-cream-50" />
              </div>
              <span className="text-lg font-bold text-navy-900">NoQueue</span>
              <span className="hidden sm:inline text-[10px] font-bold text-olive-700 bg-[rgba(154,164,56,0.14)] border border-[rgba(154,164,56,0.28)] px-2 py-0.5 rounded-full">
                Demo MVP
              </span>
            </Link>

            {/* Center: 3-pillar nav (desktop) */}
            <div className="hidden md:flex items-center gap-1">
              <Link
                to="/"
                className={`px-3.5 py-2 text-sm rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/')
                    ? 'bg-[rgba(154,164,56,0.16)] text-navy-900 font-semibold'
                    : 'text-navy-700 hover:text-navy-900 hover:bg-[rgba(154,164,56,0.08)]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-olive-600" />
                NoQueue AI
              </Link>

              <Link
                to="/profile"
                className={`px-3.5 py-2 text-sm rounded-xl transition-all flex items-center gap-1.5 ${
                  isActive('/profile')
                    ? 'bg-[rgba(154,164,56,0.16)] text-navy-900 font-semibold'
                    : 'text-navy-700 hover:text-navy-900 hover:bg-[rgba(154,164,56,0.08)]'
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
                      ? 'bg-[rgba(154,164,56,0.16)] text-navy-900 font-semibold'
                      : 'text-navy-700 hover:text-navy-900 hover:bg-[rgba(154,164,56,0.08)]'
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
                      className="absolute right-0 mt-2 w-[380px] rounded-3xl overflow-hidden"
                      style={{
                        background: 'rgba(255, 250, 238, 0.95)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        border: '1px solid rgba(31, 36, 20, 0.12)',
                        boxShadow: '0 24px 64px rgba(73, 63, 34, 0.22)',
                      }}
                      role="menu"
                    >
                      <div className="px-4 py-3 border-b border-[rgba(31,36,20,0.08)]">
                        <p className="text-[10px] font-bold text-navy-700 uppercase tracking-wider">
                          Toate modulele
                        </p>
                      </div>
                      <div className="p-2 max-h-[70vh] overflow-y-auto">
                        {OTHERS_ITEMS.map(item => renderOthersLink(item, () => setOthersOpen(false)))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Right: CTAs (desktop) */}
            <div className="hidden md:flex items-center gap-2">
              <Link to="/identity-onboarding">
                <Button size="sm" variant="outline" className="rounded-xl border-[rgba(31,36,20,0.16)] bg-cream-50/60 text-navy-900 hover:bg-[rgba(154,164,56,0.10)]">
                  <Shield className="w-3.5 h-3.5 mr-1 text-olive-700" /> Scanează buletin
                </Button>
              </Link>
              <Link to="/start">
                <Button size="sm" className="rounded-xl bg-olive-500 hover:bg-olive-600 text-cream-50" style={{ boxShadow: '0 8px 22px rgba(154,164,56,0.32)' }}>
                  Start a Case
                </Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-navy-900 p-1.5 rounded-lg hover:bg-[rgba(154,164,56,0.10)]"
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
              className="fixed inset-0 z-[60] bg-[rgba(31,36,20,0.35)] backdrop-blur-sm md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed top-0 right-0 bottom-0 z-[61] w-[88%] max-w-sm md:hidden flex flex-col"
              style={{
                background: 'rgba(255, 248, 232, 0.98)',
                backdropFilter: 'blur(20px)',
                borderLeft: '1px solid rgba(31, 36, 20, 0.12)',
              }}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(31,36,20,0.08)]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-olive-500 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-cream-50" />
                  </div>
                  <span className="text-base font-bold text-navy-900">NoQueue</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg text-navy-700 hover:text-navy-900 hover:bg-[rgba(154,164,56,0.10)]"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">
                {/* Primary CTAs */}
                <div className="space-y-2">
                  <Link to="/identity-onboarding" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full h-11 rounded-xl border-[rgba(31,36,20,0.16)] bg-cream-50 text-navy-900 hover:bg-[rgba(154,164,56,0.10)]">
                      <Shield className="w-4 h-4 mr-2 text-olive-700" /> Scanează buletin
                    </Button>
                  </Link>
                  <Link to="/start" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full h-11 rounded-xl bg-olive-500 hover:bg-olive-600 text-cream-50" style={{ boxShadow: '0 8px 22px rgba(154,164,56,0.32)' }}>
                      Start a Case
                    </Button>
                  </Link>
                </div>

                {/* 3 pillars */}
                <div>
                  <p className="text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-2 px-1">
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
                            ? 'bg-[rgba(154,164,56,0.16)] text-navy-900 font-semibold'
                            : 'text-navy-700 hover:text-navy-900 hover:bg-[rgba(154,164,56,0.08)]'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${accent ? 'text-olive-600' : ''}`} />
                        <span className="text-sm font-medium">{label}</span>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Altele items */}
                <div>
                  <p className="text-[10px] font-bold text-navy-700 uppercase tracking-wider mb-2 px-1">
                    Altele
                  </p>
                  <div className="space-y-1">
                    {OTHERS_ITEMS.map(({ to, icon: Icon, title, badge, isHash }) => {
                      const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        !isHash && isActive(to)
                          ? 'bg-[rgba(154,164,56,0.14)] text-navy-900'
                          : 'text-navy-700 hover:text-navy-900 hover:bg-[rgba(154,164,56,0.08)]'
                      }`;
                      const inner = (
                        <>
                          <Icon className="w-4 h-4 text-olive-700" />
                          <span className="text-sm flex-1">{title}</span>
                          {badge && (
                            <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-olive-500/20 text-olive-700 font-bold">
                              {badge}
                            </span>
                          )}
                        </>
                      );
                      return isHash ? (
                        <a key={to} href={to} onClick={() => setMobileOpen(false)} className={cls}>{inner}</a>
                      ) : (
                        <Link key={to} to={to} onClick={() => setMobileOpen(false)} className={cls}>{inner}</Link>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[rgba(31,36,20,0.08)] flex items-center justify-center gap-1.5">
                <Shield className="w-3 h-3 text-olive-700" />
                <span className="text-[10px] text-navy-700">Demo MVP · ClujHackathon 2026</span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}