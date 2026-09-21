import React, { useState } from 'react';
import {
  BookmarkCheck,
  Volume2,
  Trash2,
  Sparkles,
  X,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SavedWord, LanguageOption } from '../types';

interface VocabularyDeckModalProps {
  savedWords: SavedWord[];
  currentLanguage: LanguageOption;
  onUpdateWordMastery: (id: string, level: number) => void;
  onDeleteWord: (id: string) => void;
  onClose: () => void;
}

export const VocabularyDeckModal: React.FC<VocabularyDeckModalProps> = ({
  savedWords,
  currentLanguage,
  onDeleteWord,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'flashcards'>('list');
  const [filterLang, setFilterLang] = useState<string>(currentLanguage.id);
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filteredWords = savedWords.filter((w) =>
    filterLang === 'all' ? true : w.language === filterLang
  );

  const currentCard = filteredWords[cardIndex];

  const handlePlayWordAudio = async (wordText: string, wordId: string) => {
    setPlayingId(wordId);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: wordText,
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
        source.onended = () => setPlayingId(null);
      } else {
        throw new Error('TTS fallback');
      }
    } catch (e) {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(wordText);
        utterance.lang = currentLanguage.speechCode;
        utterance.onend = () => setPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setPlayingId(null);
      }
    }
  };

  const handleNextCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev + 1) % filteredWords.length);
  };

  const handlePrevCard = () => {
    setIsFlipped(false);
    setCardIndex((prev) => (prev - 1 + filteredWords.length) % filteredWords.length);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-card-neon rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-[0_20px_60px_rgba(0,0,0,0.9)] border border-cyan-400/30 text-white animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-[1.5px] shadow-sm">
              <div className="w-full h-full rounded-2xl bg-[#090D1E] flex items-center justify-center text-cyan-300">
                <BookmarkCheck className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h3 className="font-black text-base text-white">Vocabulary Deck</h3>
              <p className="text-xs text-slate-300">
                {savedWords.length} saved words & phrases across active sessions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Tabs & Language Filter */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center bg-white/5 p-1 rounded-2xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-gradient-to-r from-pink-500/30 to-cyan-500/30 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => {
                setActiveTab('flashcards');
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'flashcards'
                  ? 'bg-gradient-to-r from-pink-500/30 to-cyan-500/30 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)] border border-pink-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Flashcard Review
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-300 font-semibold">Filter:</span>
            <select
              value={filterLang}
              onChange={(e) => {
                setFilterLang(e.target.value);
                setCardIndex(0);
                setIsFlipped(false);
              }}
              className="px-3 py-1.5 rounded-xl border border-cyan-400/30 bg-[#090D1E] text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              <option value="all">All Languages</option>
              <option value={currentLanguage.id}>{currentLanguage.name}</option>
            </select>
          </div>
        </div>

        {/* Content Area */}
        {filteredWords.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            <BookmarkCheck className="w-10 h-10 mx-auto text-slate-500 mb-2 opacity-50" />
            <p className="font-bold text-white">No saved vocabulary yet.</p>
            <p className="mt-1 text-slate-400">Click on any word inside your chat or voice transcript to look up and save it!</p>
          </div>
        ) : activeTab === 'list' ? (
          /* List Mode */
          <div className="mt-5 space-y-2.5 max-h-[55vh] overflow-y-auto pr-1">
            {filteredWords.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl glass-card hover:border-cyan-400/40 border border-white/10 transition-all flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-extrabold text-base text-white">{item.word}</span>
                    {item.phonetic && <span className="text-xs font-mono text-pink-400">{item.phonetic}</span>}
                    {item.partOfSpeech && (
                      <span className="text-[10px] px-2 py-0.5 bg-cyan-500/15 text-cyan-300 rounded-md font-bold border border-cyan-500/30">
                        {item.partOfSpeech}
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-cyan-300 mt-0.5">{item.translation}</div>
                  {item.definition && <div className="text-xs text-slate-300 line-clamp-1 mt-0.5">{item.definition}</div>}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handlePlayWordAudio(item.word, item.id)}
                    className={`p-2 rounded-xl border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                      playingId === item.id ? 'text-cyan-400 animate-pulse' : ''
                    }`}
                    title="Play pronunciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteWord(item.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Remove from deck"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Flashcard Mode */
          <div className="mt-6 flex flex-col items-center">
            
            {/* Card Progress */}
            <div className="text-xs font-bold text-slate-300 mb-3">
              Card {cardIndex + 1} of {filteredWords.length}
            </div>

            {/* Interactive Flashcard */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-md min-h-[220px] rounded-3xl p-8 bg-gradient-to-br from-pink-500/15 via-[#090D1E] to-cyan-500/15 backdrop-blur-2xl border border-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.25)] cursor-pointer flex flex-col items-center justify-center text-center transition-all hover:scale-[1.01] relative text-white"
            >
              <div className="absolute top-4 right-4 text-[10px] font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1">
                <RotateCcw className="w-3 h-3" />
                <span>Tap to flip</span>
              </div>

              {!isFlipped ? (
                /* Front */
                <div className="space-y-2">
                  <span className="text-[11px] font-black text-pink-400 uppercase tracking-wider">
                    {currentLanguage.name}
                  </span>
                  <div className="text-3xl font-black text-white">{currentCard.word}</div>
                  {currentCard.phonetic && (
                    <div className="text-sm font-mono text-cyan-300">{currentCard.phonetic}</div>
                  )}
                </div>
              ) : (
                /* Back */
                <div className="space-y-2 animate-in fade-in">
                  <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">
                    Meaning & Context
                  </span>
                  <div className="text-2xl font-black text-white">{currentCard.translation}</div>
                  {currentCard.partOfSpeech && (
                    <span className="inline-block text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                      {currentCard.partOfSpeech}
                    </span>
                  )}
                  {currentCard.definition && (
                    <p className="text-xs text-slate-300 max-w-xs mx-auto mt-1 leading-relaxed">
                      {currentCard.definition}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Flashcard Navigation */}
            <div className="mt-6 flex items-center gap-4">
              <button
                onClick={handlePrevCard}
                className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 shadow-sm cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <button
                onClick={() => handlePlayWordAudio(currentCard.word, currentCard.id)}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Volume2 className="w-4 h-4" />
                <span>Pronounce</span>
              </button>

              <button
                onClick={handleNextCard}
                className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-200 shadow-sm cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
