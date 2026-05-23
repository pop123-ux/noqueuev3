/**
 * HelpTab — AI Civic Assistant
 * Responds ONLY with document cards + institution map card.
 * Off-topic messages get a single rejection line.
 * No conversational text, no filler.
 */
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Send, RefreshCw, CheckCircle2, XCircle,
  MapPin, Clock, Download, ExternalLink, AlertTriangle
} from 'lucide-react';
import { routeByText, detectSpecialIntent } from '@/lib/assistant/procedureRouter';
import VoiceInputButton from '@/components/assistant/VoiceInputButton';

const EXAMPLES = [
  'Am nevoie de pasaport urgent',
  'Mi-am pierdut buletinul',
  'Reînnoire permis auto',
  'Cazier judiciar',
];

// Civic keyword gate — must match at least one Romanian civic topic
const CIVIC_KEYWORDS = [
  'pasaport','passport','buletin','id','carte identitate','permis','conducere',
  'cazier','judiciar','fiscal','anaf','impozit','taxe','sanatate','cnas','cas',
  'nastere','certificat','casatorie','divort','adresa','domiciliu','inmatriculare',
  'parcare','urbanism','constructie','social','ajutor','dosar','act','document',
  'ghiseu','institutie','primarie','politie','registru','starea civila',
];
function isCivicMessage(text) {
  const lower = text.toLowerCase();
  return CIVIC_KEYWORDS.some(kw => lower.includes(kw));
}

// ── Document card ────────────────────────────────────────────────
function DocCard({ doc, index }) {
  // "have it" logic: we never actually have vault data here, so always show as required
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid #1E1E2E' }}
    >
      <XCircle className="w-4 h-4 shrink-0" style={{ color: '#ef4444' }} />
      <span className="flex-1 text-xs text-slate-200">{doc}</span>
      <button
        className="text-[10px] font-semibold px-2 py-1 rounded-lg shrink-0 transition-all"
        style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
      >
        Fill
      </button>
    </motion.div>
  );
}

// ── Inline map card (shown when physical presence required) ──────
function MapCard({ institution, address, hours }) {
  const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address || institution)}`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid #1E1E2E' }}
    >
      {/* Static map visual via OpenStreetMap embed */}
      <div
        className="w-full flex items-center justify-center relative"
        style={{ height: 100, background: '#13131A' }}
      >
        <iframe
          title="map"
          width="100%"
          height="100"
          frameBorder="0"
          scrolling="no"
          style={{ filter: 'invert(90%) hue-rotate(180deg)', pointerEvents: 'none' }}
          src={`https://www.openstreetmap.org/export/embed.html?bbox=23.56,46.74,23.63,46.78&layer=mapnik&marker=46.7600,23.5897`}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#3B82F6' }}>
            <MapPin className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
      </div>
      {/* Institution info */}
      <div className="px-3 py-2.5" style={{ background: '#13131A' }}>
        <p className="text-xs font-bold text-white mb-0.5">{institution}</p>
        <p className="text-[10px] text-slate-400 mb-0.5">{address}</p>
        {hours && <p className="text-[10px] text-slate-500 flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{hours}</p>}
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 mt-2 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg transition-all"
          style={{ background: '#3B82F6', color: '#fff' }}
        >
          <MapPin className="w-3 h-3" /> Indicații rutiere
        </a>
      </div>
    </motion.div>
  );
}

// ── Full workflow response block ─────────────────────────────────
function WorkflowResponse({ workflow }) {
  const needsPhysical = !workflow.online;

  // Real Cluj institution addresses
  const ADDRESSES = {
    'dep-cluj': { address: 'Str. Moților 3, Cluj-Napoca', hours: 'L–V 08:30–16:00' },
    'pasapoarte-cluj': { address: 'Str. Coposu 26, Cluj-Napoca', hours: 'L–V 08:00–16:00' },
    'drpciv-cluj': { address: 'Calea Dorobanților 99, Cluj-Napoca', hours: 'L–V 08:30–14:30' },
    'primaria-cluj': { address: 'Calea Moților 3, Cluj-Napoca', hours: 'L–V 08:30–16:00' },
    'anaf-cluj': { address: 'Str. Dorobanților 2, Cluj-Napoca', hours: 'L–V 08:30–16:30' },
    'cas-cluj': { address: 'Str. Republicii 34, Cluj-Napoca', hours: 'L–V 08:00–16:00' },
    'ipj-cluj': { address: 'Calea Moților 75, Cluj-Napoca', hours: 'L–V 08:00–20:00' },
    'starea-civila': { address: 'Str. Moților 3, Cluj-Napoca', hours: 'L–V 08:30–16:00' },
    'taxe-locale': { address: 'Str. Moților 7, Cluj-Napoca', hours: 'L–V 08:30–16:00' },
    'asistenta-sociala': { address: 'Str. Observatorului 129, Cluj-Napoca', hours: 'L–V 08:00–16:00' },
  };

  const instInfo = ADDRESSES[workflow.institutionId] || { address: 'Cluj-Napoca', hours: null };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3 w-full"
    >
      {/* Title chip */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide"
          style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.2)' }}
        >
          {workflow.title}
        </span>
        <span className="text-[10px] text-slate-500">{workflow.processingTime}</span>
        {workflow.urgency === 'critical' && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
            URGENT
          </span>
        )}
      </div>

      {/* Document cards */}
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Documente necesare</p>
        {workflow.documents.map((doc, i) => (
          <DocCard key={i} doc={doc} index={i} />
        ))}
      </div>

      {/* Common mistake warning */}
      {workflow.commonMistake && (
        <div
          className="flex items-start gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.2)' }}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-yellow-300">{workflow.commonMistake}</p>
        </div>
      )}

      {/* Map card — only if physical presence required */}
      {needsPhysical && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unde depui</p>
          <MapCard
            institution={workflow.institution}
            address={instInfo.address}
            hours={instInfo.hours}
          />
        </div>
      )}

      {/* Online badge if available */}
      {workflow.online && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}
        >
          <ExternalLink className="w-3.5 h-3.5" style={{ color: '#06b6d4' }} />
          <p className="text-[10px]" style={{ color: '#06b6d4' }}>
            Disponibil și online · {workflow.institution}
          </p>
        </div>
      )}
    </motion.div>
  );
}

// ── Off-topic rejection ──────────────────────────────────────────
function RejectionBubble() {
  return (
    <div
      className="px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-slate-400"
      style={{ background: '#13131A', border: '1px solid #1E1E2E', maxWidth: '85%' }}
    >
      Pot ajuta doar cu procese administrative românești.
    </div>
  );
}

// ── Chat message bubble ──────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
    >
      {isUser ? (
        <div
          className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-tr-sm text-sm text-white"
          style={{ background: '#3B82F6' }}
        >
          {msg.text}
        </div>
      ) : (
        <div className="w-full">
          {msg.type === 'workflow' && <WorkflowResponse workflow={msg.workflow} />}
          {msg.type === 'rejected' && <RejectionBubble />}
        </div>
      )}
    </motion.div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function HelpTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text: trimmed }]);
    setLoading(true);

    await new Promise(r => setTimeout(r, 280));

    // Gate: civic topic only
    if (!isCivicMessage(trimmed)) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'rejected' }]);
      setLoading(false);
      return;
    }

    // Route to workflow
    const workflow = routeByText(trimmed);
    if (workflow) {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'workflow', workflow }]);
    } else {
      // Unknown civic topic — still reject gracefully
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', type: 'rejected' }]);
    }
    setLoading(false);
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    sendMessage(input);
  };

  const reset = () => setMessages([]);

  return (
    <div className="flex flex-col h-full" style={{ background: '#0A0A0F' }}>
      {/* Header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-3"
        style={{ background: '#13131A', borderBottom: '1px solid #1E1E2E' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: '#3B82F6' }}>
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">NoQueue AI</p>
            <div className="flex items-center gap-1 text-[10px]" style={{ color: '#22c55e' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              Asistent civic activ
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={reset} className="flex items-center gap-1 text-xs text-slate-500 hover:text-white transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full gap-6 pb-8"
          >
            <div className="text-center">
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.2)' }}
              >
                <Zap className="w-8 h-8" style={{ color: '#3B82F6' }} />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Asistent Civic AI</h2>
              <p className="text-sm text-slate-500 max-w-xs text-center">
                Spune-mi ce act îți trebuie — primești instant lista de documente și instituția.
              </p>
            </div>
            <div className="w-full max-w-sm space-y-2">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold text-center mb-2">Încearcă</p>
              {EXAMPLES.map(ex => (
                <button
                  key={ex}
                  onClick={() => sendMessage(ex)}
                  className="w-full text-left px-4 py-3 rounded-2xl text-sm text-slate-300 hover:text-white transition-all active:scale-[0.98]"
                  style={{ background: '#13131A', border: '1px solid #1E1E2E' }}
                >
                  "{ex}"
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <>
            {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
            {loading && (
              <div className="flex gap-1 ml-1 mb-3">
                {[0, 1, 2].map(i => (
                  <motion.span
                    key={i}
                    className="w-2 h-2 rounded-full"
                    style={{ background: '#3B82F6' }}
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            )}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div
        className="shrink-0 px-4 pb-4 pt-3"
        style={{ background: '#13131A', borderTop: '1px solid #1E1E2E' }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ex: Am pierdut pașaportul…"
            disabled={loading}
            className="flex-1 text-sm text-white placeholder:text-slate-600 px-4 py-3 rounded-2xl focus:outline-none transition-colors"
            style={{ background: '#0A0A0F', border: '1px solid #1E1E2E' }}
          />
          <VoiceInputButton
            onTranscript={(t) => { setInput(t); sendMessage(t); }}
            language="ro-RO"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 transition-all disabled:opacity-30"
            style={{ background: '#3B82F6' }}
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}