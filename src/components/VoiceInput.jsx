import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square } from 'lucide-react';

const isSupported = typeof window !== 'undefined' &&
  ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

/**
 * VoiceInput — inline mic button with EN/HI toggle.
 * @param onResult  - called with the final transcript string
 * @param defaultLang - 'en' | 'hi'  (follows app language, but user can switch per-field)
 */
export default function VoiceInput({ onResult, defaultLang = 'en' }) {
  const [listening, setListening]     = useState(false);
  const [transcript, setTranscript]   = useState('');
  const [error, setError]             = useState('');
  const [voiceLang, setVoiceLang]     = useState(defaultLang);
  const recognitionRef                = useRef(null);
  const transcriptRef                 = useRef('');

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const startListening = () => {
    if (!isSupported) {
      setError('Use Chrome/Edge for voice input.');
      return;
    }
    setError('');
    transcriptRef.current = '';
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang            = voiceLang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.continuous      = false;
    recognition.interimResults  = true;

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      transcriptRef.current = text;
      setTranscript(text);
    };

    recognition.onend = () => {
      setListening(false);
      if (transcriptRef.current) onResult(transcriptRef.current);
    };

    recognition.onerror = (e) => {
      setListening(false);
      if (e.error !== 'no-speech') setError(`Mic error: ${e.error}`);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    setTranscript('');
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setListening(false);
    if (transcriptRef.current) onResult(transcriptRef.current);
  };

  return (
    <div className="flex items-center gap-1">
      {/* EN / HI toggle — only visible when not recording */}
      {!listening && (
        <button
          type="button"
          onClick={() => setVoiceLang(v => v === 'en' ? 'hi' : 'en')}
          title={voiceLang === 'en' ? 'Switch to Hindi voice' : 'Switch to English voice'}
          className="text-[9px] font-bold px-2 py-1 rounded border border-slate-200 text-slate-400 hover:text-[#062E6F] hover:border-[#062E6F]/40 transition-colors select-none min-h-[36px] md:min-h-0 md:px-1.5 md:py-0.5"
        >
          {voiceLang === 'en' ? 'EN' : 'हि'}
        </button>
      )}

      {/* Mic button */}
      <button
        type="button"
        onClick={listening ? stopListening : startListening}
        title={listening
          ? 'Stop recording'
          : `Voice input (${voiceLang === 'en' ? 'English' : 'हिंदी'})`}
        className={`flex items-center justify-center rounded-full transition-all min-h-[36px] min-w-[36px] md:min-h-0 md:min-w-0 md:p-1.5 p-2.5 ${
          listening
            ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200'
            : 'bg-[#062E6F]/10 text-[#062E6F] hover:bg-[#062E6F]/20 md:bg-slate-100 md:text-slate-500 md:hover:bg-[#062E6F]/10 md:hover:text-[#062E6F]'
        }`}
      >
        {listening ? <Square className="h-4 w-4 md:h-3.5 md:w-3.5" /> : <Mic className="h-4 w-4 md:h-3.5 md:w-3.5" />}
      </button>

      {/* Status */}
      {listening && (
        <span className="text-[10px] text-red-500 font-semibold animate-pulse flex items-center gap-1 whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
          {voiceLang === 'hi' ? 'सुन रहे हैं…' : 'Listening…'}
        </span>
      )}
      {transcript && !listening && (
        <span className="text-[10px] text-emerald-600 font-semibold truncate max-w-[120px]" title={transcript}>
          ✓ {transcript}
        </span>
      )}
      {error && <span className="text-[10px] text-red-500 truncate max-w-[120px]">{error}</span>}
    </div>
  );
}
