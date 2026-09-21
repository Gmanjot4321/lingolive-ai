import React, { useState } from 'react';
import {
  X,
  Volume2,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Eye,
  EyeOff,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { CEFRStory } from '../../types';

interface StoryReaderModalProps {
  story: CEFRStory;
  onClose: () => void;
  onOpenWordLookup: (word: string, sentence: string) => void;
  onSaveWord: (word: string, translation: string, phonetic: string, sentence: string) => void;
  onCompleteStory: (xpEarned: number) => void;
}

export const StoryReaderModal: React.FC<StoryReaderModalProps> = ({
  story,
  onClose,
  onOpenWordLookup,
  onSaveWord,
  onCompleteStory,
}) => {
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [showTranslations, setShowTranslations] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(0.9);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Native Speech Synthesis for line-by-line authentic audio
  const handlePlayParagraphAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = story.language.toLowerCase().includes('french') ? 'fr-FR' : 'es-ES';
    utterance.lang = langCode;
    utterance.rate = speechRate;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleSelectQuizAnswer = (qIndex: number, optionIndex: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((prev) => ({ ...prev, [qIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correctCount = 0;
    story.comprehensionQuiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correctCount++;
    });

    const earnedXP = Math.round(story.xpReward * (0.6 + 0.4 * (correctCount / story.comprehensionQuiz.length)));
    onCompleteStory(earnedXP);
  };

  const currentParagraph = story.paragraphs[activeParagraphIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xl animate-in fade-in">
      <div className="glass-card-neon border border-pink-500/35 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-[0_20px_80px_rgba(236,72,153,0.35)] overflow-hidden">
        {/* Header with Title and CEFR Badge */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/12 bg-white/[0.04] shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl p-2 rounded-2xl bg-white/[0.08] border border-white/15">
              {story.coverEmoji}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-pink-500/25 text-pink-300 border border-pink-400/40">
                  {story.cefrLevel}
                </span>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {story.language}
                </span>
                <span className="text-xs text-slate-300 flex items-center gap-1 font-semibold">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  +{story.xpReward} XP
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-white mt-1">
                {story.title}
              </h2>
              <p className="text-xs text-pink-200/70">{story.englishTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Story Body vs Quiz Mode */}
        {!isQuizMode ? (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Story Toolbar */}
            <div className="flex items-center justify-between flex-wrap gap-2 p-3 rounded-2xl bg-white/[0.05] border border-white/10">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTranslations(!showTranslations)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    showTranslations
                      ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/40'
                      : 'bg-white/10 text-slate-300 hover:bg-white/15'
                  }`}
                >
                  {showTranslations ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showTranslations ? 'Hide English' : 'Show English Translation'}</span>
                </button>

                {/* Speech Rate Toggle */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs">
                  <span className="text-[11px] text-slate-400 px-1 font-semibold">Speed:</span>
                  {[0.75, 0.9, 1.1].map((rate) => (
                    <button
                      key={rate}
                      onClick={() => setSpeechRate(rate)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        speechRate === rate ? 'bg-pink-500 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-xs text-pink-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Tip: Click any word for instant dictionary definition</span>
              </div>
            </div>

            {/* Paragraphs List with Sentence Audio and Clickable Words */}
            <div className="space-y-4">
              {story.paragraphs.map((para, pIdx) => {
                const isCurrent = pIdx === activeParagraphIndex;
                const words = para.targetText.split(/(\s+)/);

                return (
                  <div
                    key={para.id}
                    onClick={() => setActiveParagraphIndex(pIdx)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-gradient-to-r from-pink-500/15 to-purple-600/15 border-pink-500/40 shadow-[0_4px_25px_rgba(236,72,153,0.15)]'
                        : 'bg-white/[0.04] border-white/10 hover:bg-white/[0.07]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed">
                          {words.map((chunk, wIdx) => {
                            const cleanWord = chunk.trim().replace(/[«».,!?;:()"]/g, '');
                            if (!cleanWord) return <span key={wIdx}>{chunk}</span>;

                            return (
                              <button
                                key={wIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onOpenWordLookup(cleanWord, para.targetText);
                                }}
                                className="inline px-1 py-0.5 rounded-md hover:bg-pink-500/30 hover:text-pink-200 transition-colors cursor-pointer underline decoration-pink-500/30 underline-offset-4"
                                title={`Tap to translate "${cleanWord}"`}
                              >
                                {chunk}
                              </button>
                            );
                          })}
                        </div>

                        {showTranslations && (
                          <p className="mt-2 text-xs sm:text-sm text-pink-200/80 italic font-sans border-l-2 border-pink-400/50 pl-2.5">
                            {para.englishText}
                          </p>
                        )}

                        {/* Highlighted Vocabulary for Paragraph */}
                        {para.keyWords && para.keyWords.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5 pt-2 border-t border-white/10">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 self-center mr-1">
                              Key Vocab:
                            </span>
                            {para.keyWords.map((kw, kwIdx) => (
                              <button
                                key={kwIdx}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSaveWord(kw.word, kw.translation, kw.phonetic || '', para.targetText);
                                }}
                                className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/30 text-[11px] font-semibold text-cyan-200 transition-all cursor-pointer"
                                title="Click to add to flashcards"
                              >
                                <span>{kw.word}</span>
                                <span className="text-slate-300 font-normal">({kw.translation})</span>
                                <BookOpen className="w-3 h-3 text-cyan-300" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Native Paragraph Audio Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlayParagraphAudio(para.targetText);
                        }}
                        className="p-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/30 text-pink-300 hover:text-white transition-all shrink-0 cursor-pointer"
                        title="Listen to native pronunciation"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Comprehension Quiz Mode */
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            <div className="text-center max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold">
                Comprehension Challenge
              </span>
              <h3 className="text-xl font-bold text-white mt-2">Check Your Story Understanding</h3>
              <p className="text-xs text-slate-300 mt-1">Answer these CEFR questions to claim your +{story.xpReward} XP!</p>
            </div>

            <div className="space-y-4 max-w-2xl mx-auto">
              {story.comprehensionQuiz.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];
                const isCorrect = selected === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl bg-white/[0.05] border border-white/12 space-y-3"
                  >
                    <h4 className="text-sm font-bold text-slate-100 flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 flex items-center justify-center text-xs shrink-0">
                        {qIdx + 1}
                      </span>
                      <span>{q.question}</span>
                    </h4>

                    <div className="space-y-2 pl-8">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let optionStyle = 'bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            optionStyle = 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold';
                          } else if (isChosen) {
                            optionStyle = 'bg-rose-500/25 border-rose-400 text-rose-200';
                          }
                        } else if (isChosen) {
                          optionStyle = 'bg-pink-500/30 border-pink-400 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all cursor-pointer flex items-center justify-between ${optionStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <div className="p-2.5 rounded-xl bg-white/[0.05] text-xs text-slate-300 mt-2 border border-white/10">
                        <span className="font-bold text-cyan-300">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="p-4 sm:p-5 border-t border-white/12 bg-white/[0.04] flex items-center justify-between gap-3 shrink-0">
          {!isQuizMode ? (
            <>
              <button
                onClick={() => {
                  const fullStoryText = story.paragraphs.map((p) => p.targetText).join(' ');
                  handlePlayParagraphAudio(fullStoryText);
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-slate-200 transition-all cursor-pointer"
              >
                <Volume2 className="w-4 h-4 text-pink-300" />
                <span>Read Full Story Aloud</span>
              </button>

              <button
                onClick={() => {
                  window.speechSynthesis.cancel();
                  setIsQuizMode(true);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
              >
                <span>Take Comprehension Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsQuizMode(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs sm:text-sm font-bold text-slate-200 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Back to Story</span>
              </button>

              {!quizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < story.comprehensionQuiz.length}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 disabled:opacity-50 hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Quiz Answers</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:brightness-110 text-white text-xs sm:text-sm font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Story Completed!</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
