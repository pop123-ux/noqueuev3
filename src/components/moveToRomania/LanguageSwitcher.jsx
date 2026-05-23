/**
 * Compact language switcher for Move to Romania
 */
import React from 'react';
import { LANGUAGES } from '@/lib/moveToRomania/translations';

export default function LanguageSwitcher({ lang, onChange }) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-2xl border border-white/8" style={{ background: 'rgba(255,255,255,0.03)' }}>
      {LANGUAGES.map(l => (
        <button
          key={l.code}
          onClick={() => onChange(l.code)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            lang === l.code ? 'bg-primary text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>{l.flag}</span>
          <span className="hidden sm:inline">{l.label}</span>
        </button>
      ))}
    </div>
  );
}