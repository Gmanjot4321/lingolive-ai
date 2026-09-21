import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Lock,
  Unlock,
  RotateCcw,
  Check,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageOption, ProficiencyLevel, PromotionExam, PromotionQuestion } from '../types';
import { getNextLevel } from '../data/levelProgression';

interface PromotionExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  exam: PromotionExam;
  currentLanguage: LanguageOption;
  onPromotionSuccess: (promotedToLevel: ProficiencyLevel, score: number) => void;
}

export const PromotionExamModal: React.FC<PromotionExamModalProps> = ({
  isOpen,
  onClose,
  exam,
  currentLanguage,
  onPromotionSuccess,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [passed, setPassed] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60);
  const [showReview, setShowReview] = useState(false);

  // Reset exam on open or exam change
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsSubmitted(false);
      setShowReview(false);
      setScore(0);
      setPassed(false);
      setSecondsRemaining(exam.durationMinutes * 60);
    }
  }, [isOpen, exam.id]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || isSubmitted) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isSubmitted, selectedAnswers]);

  // Audio prompt speaker using native speech synthesis / web audio
  const handlePlayAudioPrompt = (text?: string) => {
    if (!text) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage.speechCode || 'es-ES';
    utterance.rate = 0.85; // slightly slower for clear examination audio
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);
    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  // Play harmonic victory chime using Web Audio
  const playVictoryChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 major chord arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.25, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.65);
      });
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  // Fire celebratory confetti explosion
  const triggerCelebrationConfetti = () => {
    try {
      // Dual side cannons
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.2, y: 0.5 },
        colors: ['#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ffffff'],
      });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { x: 0.8, y: 0.5 },
        colors: ['#06b6d4', '#ec4899', '#f59e0b', '#10b981', '#ffffff'],
      });
      // Center starburst
      setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.6 },
          scalar: 1.2,
          colors: ['#38bdf8', '#f43f5e', '#fbbf24', '#a855f7'],
        });
      }, 250);
    } catch {
      // Confetti fallback
    }
  };

  const handleSelectAnswer = (questionIndex: number, optionIndex: number) => {
    if (isSubmitted) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const handleSubmitExam = () => {
    if (isSubmitted) return;
    window.speechSynthesis?.cancel();
    setIsPlayingAudio(false);

    let correctCount = 0;
    exam.questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswerIndex) {
        correctCount++;
      }
    });

    const calculatedScore = Math.round((correctCount / exam.questions.length) * 100);
    const hasPassed = calculatedScore >= exam.passingScore;

    setScore(calculatedScore);
    setPassed(hasPassed);
    setIsSubmitted(true);

    if (hasPassed) {
      playVictoryChime();
      triggerCelebrationConfetti();
      onPromotionSuccess(exam.toLevel, calculatedScore);
    }
  };

  if (!isOpen) return null;

  const currentQ = exam.questions[currentQuestionIndex];
  const allAnswered = exam.questions.every((_, idx) => selectedAnswers[idx] !== undefined);
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const fromCode = exam.fromLevel.split(' - ')[0];
  const toCode = exam.toLevel.split(' - ')[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#0b0c1e] border border-cyan-500/30 shadow-[0_20px_70px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Top Header Bar */}
        <div className="px-5 py-4 border-b border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-purple-600 to-pink-500 p-[1.5px] shadow-[0_0_15px_rgba(6,182,212,0.4)] shrink-0">
              <div className="w-full h-full rounded-2xl bg-[#090D1E] flex items-center justify-center text-white">
                <Award className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-base font-black text-white">{currentLanguage.flag} {exam.title}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Pass Mark: {exam.passingScore}%
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span className="font-extrabold text-pink-300">{fromCode}</span>
                <ArrowRight className="w-3 h-3 text-slate-500" />
                <span className="font-extrabold text-cyan-300">{toCode} Unlock Gateway</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 ml-3">
            {!isSubmitted && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 font-bold">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{timeFormatted}</span>
              </div>
            )}
            <button
              onClick={() => {
                window.speechSynthesis?.cancel();
                onClose();
              }}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close exam"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          
          {/* Active Examination Mode */}
          {!isSubmitted && (
            <div>
              {/* Question Stepper Indicator */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-300">
                    Question {currentQuestionIndex + 1} of {exam.questions.length}
                  </span>
                  <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {currentQ.skillTag}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Question Card */}
              <div className="p-5 sm:p-6 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg mb-6">
                <h3 className="text-base sm:text-lg font-bold text-white mb-4 leading-snug">
                  {currentQ.question}
                </h3>

                {/* Audio Prompt button if listening question */}
                {currentQ.audioPrompt && (
                  <div className="mb-5 p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlayAudioPrompt(currentQ.audioPrompt)}
                        className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer shadow-md ${
                          isPlayingAudio
                            ? 'bg-pink-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                            : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                        }`}
                        title="Listen to native audio prompt"
                      >
                        {isPlayingAudio ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      </button>
                      <div>
                        <p className="text-xs font-bold text-cyan-300">Native Audio Recording</p>
                        <p className="text-[11px] text-slate-400">Click to listen to the target pronunciation</p>
                      </div>
                    </div>
                    {isPlayingAudio && (
                      <span className="text-[10px] font-mono text-pink-400 font-bold animate-pulse">
                        Playing...
                      </span>
                    )}
                  </div>
                )}

                {/* Options List */}
                <div className="space-y-3">
                  {currentQ.options.map((option, optIdx) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectAnswer(currentQuestionIndex, optIdx)}
                        className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer border ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500/25 to-cyan-500/25 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] font-semibold'
                            : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-cyan-400 text-slate-950 shadow-sm'
                                : 'bg-white/10 text-slate-300'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? 'border-cyan-400 bg-cyan-400/20' : 'border-white/20'
                          }`}
                        >
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-xs" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Navigation & Submit Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  {currentQuestionIndex < exam.questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentQuestionIndex((prev) => Math.min(exam.questions.length - 1, prev + 1))}
                      className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmitExam}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 text-xs font-extrabold text-white transition-all shadow-[0_0_20px_rgba(236,72,153,0.4)] flex items-center gap-2 cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Submit Examination</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Results & Celebration Screen */}
          {isSubmitted && (
            <div className="text-center py-4">
              
              {passed ? (
                /* VICTORY / LEVEL PROMOTED STATE */
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                  className="space-y-6"
                >
                  {/* Glowing Promotion Badge */}
                  <div className="relative inline-block mx-auto">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-tr from-amber-400 via-pink-500 to-cyan-400 p-1 shadow-[0_0_40px_rgba(245,158,11,0.5)] mx-auto animate-pulse">
                      <div className="w-full h-full rounded-[22px] bg-[#090D1E] flex flex-col items-center justify-center text-white">
                        <Sparkles className="w-9 h-9 sm:w-11 sm:h-11 text-amber-300 mb-1" />
                        <span className="text-xs font-black text-cyan-300 tracking-wider">LEVEL UP</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 uppercase tracking-wider">
                      Official CEFR Promotion Granted
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-white mt-3 mb-1">
                      Promoted to {exam.toLevel}!
                    </h2>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      Congratulations! You scored <strong className="text-emerald-400 font-extrabold">{score}%</strong> on your competency assessment and permanently unlocked your next level.
                    </p>
                  </div>

                  {/* Promotion Stats Ribbon */}
                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-center">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Final Score</p>
                      <p className="text-lg sm:text-xl font-black text-emerald-400">{score}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Reward</p>
                      <p className="text-lg sm:text-xl font-black text-pink-400">+100 XP</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">New Status</p>
                      <p className="text-lg sm:text-xl font-black text-cyan-300">{toCode}</p>
                    </div>
                  </div>

                  {/* Detailed Question Review Toggle */}
                  <div className="pt-2">
                    <button
                      onClick={() => setShowReview(!showReview)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 underline font-semibold cursor-pointer"
                    >
                      {showReview ? 'Hide Question Review' : 'Review Test Answers & Explanations'}
                    </button>
                  </div>

                  {showReview && (
                    <div className="text-left space-y-4 max-w-xl mx-auto pt-2 border-t border-white/10">
                      {exam.questions.map((q, idx) => {
                        const userAns = selectedAnswers[idx];
                        const isCorrect = userAns === q.correctAnswerIndex;
                        return (
                          <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-slate-200">Question {idx + 1}</span>
                              {isCorrect ? (
                                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                                </span>
                              ) : (
                                <span className="text-pink-400 flex items-center gap-1 font-bold">
                                  <XCircle className="w-3.5 h-3.5" /> Incorrect
                                </span>
                              )}
                            </div>
                            <p className="text-slate-300 mb-2">{q.question}</p>
                            <p className="text-slate-400">
                              <strong className="text-cyan-300">Answer:</strong> {q.options[q.correctAnswerIndex]}
                            </p>
                            <p className="text-slate-400 mt-1 italic">{q.explanation}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-4 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        window.speechSynthesis?.cancel();
                        onClose();
                      }}
                      className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.4)] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Enter {exam.toLevel.split(' - ')[0]} Now</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* NOT PASSED STATE */
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="w-20 h-20 rounded-3xl bg-pink-500/20 border border-pink-500/40 p-4 mx-auto flex items-center justify-center text-pink-400 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                    <BookOpen className="w-10 h-10" />
                  </div>

                  <div>
                    <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40 uppercase tracking-wider">
                      Study & Review Recommended
                    </span>
                    <h2 className="text-2xl font-black text-white mt-3 mb-1">
                      Score: {score}% (Pass Mark: {exam.passingScore}%)
                    </h2>
                    <p className="text-sm text-slate-300 max-w-md mx-auto">
                      You are close! Review the explanations below to reinforce your knowledge, practice a few conversations, and you can retake the promotion exam at any time.
                    </p>
                  </div>

                  {/* Review Cards */}
                  <div className="text-left space-y-3 max-w-xl mx-auto">
                    {exam.questions.map((q, idx) => {
                      const userAns = selectedAnswers[idx];
                      const isCorrect = userAns === q.correctAnswerIndex;
                      return (
                        <div key={q.id} className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-slate-200">Question {idx + 1}: {q.skillTag}</span>
                            {isCorrect ? (
                              <span className="text-emerald-400 flex items-center gap-1 font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                              </span>
                            ) : (
                              <span className="text-pink-400 flex items-center gap-1 font-bold">
                                <XCircle className="w-3.5 h-3.5" /> Needs Practice
                              </span>
                            )}
                          </div>
                          <p className="text-slate-300 mb-1">{q.question}</p>
                          <p className="text-slate-400">
                            <strong className="text-cyan-300">Correct:</strong> {q.options[q.correctAnswerIndex]}
                          </p>
                          <p className="text-slate-400 mt-1 italic">{q.explanation}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setSelectedAnswers({});
                        setCurrentQuestionIndex(0);
                        setSecondsRemaining(exam.durationMinutes * 60);
                      }}
                      className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retake Exam</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-6 py-2.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-xs font-bold text-pink-200 transition-all cursor-pointer"
                    >
                      Return to Practice
                    </button>
                  </div>
                </motion.div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
