import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  BookmarkPlus,
  Check,
  Sparkles,
  BookOpen,
  ArrowRight,
  Smile,
} from 'lucide-react';
import { LanguageOption, BeginnerPhrase } from '../types';
import { BEGINNER_FOUNDATIONS_DATA } from '../data/languages';

interface BeginnerFoundationsModalProps {
  isOpen?: boolean;
  onClose: () => void;
  currentLanguage: LanguageOption;
  onPracticePhraseInChat?: (phrase: string) => void;
  onPracticePhrasePronunciation?: (phrase: string) => void;
  onPracticePhrase?: (phrase: string) => void;
  onSaveWord: (word: string, translation: string, phonetic: string, sentence: string) => void;
  onStartCoachingTopic?: (topicStarter: string) => void;
}

export const BeginnerFoundationsModal: React.FC<BeginnerFoundationsModalProps> = ({
  isOpen = true,
  onClose,
  currentLanguage,
  onPracticePhraseInChat,
  onPracticePhrasePronunciation,
  onPracticePhrase,
  onSaveWord,
  onStartCoachingTopic,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Record<string, boolean>>({});
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.85);

  if (isOpen === false) return null;

  const phrases: BeginnerPhrase[] = BEGINNER_FOUNDATIONS_DATA[currentLanguage.id] || BEGINNER_FOUNDATIONS_DATA.spanish || [];
  const categories = ['All', 'Greetings', 'Essentials', 'Introductions', 'Survival', 'Numbers'];

  const filteredPhrases = selectedCategory === 'All'
    ? phrases
    : phrases.filter((p) => p.category === selectedCategory);

  const handlePlayAudio = async (phrase: BeginnerPhrase) => {
    setPlayingId(phrase.id);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: phrase.targetText.replace(/\(.*?\)/g, '').trim(),
          voiceName: currentLanguage.defaultVoice,
          language: currentLanguage.speechCode.split('-')[0],
          speed: playbackSpeed,
        }),
      });
      const data = await res.json();
      if (data.success && data.audio) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass({ sampleRate: 24000 });
        const binaryString = atob(data.audio);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
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
        source.playbackRate.value = playbackSpeed;
        source.connect(ctx.destination);
        source.start();
        source.onended = () => setPlayingId(null);
      } else {
        throw new Error('TTS fallback');
      }
    } catch (e) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(phrase.targetText.replace(/\(.*?\)/g, '').trim());
        utterance.lang = currentLanguage.speechCode;
        utterance.rate = playbackSpeed;
        utterance.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingId(null);
      }
    }
  };

  const handleSave = (phrase: BeginnerPhrase) => {
    onSaveWord(phrase.targetText, phrase.translation, phrase.phonetic, phrase.targetText);
    setSavedIds((prev) => ({ ...prev, [phrase.id]: true }));
    setTimeout(() => {
      setSavedIds((prev) => ({ ...prev, [phrase.id]: false }));
    }, 2500);
  };

  return (
    <div
      id="beginner-foundations-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="beginner-foundations-modal-container"
        className="bg-slate-900/85 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.7)] max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-white/15 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-500/20 via-purple-500/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-500/30 text-white flex items-center justify-center shadow-sm font-semibold text-lg">
              {currentLanguage.flag}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">
                  Zero-Knowledge Starter Kit
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 border border-pink-500/30 text-pink-300 font-medium shadow-[0_0_10px_rgba(236,72,153,0.2)]">
                  A0 Beginner Friendly
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Essential first words, phonetics, and survival phrases for {currentLanguage.name}
              </p>
            </div>
          </div>
          <button
            id="close-beginner-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Beginner Coaching Banner */}
        <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Starting from scratch?</strong> Listen to the native audio, repeat out loud, and test your pronunciation without fear!
            </span>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <span className="text-[11px] font-medium text-slate-400">Audio Speed:</span>
            <button
              id="speed-slow-btn"
              onClick={() => setPlaybackSpeed(0.75)}
              className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                playbackSpeed === 0.75
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 border border-white/15 text-amber-300 hover:bg-white/15'
              }`}
            >
              0.75x (Slow)
            </button>
            <button
              id="speed-normal-btn"
              onClick={() => setPlaybackSpeed(1.0)}
              className={`px-2 py-0.5 rounded text-xs font-semibold cursor-pointer transition-all ${
                playbackSpeed === 1.0
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 border border-white/15 text-amber-300 hover:bg-white/15'
              }`}
            >
              1.0x (Normal)
            </button>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              id={`cat-tab-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Phrase Cards Grid */}
        <div className="p-5 overflow-y-auto max-h-[60vh] space-y-3">
          {filteredPhrases.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No phrases found in this category.</p>
            </div>
          ) : (
            filteredPhrases.map((phrase) => (
              <div
                key={phrase.id}
                id={`phrase-card-${phrase.id}`}
                className="p-3.5 rounded-xl border border-white/10 hover:border-emerald-500/40 hover:bg-white/[0.06] bg-white/[0.03] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white tracking-wide">
                      {phrase.targetText}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300 font-mono">
                      /{phrase.phonetic}/
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                      {phrase.category}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-emerald-400">
                    {phrase.translation}
                  </p>

                  {phrase.literalBreakdown && (
                    <p className="text-xs text-slate-400 italic">
                      Breakdown: {phrase.literalBreakdown}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  {/* Play Audio Button */}
                  <button
                    id={`listen-btn-${phrase.id}`}
                    onClick={() => handlePlayAudio(phrase)}
                    title="Listen to native pronunciation"
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      playingId === phrase.id
                        ? 'bg-emerald-600 text-white animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                    }`}
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Listen</span>
                  </button>

                  {/* Practice Pronunciation Drill Button */}
                  <button
                    id={`practice-btn-${phrase.id}`}
                    onClick={() => {
                      const cleanText = phrase.targetText.replace(/\(.*?\)/g, '').trim();
                      if (onPracticePhrasePronunciation) {
                        onPracticePhrasePronunciation(cleanText);
                      } else if (onPracticePhrase) {
                        onPracticePhrase(cleanText);
                      }
                      onClose();
                    }}
                    title="Test your pronunciation with AI"
                    className="p-2 rounded-lg bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                    <span>Drill</span>
                  </button>

                  {/* Send to AI Chat Button */}
                  <button
                    id={`chat-btn-${phrase.id}`}
                    onClick={() => {
                      const cleanText = phrase.targetText.replace(/\(.*?\)/g, '').trim();
                      if (onPracticePhraseInChat) {
                        onPracticePhraseInChat(cleanText);
                      } else if (onStartCoachingTopic) {
                        onStartCoachingTopic(`Let's practice this phrase: ${cleanText}`);
                      }
                      onClose();
                    }}
                    title="Practice this phrase in interactive chat"
                    className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Chat</span>
                  </button>

                  {/* Save Word Button */}
                  <button
                    id={`save-btn-${phrase.id}`}
                    onClick={() => handleSave(phrase)}
                    title="Save to Flashcards"
                    className={`p-2 rounded-lg text-xs font-semibold flex items-center transition-colors cursor-pointer ${
                      savedIds[phrase.id]
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white/10 text-slate-300 hover:bg-white/20 border border-white/10'
                    }`}
                  >
                    {savedIds[phrase.id] ? (
                      <Check className="w-4 h-4 text-white" />
                    ) : (
                      <BookmarkPlus className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with One-Click Zero-Knowledge AI Coaching */}
        <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <Smile className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              Tip: Select <strong>A0 - Absolute Beginner</strong> in the top header for step-by-step bilingual coaching.
            </span>
          </div>

          <button
            id="start-zero-knowledge-session-btn"
            onClick={() => {
              const starterPrompt = "Hello! I am an absolute beginner with zero knowledge. Please teach me my first words step-by-step!";
              if (onPracticePhraseInChat) {
                onPracticePhraseInChat(starterPrompt);
              } else if (onStartCoachingTopic) {
                onStartCoachingTopic(starterPrompt);
              }
              onClose();
            }}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all cursor-pointer"
          >
            <span>Practice with AI Tutor</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
