import React, { useState, useRef } from 'react';
import {
  Volume2,
  Mic,
  MicOff,
  Sparkles,
  Award,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  X,
  Target,
  Layers,
} from 'lucide-react';
import { LanguageOption, PronunciationResult } from '../types';

interface PronunciationCoachModalProps {
  initialText?: string;
  currentLanguage: LanguageOption;
  onClose: () => void;
  onRecordPractice?: () => void;
}

export const PronunciationCoachModal: React.FC<PronunciationCoachModalProps> = ({
  initialText = '',
  currentLanguage,
  onClose,
  onRecordPractice,
}) => {
  const [targetSentence, setTargetSentence] = useState(
    initialText || currentLanguage.samplePhrase
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingNative, setIsPlayingNative] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<PronunciationResult | null>(null);
  const [spokenText, setSpokenText] = useState('');

  const recognitionRef = useRef<any>(null);

  // Play Native Pronunciation via TTS
  const handlePlayNative = async () => {
    if (!targetSentence.trim()) return;
    setIsPlayingNative(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: targetSentence,
          voiceName: currentLanguage.defaultVoice,
          language: currentLanguage.speechCode.split('-')[0],
        }),
      });
      const data = await res.json();
      if (data.success && data.audio) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 24000 });
        const binaryString = atob(data.audio);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
          float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
        }
        const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
        audioBuffer.getChannelData(0).set(float32);
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => setIsPlayingNative(false);
      } else {
        throw new Error('TTS fallback');
      }
    } catch (e) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(targetSentence);
        utterance.lang = currentLanguage.speechCode;
        utterance.onend = () => setIsPlayingNative(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingNative(false);
      }
    }
  };

  const startRecordingPractice = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage.speechCode;
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpokenText('');
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSpokenText(transcript);
        analyzePronunciation(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const stopRecordingPractice = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const analyzePronunciation = async (userSpoken: string) => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/pronunciation-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetText: targetSentence,
          spokenText: userSpoken,
          language: currentLanguage.name,
        }),
      });
      const data = await res.json();
      if (data.success && data.feedback) {
        setFeedback(data.feedback);
        onRecordPractice?.();
      }
    } catch (e) {
      console.error('Pronunciation assessment failed:', e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-card-neon bg-[#140528]/95 backdrop-blur-2xl rounded-3xl max-w-xl w-full p-6 sm:p-7 shadow-[0_12px_40px_rgba(236,72,153,0.3)] border border-pink-500/30 text-white animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 shadow-[0_0_12px_rgba(236,72,153,0.25)]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Pronunciation & Phonetics Coach</h3>
              <p className="text-xs text-slate-400">AI Acoustic & Syllable Stress Analysis ({currentLanguage.name})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Target Sentence Input / Display */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
              Sentence to Practice:
            </label>
            <div className="relative">
              <textarea
                value={targetSentence}
                onChange={(e) => setTargetSentence(e.target.value)}
                rows={3}
                className="w-full p-4 rounded-2xl border border-white/10 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 bg-white/[0.04] placeholder:text-slate-500 transition-all"
                placeholder="Type or paste any sentence you want to master..."
              />
            </div>
          </div>

          {/* Controls: Listen to Native vs Record Yourself */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handlePlayNative}
              disabled={isPlayingNative || !targetSentence.trim()}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-pink-500/30 bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <Volume2 className={`w-4 h-4 ${isPlayingNative ? 'animate-pulse text-pink-200' : ''}`} />
              <span>{isPlayingNative ? 'Playing Model Voice...' : 'Listen to Native Speaker'}</span>
            </button>

            <button
              onClick={isRecording ? stopRecordingPractice : startRecordingPractice}
              disabled={isEvaluating || !targetSentence.trim()}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse'
                  : 'bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white'
              } disabled:opacity-50`}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{isRecording ? 'Listening... Tap to Evaluate' : 'Record Your Attempt'}</span>
            </button>
          </div>

          {/* User Spoken Transcript recognition */}
          {spokenText && (
            <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
              <span className="font-bold text-slate-400">Acoustics Recognized: </span>
              <span className="text-slate-200 font-medium italic">"{spokenText}"</span>
            </div>
          )}

          {/* Loading evaluation state */}
          {isEvaluating && (
            <div className="py-8 flex flex-col items-center justify-center gap-2.5">
              <div className="w-8 h-8 rounded-full border-2 border-pink-400 border-t-transparent animate-spin" />
              <span className="text-xs font-semibold text-slate-300">AI is analyzing phoneme accuracy and rhythm...</span>
            </div>
          )}

          {/* Feedback Output Display */}
          {feedback && !isEvaluating && (
            <div className="space-y-4 pt-2 border-t border-white/10 animate-in fade-in">
              
              {/* Score & Fluency Rating Header */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-pink-500/15 border border-pink-500/30">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-500/30 border border-pink-500/40 text-pink-300 font-black text-xl flex items-center justify-center shadow-xs">
                    {feedback.score}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {feedback.score >= 85 ? 'Outstanding Pronunciation!' : feedback.score >= 70 ? 'Great Clarity!' : 'Good Effort, Keep Practicing!'}
                    </div>
                    <div className="text-[11px] text-pink-300 font-medium">Fluency: {feedback.fluency}</div>
                  </div>
                </div>

                <Award className="w-8 h-8 text-pink-400 opacity-60" />
              </div>

              {/* Phonetics & Syllables */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    IPA / Phonetic Guide
                  </div>
                  <div className="font-mono text-cyan-300 font-semibold">{feedback.phoneticTranscription}</div>
                </div>

                {feedback.syllableBreakdown && (
                  <div className="p-3 rounded-xl bg-white/[0.04] border border-white/10 text-xs">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Syllable Stress
                    </div>
                    <div className="font-semibold text-slate-200">{feedback.syllableBreakdown}</div>
                  </div>
                )}
              </div>

              {/* Accuracy Feedback Note */}
              <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300 leading-relaxed">
                <div className="font-bold text-white mb-1">Coach Observations:</div>
                {feedback.accuracyFeedback}
              </div>

              {/* Targeted Drills */}
              {feedback.drills && feedback.drills.length > 0 && (
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Recommended Sound Drills
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {feedback.drills.map((drill, idx) => (
                      <button
                        key={idx}
                        onClick={() => setTargetSentence(drill)}
                        className="px-3 py-1.5 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-pink-300 text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                        title="Click to load drill phrase"
                      >
                        {drill} ↗
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
