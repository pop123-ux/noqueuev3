import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap, Briefcase, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Chat', href: '#chat' },
  { label: 'Documents', href: '#documents' },
  { label: 'Workflows', href: '#workflows' },
  { label: 'Institutions', href: '#institutions' },
  { label: 'Map', href: '#map' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="#" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">NoQueue</span>
            <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Cluj</span>
          </a>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5"
              >
                {link.label}
              </a>
            ))}
            <Link to="/cases" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              My Cases
            </Link>
            <Link to="/appointments/watch" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5" />
              Alerts
            </Link>
            <Link to="/start">
              <Button size="sm" className="ml-3 bg-primary hover:bg-primary/90 text-white rounded-xl">
                Start a Case
              </Button>
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setOpen(!open)}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden glass border-t border-white/5 px-4 pb-4">
          {navLinks.map(link => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5"
            >
              {link.label}
            </a>
          ))}
          <Link to="/cases" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            My Cases
          </Link>
          <Link to="/appointments/watch" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            Appointment Alerts
          </Link>
          <Link to="/start" onClick={() => setOpen(false)}>
            <Button className="mt-3 w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
              Start a Case
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}