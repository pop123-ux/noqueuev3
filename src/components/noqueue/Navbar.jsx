import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, User } from 'lucide-react';
import OthersDropdown from '@/components/layout/OthersDropdown';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: 'rgba(11, 15, 25, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-14">

          {/* LEFT — Brand */}
          <Link to="/" className="flex items-center gap-2.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50 rounded-lg">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
            >
              <Zap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-white tracking-tight">NoQueue</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full hidden sm:inline"
              style={{
                color: '#60a5fa',
                background: 'rgba(37,99,235,0.12)',
                border: '1px solid rgba(37,99,235,0.25)',
              }}
            >
              ClujHackathon2026
            </span>
          </Link>

          {/* RIGHT — Actions */}
          <div className="flex items-center gap-1">
            <OthersDropdown />

            {/* User avatar */}
            <Link
              to="/profile"
              aria-label="Profil utilizator"
              className="w-8 h-8 rounded-lg flex items-center justify-center ml-1 text-slate-400 hover:text-white hover:bg-white/[0.06] transition-all focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/50"
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