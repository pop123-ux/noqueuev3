import React from 'react';
import { Zap, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold text-white">NoQueue Cluj</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              An AI-powered civic navigation layer for Romanian bureaucracy. Built for ClujHackathon2026.
            </p>
          </div>

          {/* Hackathon */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Hackathon</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>ClujHackathon2026 — AI Civic Innovation</li>
              <li>Category: Digital Romania</li>
              <li>Team: NoQueue</li>
            </ul>
          </div>

          {/* GitHub */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-3">Source Code</h4>
            <a
              href="https://github.com/pop123-ux/noqueue"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              <Github className="w-4 h-4" />
              github.com/pop123-ux/noqueue
              <ExternalLink className="w-3 h-3" />
            </a>
            <p className="text-xs text-slate-500 mt-2">
              Branch: feature/realistic-romanian-bureaucracy
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-[10px] text-slate-500 text-center sm:text-left">
              ⚖️ Legal disclaimer: This app provides civic guidance only, not legal advice. Please verify final requirements with the official institution before submitting.
            </p>
            <p className="text-[10px] text-slate-600">
              © 2026 NoQueue. Hackathon MVP.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}