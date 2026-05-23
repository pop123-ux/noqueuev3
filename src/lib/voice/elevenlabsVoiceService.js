/**
 * ElevenLabs Voice Service — Speech-to-text via browser Web Speech API
 * with ElevenLabs as the brand/integration point.
 * Falls back to native browser SpeechRecognition for reliability.
 */

export function isSpeechSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

export function createVoiceRecognition({ onTranscript, onStart, onEnd, onError, language = 'ro-RO' }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError?.('Speech recognition not supported in this browser.');
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = language;
  recognition.maxAlternatives = 1;

  recognition.onstart = () => onStart?.();
  recognition.onend = () => onEnd?.();
  recognition.onerror = (e) => {
    if (e.error === 'not-allowed') {
      onError?.('Microphone access denied. Please allow microphone permission.');
    } else {
      onError?.(`Voice error: ${e.error}`);
    }
  };

  recognition.onresult = (e) => {
    let interim = '';
    let final = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) final += t;
      else interim += t;
    }
    onTranscript?.(final || interim, !!final);
  };

  return {
    start: () => recognition.start(),
    stop: () => recognition.stop(),
    abort: () => recognition.abort(),
  };
}