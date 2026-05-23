/**
 * CopilotSuggestions — quick-start prompts when conversation is empty
 */
import React from 'react';
import { Sparkles, FileWarning, Calendar, MapPin, HelpCircle } from 'lucide-react';

const SUGGESTIONS = [
  { icon: FileWarning, text: 'Ce documente expiră în curând?' },
  { icon: Calendar, text: 'Când e cel mai bun moment să merg la primărie?' },
  { icon: MapPin, text: 'Am nevoie să-mi schimb adresa. Ce trebuie să fac?' },
  { icon: HelpCircle, text: 'Explică-mi procedura pentru pașaport.' },
];

export default function CopilotSuggestions({ onPick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4">
      <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4 glow-blue">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h3 className="text-xl font-bold text-white mb-1.5 text-center">Bună! Sunt Civic Copilot.</h3>
      <p className="text-sm text-slate-400 text-center max-w-md mb-6">
        Asistentul tău personal pentru documente, instituții și proceduri românești. Cunosc datele tale din Identity Vault și pot răspunde personalizat.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-2xl">
        {SUGGESTIONS.map(({ icon: Icon, text }) => (
          <button
            key={text}
            onClick={() => onPick(text)}
            className="flex items-center gap-2.5 px-4 py-3 rounded-2xl text-left text-sm text-slate-300 transition-all hover:bg-white/8 hover:border-primary/30"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <Icon className="w-4 h-4 text-accent shrink-0" />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </div>
  );
}