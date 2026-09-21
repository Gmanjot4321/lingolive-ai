import React, { useState, useEffect } from 'react';
import {
  Volume2,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  BookOpen,
  X,
  CheckCircle2,
} from 'lucide-react';
import { SavedWord, LanguageOption } from '../types';
import { getInstantWordDetails, InstantWordEntry } from '../data/dictionary';

interface WordLookupModalProps {
  word: string;
  contextSentence: string;
  currentLanguage: LanguageOption;
  onClose: () => void;
  onSaveWord: (word: SavedWord) => void;
  isAlreadySaved: boolean;
}

export const WordLookupModal: React.FC<WordLookupModalProps> = ({
  word,
  contextSentence,
  currentLanguage,
  onClose,
  onSaveWord,
  isAlreadySaved,
}) => {
  // Initialize INSTANTLY from local dictionary - 0ms latency
  const instantInitial = getInstantWordDetails(word, contextSentence, currentLanguage.name);
  const [data, setData] = useState<InstantWordEntry | any>(instantInitial);
  const [isEnriching, setIsEnriching] = useState<boolean>(true);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [saved, setSaved] = useState(isAlreadySaved);

  useEffect(() => {
    let isMounted = true;
    const enrichWordDetails = async () => {
      try {
        const res = await fetch('/api/word-lookup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            word,
            sentence: contextSentence,
            targetLanguage: currentLanguage.name,
            nativeLanguage: 'English',
          }),
        });
        const result = await res.json();
        if (isMounted && result.success && result.data) {
          setData((prev: any) => ({
            ...prev,
            ...result.data,
            // Keep instant data if enriched has missing fields
            word: result.data.word || prev.word,
            translation: result.data.translation || prev.translation,
            definition: result.data.definition || prev.definition,
          }));
        }
      } catch (err) {
        console.error('Word background enrichment completed:', err);
      } finally {
        if (isMounted) setIsEnriching(false);
      }
    };

    enrichWordDetails();
    return () => {
      isMounted = false;
    };
  }, [word, contextSentence, currentLanguage.name]);

  const handlePlayAudio = () => {
    if (!data?.word) return;
    setIsPlayingAudio(true);

    // Instant local speech synthesis for 0ms audio playback
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(data.word);
      utterance.lang = currentLanguage.speechCode;
      utterance.rate = 0.9;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 1200);
    }
  };

  const handleSaveToDeck = () => {
    if (!data) return;
    const newWord: SavedWord = {
      id: `word-${Date.now()}`,
      word: data.word || word,
      translation: data.translation || '',
      partOfSpeech: data.partOfSpeech || '',
      phonetic: data.phonetic || '',
      definition: data.definition || '',
      contextSentence: contextSentence,
      language: currentLanguage.id,
      savedAt: new Date(),
      masteryLevel: 0,
    };
    onSaveWord(newWord);
    setSaved(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="glass-card-neon rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-[0_25px_70px_rgba(236,72,153,0.35)] border border-pink-500/30 text-white animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(236,72,153,0.4)]">
              <div className="w-full h-full rounded-xl bg-[#120726] flex items-center justify-center text-pink-300">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base text-white">Instant Word Lookup</h3>
              </div>
              <p className="text-[11px] text-cyan-300 font-semibold">{currentLanguage.name} Interactive Lexicon</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {data && (
          <div className="mt-4 space-y-5">
            
            {/* Main Word Header */}
            <div className="flex items-center justify-between p-4 rounded-2xl glass-card border border-pink-500/20 shadow-md">
              <div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-black text-white tracking-wide">{data.word}</span>
                  {data.partOfSpeech && (
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                      {data.partOfSpeech}
                    </span>
                  )}
                </div>
                {data.phonetic && <div className="text-xs font-mono text-cyan-300 mt-0.5">{data.phonetic}</div>}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePlayAudio}
                  disabled={isPlayingAudio}
                  className={`p-2.5 rounded-xl border border-white/15 bg-white/10 text-slate-200 hover:text-white hover:bg-white/20 transition-all cursor-pointer shadow-sm ${
                    isPlayingAudio ? 'animate-pulse text-cyan-300 ring-2 ring-cyan-400' : ''
                  }`}
                  title="Listen to pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>

                <button
                  onClick={handleSaveToDeck}
                  className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-extrabold cursor-pointer ${
                    saved
                      ? 'bg-gradient-to-r from-pink-500 to-cyan-500 border-pink-300 text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]'
                      : 'bg-white/10 border-white/15 text-slate-200 hover:bg-white/20'
                  }`}
                  title={saved ? 'Saved to Vocabulary' : 'Save to Vocabulary Deck'}
                >
                  {saved ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-white" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 text-pink-400" />
                      <span>Save</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Translation & Definition */}
            <div className="space-y-3">
              <div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">English Translation</div>
                <div className="text-lg font-black text-cyan-300 mt-0.5">{data.translation}</div>
              </div>

              <div>
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Meaning & Usage</div>
                <p className="text-xs text-slate-200 leading-relaxed mt-0.5">{data.definition}</p>
              </div>

              {contextSentence && (
                <div>
                  <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Context in Conversation</div>
                  <p className="text-xs text-pink-200 bg-pink-500/15 p-2.5 rounded-xl border border-pink-500/30 mt-0.5 leading-relaxed">
                    "{contextSentence}"
                  </p>
                </div>
              )}
            </div>

            {/* Example Sentences */}
            {data.exampleSentences && data.exampleSentences.length > 0 && (
              <div className="pt-2 border-t border-white/10">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Example Sentences</span>
                  {isEnriching && (
                    <span className="text-[10px] text-cyan-300 flex items-center gap-1 animate-pulse">
                      <Sparkles className="w-3 h-3" /> Enriching nuances...
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {data.exampleSentences.map((ex: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs space-y-1">
                      <div className="font-bold text-white">{ex.target}</div>
                      <div className="text-slate-300 text-[11px]">{ex.native}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cultural or Nuance Note */}
            {data.culturalNote && (
              <div className="p-3.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-xs text-pink-200 flex items-start gap-2 shadow-sm">
                <Sparkles className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-pink-300">Cultural Insight: </span>
                  {data.culturalNote}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
