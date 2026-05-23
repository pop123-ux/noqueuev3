import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X } from 'lucide-react';
import { createVoiceRecognition, isSpeechSupported } from '@/lib/voice/elevenlabsVoiceService';

export default function VoiceInputButton({ onTranscript, language = 'ro-RO' }) {
  const [isRecording, setIsRecording] = useState(false);
  const [interim, setInterim] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const supported = isSpeechSupported();

  const startRecording = useCallback(() => {
    setError(null);
    setInterim('');

    const rec = createVoiceRecognition({
      language,
      onStart: () => setIsRecording(true),
      onEnd: () => {
        setIsRecording(false);
        setInterim('');
      },
      onError: (msg) => {
        setError(msg);
        setIsRecording(false);
      },
      onTranscript: (text, isFinal) => {
        setInterim(text);
        if (isFinal && text.trim()) {
          onTranscript?.(text.trim());
          setInterim('');
        }
      },
    });

    if (rec) {
      recognitionRef.current = rec;
      rec.start();
    }
  }, [language, onTranscript]);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    setInterim('');
  }, []);

  if (!supported) return null;

  return (
    <div className="relative flex items-center">
      {/* Interim text bubble */}
      <AnimatePresence>
        {interim && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute bottom-full mb-2 right-0 bg-slate-800 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-slate-300 whitespace-nowrap max-w-[200px] truncate shadow-lg"
          >
            <span className="text-primary mr-1">●</span>
            {interim}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error tooltip */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-full mb-2 right-0 bg-destructive/20 border border-destructive/30 rounded-xl px-3 py-1.5 text-xs text-destructive whitespace-nowrap max-w-[220px] shadow-lg"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mic button */}
      <motion.button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        whileTap={{ scale: 0.9 }}
        className={`relative w-10 h-10 rounded-2xl flex items-center justify-center transition-all shrink-0 ${
          isRecording
            ? 'bg-destructive/20 border border-destructive/40 text-destructive'
            : 'bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
        }`}
        aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
        title={isRecording ? 'Tap to stop' : 'Voice input (ElevenLabs)'}
      >
        {/* Pulse ring when recording */}
        {isRecording && (
          <motion.span
            className="absolute inset-0 rounded-2xl border border-destructive/50"
            animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        )}

        {isRecording
          ? <MicOff className="w-4 h-4" />
          : <Mic className="w-4 h-4" />
        }
      </motion.button>
    </div>
  );
}