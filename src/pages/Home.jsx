/**
 * Home — Civic OS · 3-tab layout
 * NoQueue | Chats | Documents
 */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CivicNavbar from '@/components/layout/CivicNavbar';
import NoQueueTab from '@/components/tabs/NoQueueTab';
import ChatsTab from '@/components/tabs/ChatsTab';
import DocumentsTab from '@/components/tabs/DocumentsTab';

const TABS = [
  { id: 'noqueue',   label: 'NoQueue' },
  { id: 'chats',     label: 'Chats' },
  { id: 'documents', label: 'Documente' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('noqueue');

  return (
    <div className="min-h-screen font-inter" style={{ background: '#0B0F19', color: '#f8fafc' }}>
      <CivicNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'noqueue' && (
            <motion.div key="noqueue"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}>
              <NoQueueTab />
            </motion.div>
          )}
          {activeTab === 'chats' && (
            <motion.div key="chats"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}>
              <ChatsTab />
            </motion.div>
          )}
          {activeTab === 'documents' && (
            <motion.div key="documents"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}>
              <DocumentsTab />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}