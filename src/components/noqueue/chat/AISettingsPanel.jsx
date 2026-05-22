import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  toneOptions, responseStyleOptions, guidanceModeOptions, languageOptions
} from '@/lib/data/aiPersonality';

function OptionGroup({ label, options, value, onChange, compact = false }) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{label}</p>
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
              value === opt.value
                ? 'bg-primary/20 border border-primary/40 text-primary'
                : 'bg-white/[0.03] border border-white/5 text-slate-300 hover:border-white/15 hover:bg-white/[0.06]'
            }`}
          >
            {opt.icon && <span className="text-base">{opt.icon}</span>}
            {opt.flag && <span className="text-base">{opt.flag}</span>}
            <div>
              <div className="font-medium">{opt.label}</div>
              {opt.description && <div className="text-xs text-slate-500">{opt.description}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AISettingsPanel({ settings, onChange, onClose }) {
  const [customInstructions, setCustomInstructions] = useState(settings.customInstructions || '');

  function update(key, val) {
    onChange({ ...settings, [key]: val });
  }

  function saveCustom() {
    update('customInstructions', customInstructions);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.97 }}
      className="absolute right-0 top-full mt-2 w-80 sm:w-96 glass-card rounded-2xl border border-white/10 z-50 shadow-2xl overflow-hidden"
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-white">AI Settings</span>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-5 max-h-[70vh] overflow-y-auto space-y-1">
        <OptionGroup
          label="AI Tone"
          options={toneOptions}
          value={settings.tone}
          onChange={v => update('tone', v)}
        />

        <OptionGroup
          label="Response Style"
          options={responseStyleOptions}
          value={settings.responseStyle}
          onChange={v => update('responseStyle', v)}
          compact
        />

        <OptionGroup
          label="Guidance Mode"
          options={guidanceModeOptions}
          value={settings.guidanceMode}
          onChange={v => update('guidanceMode', v)}
          compact
        />

        <OptionGroup
          label="Language"
          options={languageOptions}
          value={settings.language}
          onChange={v => update('language', v)}
          compact
        />

        {/* Accessibility */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Accessibility</p>
          <div className="space-y-2">
            {[
              { key: 'largerText', label: '🔠 Larger text' },
              { key: 'simplifiedExplanations', label: '💡 Simplified explanations' },
              { key: 'highContrast', label: '⚡ High contrast mode' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/5 cursor-pointer">
                <span className="text-sm text-slate-300">{label}</span>
                <div
                  onClick={() => update(key, !settings[key])}
                  className={`w-10 h-5 rounded-full transition-colors relative ${settings[key] ? 'bg-primary' : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${settings[key] ? 'right-0.5' : 'left-0.5'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Custom instructions */}
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Custom Instructions</p>
          <Textarea
            value={customInstructions}
            onChange={e => setCustomInstructions(e.target.value)}
            placeholder='e.g. "Always explain things simply." or "I prefer short answers."'
            className="bg-navy-700 border-white/10 text-sm text-white placeholder:text-slate-500 rounded-xl resize-none"
            rows={3}
          />
          <Button
            onClick={saveCustom}
            size="sm"
            className="mt-2 w-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-xl"
          >
            Save Instructions
          </Button>
        </div>
      </div>
    </motion.div>
  );
}