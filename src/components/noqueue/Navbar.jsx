import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Zap, Briefcase, User, Shield, FolderOpen, Globe2, FileSearch, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navLinks = [
  { label: 'Chat', href: '#chat' },
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
            <Link to="/os" className="px-3 py-2 text-sm text-white font-semibold transition-colors rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-primary" />
              <span className="text-primary">OS</span>
            </Link>
            <Link to="/life-events" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Life Events
            </Link>
            <Link to="/cases" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5" />
              My Cases
            </Link>
            <Link to="/vault" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Seif
            </Link>
            <Link to="/digital-vault" className="px-3 py-2 text-sm text-white font-semibold transition-colors rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-accent" />
              <span className="text-accent">Vault</span>
            </Link>
            <Link to="/smart-doc" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <FileSearch className="w-3.5 h-3.5" />
              Smart Doc
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-bold">NEW</span>
            </Link>
            <Link to="/move-to-romania" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <Globe2 className="w-3.5 h-3.5" />
              Move to RO
            </Link>
            <Link to="/profile" className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors rounded-lg hover:bg-white/5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Cont
            </Link>
            <Link to="/identity-onboarding">
              <Button size="sm" variant="outline" className="ml-3 border-accent/30 text-accent hover:bg-accent/10 rounded-xl">
                <Shield className="w-3.5 h-3.5 mr-1" /> Scanează buletin
              </Button>
            </Link>
            <Link to="/start">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-white rounded-xl">
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
          <Link to="/os" onClick={() => setOpen(false)} className="block py-3 text-sm text-primary font-semibold border-b border-white/5">
            🟦 NoQueue OS
          </Link>
          <Link to="/life-events" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            ✨ Life Events
          </Link>
          <Link to="/cases" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            My Cases
          </Link>
          <Link to="/digital-vault" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            🗂️ Digital Vault
          </Link>
          <Link to="/smart-doc" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            🔍 Smart Doc <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/20 text-accent font-bold ml-1">NEW</span>
          </Link>
          <Link to="/move-to-romania" onClick={() => setOpen(false)} className="block py-3 text-sm text-slate-300 hover:text-white border-b border-white/5">
            🌍 Move to Romania
          </Link>
          <Link to="/identity-onboarding" onClick={() => setOpen(false)}>
            <Button variant="outline" className="mt-3 w-full border-accent/30 text-accent hover:bg-accent/10 rounded-xl">
              🆔 Scanează buletin
            </Button>
          </Link>
          <Link to="/start" onClick={() => setOpen(false)}>
            <Button className="mt-2 w-full bg-primary hover:bg-primary/90 text-white rounded-xl">
              Start a Case
            </Button>
          </Link>
        </div>
      )}
    </nav>
  );
}