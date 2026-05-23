/**
 * MainApp — 2-tab mobile-first app shell
 * Tab 1: Help (AI Civic Assistant)
 * Tab 2: Documents (Vault)
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, FolderLock } from 'lucide-react';
import HelpTab from '@/components/app/HelpTab';
import DocumentsTab from '@/components/app/DocumentsTab';

const TABS = [
  { key: 'help',      label: 'Help',      Icon: MessageCircle },
  { key: 'documents', label: 'Documents', Icon: FolderLock },
];

export default function MainApp() {
  const [activeTab, setActiveTab] = useState('help');

  // ── Swipe handling (mobile only) ─────────────────────────────────
  const touchStartX = useRef(null);
  const tabOrder = ['help', 'documents'];

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(dx) < 50) return; // ignore tiny swipes
    const idx = tabOrder.indexOf(activeTab);
    if (dx < 0 && idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]); // swipe left → next
    if (dx > 0 && idx > 0) setActiveTab(tabOrder[idx - 1]); // swipe right → prev
  };

  return (
    <div
      className="fixed inset-0 flex flex-col"
      style={{ background: '#0A0A0F' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Content area — fills between top (0) and bottom tab bar */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'help' ? -24 : 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'help' ? 24 : -24 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute inset-0 overflow-y-auto"
          >
            {activeTab === 'help' && <HelpTab />}
            {activeTab === 'documents' && <DocumentsTab />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar */}
      <div
        className="shrink-0 flex items-stretch"
        style={{
          background: '#13131A',
          borderTop: '1px solid #1E1E2E',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {TABS.map(({ key, label, Icon }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-3 transition-all"
              style={{ color: active ? '#3B82F6' : '#475569' }}
            >
              <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-semibold tracking-wide">{label}</span>
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 h-0.5 w-12 rounded-full"
                  style={{ background: '#3B82F6' }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}