import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Headphones,
  BookOpen,
  PenTool,
  Mic,
  Clock,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Volume2,
  Send,
  Loader2,
  FileCheck,
  BarChart,
  RefreshCw,
  Flame,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { LanguageOption, MockTestExam, MockTestResult, MockTestSkill } from '../types';
import { getInstantMockExam } from '../data/mockExams';

export interface MockTestExamViewProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: string;
  onCompleteExam?: (result: MockTestResult) => void;
  onSaveResult?: (result: MockTestResult) => void;
  onNavigateToChat?: () => void;
  onNavigateToDashboard?: () => void;
  onBackToDashboard?: () => void;
}

export const MockTestExamView: React.FC<MockTestExamViewProps> = ({
  currentLanguage,
  proficiencyLevel,
  onCompleteExam,
  onSaveResult,
  onNavigateToChat,
  onNavigateToDashboard,
  onBackToDashboard,
}) => {
  const handleDashboard = onNavigateToDashboard || onBackToDashboard || (() => {});
  const handleChat = onNavigateToChat || (() => {});

  const currentCefr = proficiencyLevel.split(' - ')[0] || 'B1';

  // Instant pre-calibrated exam state (0ms load time)
  const [exam, setExam] = useState<MockTestExam>(() =>
    getInstantMockExam(currentLanguage.name, currentCefr)
  );
  const [isGeneratingAIFresh, setIsGeneratingAIFresh] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState<MockTestSkill>('listening');
  const [examStarted, setExamStarted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResult, setExamResult] = useState<MockTestResult | null>(null);

  // Student answers
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, number>>({});
  const [readingAnswers, setReadingAnswers] = useState<Record<number, number>>({});
  const [writingSubmission, setWritingSubmission] = useState('');
  const [speakingTranscript, setSpeakingTranscript] = useState('');
  const [isRecordingSpeaking, setIsRecordingSpeaking] = useState(false);

  // Audio player state for listening test
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(() => (exam.durationMinutes || 20) * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Speech Recognition ref
  const recognitionRef = useRef<any>(null);

  // Synchronously update exam when language or level changes (INSTANT 0ms)
  useEffect(() => {
    const instantExam = getInstantMockExam(currentLanguage.name, currentCefr);
    setExam(instantExam);
    setSecondsRemaining((instantExam.durationMinutes || 20) * 60);
    setListeningAnswers({});
    setReadingAnswers({});
    setWritingSubmission('');
    setSpeakingTranscript('');
    setExamResult(null);
  }, [currentLanguage.id, currentCefr]);

  // Timer countdown
  useEffect(() => {
    let interval: any;
    if (examStarted && isTimerRunning && secondsRemaining > 0 && !examResult) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [examStarted, isTimerRunning, secondsRemaining, examResult]);

  // Generate novel on-demand AI exam in background without blocking screen
  const handleGenerateFreshAIExam = async () => {
    setIsGeneratingAIFresh(true);
    setGenerationNotice('Crafting new custom AI exam...');
    try {
      const res = await fetch('/api/generate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: currentLanguage.name,
          cefrLevel: currentCefr,
          forceFresh: true,
        }),
      });
      const data = await res.json();
      if (data?.exam) {
        setExam(data.exam);
        setSecondsRemaining((data.exam.durationMinutes || 20) * 60);
        setGenerationNotice('✨ Fresh AI Exam Ready!');
        setTimeout(() => setGenerationNotice(null), 3500);
      }
    } catch (err) {
      console.error('Failed to generate fresh AI exam:', err);
      setGenerationNotice(null);
    } finally {
      setIsGeneratingAIFresh(false);
    }
  };

  // Audio speech synthesis helper for listening comprehension
  const handlePlayListeningAudio = (text: string) => {
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage.speechCode || 'es-ES';
    utterance.rate = audioSpeed;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Speaking microphone recognition
  const toggleSpeakingRecording = () => {
    if (isRecordingSpeaking) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingSpeaking(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type your spoken answer.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage.speechCode || 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecordingSpeaking(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setSpeakingTranscript((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsRecordingSpeaking(false);
      };

      recognition.onend = () => {
        setIsRecordingSpeaking(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition failed to start:', err);
      setIsRecordingSpeaking(false);
    }
  };

  // Submit and evaluate exam
  const handleSubmitExam = async () => {
    setIsSubmitting(true);
    setIsTimerRunning(false);

    // Calculate preliminary scores for objective sections
    let listeningCorrect = 0;
    exam.listening.forEach((item, idx) => {
      if (listeningAnswers[idx] === item.correctAnswerIndex) {
        listeningCorrect++;
      }
    });

    let readingCorrect = 0;
    exam.reading.forEach((item, idx) => {
      if (readingAnswers[idx] === item.correctAnswerIndex) {
        readingCorrect++;
      }
    });

    try {
      const res = await fetch('/api/evaluate-mock-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: currentLanguage.name,
          cefrLevel: currentCefr,
          listeningScore: listeningCorrect,
          listeningTotal: exam.listening.length,
          readingScore: readingCorrect,
          readingTotal: exam.reading.length,
          writingSubmission,
          speakingTranscript,
        }),
      });

      const data = await res.json();
      if (data?.evaluation) {
        const writingEval = typeof data.evaluation.writingFeedback === 'object'
          ? data.evaluation.writingFeedback
          : {
              score: data.evaluation.writingScore ?? 20,
              grammarScore: 8,
              vocabularyScore: 8,
              feedback: typeof data.evaluation.writingFeedback === 'string' ? data.evaluation.writingFeedback : 'Written expression is cohesive and communicative.',
            };

        const speakingEval = typeof data.evaluation.speakingFeedback === 'object'
          ? data.evaluation.speakingFeedback
          : {
              score: data.evaluation.speakingScore ?? 20,
              fluencyScore: 8,
              pronunciationScore: 8,
              feedback: typeof data.evaluation.speakingFeedback === 'string' ? data.evaluation.speakingFeedback : 'Clear delivery with authentic vocabulary.',
            };

        const fullResult: MockTestResult = {
          id: `result-${Date.now()}`,
          testTitle: exam.title,
          targetLanguage: currentLanguage.name,
          cefrLevel: currentCefr,
          completedAt: new Date().toISOString(),
          listeningScore: data.evaluation.listeningScore ?? Math.round((listeningCorrect / exam.listening.length) * 25),
          listeningFeedback: typeof data.evaluation.listeningFeedback === 'string' ? data.evaluation.listeningFeedback : 'Demonstrated good comprehension of standard dialogue excerpts.',
          readingScore: data.evaluation.readingScore ?? Math.round((readingCorrect / exam.reading.length) * 25),
          readingFeedback: typeof data.evaluation.readingFeedback === 'string' ? data.evaluation.readingFeedback : 'Understands key informational notices and contextual points.',
          writingScore: data.evaluation.writingScore ?? 20,
          writingFeedback: writingEval,
          speakingScore: data.evaluation.speakingScore ?? 20,
          speakingFeedback: speakingEval,
          overallScore: data.evaluation.overallScore ?? 82,
          improvementRoadmap: data.evaluation.improvementRoadmap ?? [
            'Refine nuanced transitional connectors',
            'Expand topic-specific vocabulary in complex domains',
            'Practice past-tense irregular conjugations in spontaneous speech',
          ],
        };

        setExamResult(fullResult);
        if (onCompleteExam) onCompleteExam(fullResult);
        if (onSaveResult) onSaveResult(fullResult);

        // Confetti celebration
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#ec4899', '#a855f7'],
        });
      }
    } catch (err) {
      console.error('Error evaluating exam:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const writingWordCount = writingSubmission.trim() ? writingSubmission.trim().split(/\s+/).length : 0;

  // If exam is completed, show the Scorecard & Diagnostic Certificate
  if (examResult) {
    return (
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Certificate Banner */}
        <div className="relative overflow-hidden rounded-3xl glass-card-neon border border-cyan-400/30 p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-black">
                <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>CEFR DIAGNOSTIC SCORECARD</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {currentLanguage.flag} {examResult.testTitle}
              </h1>
              <p className="text-sm text-slate-300">
                Evaluation performed across international standards for {currentLanguage.name} proficiency.
              </p>
            </div>

            {/* Overall Score Badge */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl glass-card border border-pink-500/30 shadow-[0_0_25px_rgba(236,72,153,0.3)] min-w-[170px]">
              <span className="text-xs font-black uppercase tracking-wider text-pink-400">Overall Band</span>
              <span className="text-5xl font-black text-white mt-1 bg-gradient-to-r from-pink-400 to-cyan-300 bg-clip-text text-transparent">
                {examResult.overallScore}
              </span>
              <span className="text-xs font-bold text-cyan-300 mt-1">Level {examResult.cefrLevel}</span>
              <span className="text-[11px] text-slate-400 font-semibold">out of 100 points</span>
            </div>
          </div>
        </div>

        {/* 4-Skill Section Scorecards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Listening */}
          <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-xs">
                <Headphones className="w-4 h-4" /> Listening
              </div>
              <span className="text-base font-black text-white">{examResult.listeningScore}/25</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                style={{ width: `${(examResult.listeningScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{examResult.listeningFeedback}</p>
          </div>

          {/* Reading */}
          <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-xs">
                <BookOpen className="w-4 h-4" /> Reading
              </div>
              <span className="text-base font-black text-white">{examResult.readingScore}/25</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                style={{ width: `${(examResult.readingScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{examResult.readingFeedback}</p>
          </div>

          {/* Writing */}
          <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-pink-400 font-black text-xs">
                <PenTool className="w-4 h-4" /> Writing
              </div>
              <span className="text-base font-black text-white">{examResult.writingScore}/25</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pink-500 to-rose-400 rounded-full"
                style={{ width: `${(examResult.writingScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {typeof examResult.writingFeedback === 'object' ? examResult.writingFeedback.feedback : examResult.writingFeedback}
            </p>
          </div>

          {/* Speaking */}
          <div className="rounded-2xl glass-card border border-white/10 p-5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-300 font-black text-xs">
                <Mic className="w-4 h-4" /> Speaking
              </div>
              <span className="text-base font-black text-white">{examResult.speakingScore}/25</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                style={{ width: `${(examResult.speakingScore / 25) * 100}%` }}
              />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {typeof examResult.speakingFeedback === 'object' ? examResult.speakingFeedback.feedback : examResult.speakingFeedback}
            </p>
          </div>
        </div>

        {/* Improvement Roadmap */}
        {examResult.improvementRoadmap && examResult.improvementRoadmap.length > 0 && (
          <div className="rounded-2xl glass-card border border-cyan-400/30 p-6 space-y-3 shadow-lg">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-300" />
              <span>Targeted Mastery Roadmap</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              {examResult.improvementRoadmap.map((tip, i) => (
                <div key={i} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-pink-400 font-black text-sm leading-none">•</span>
                  <span>{tip}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between pt-2 gap-3">
          <button
            onClick={() => {
              setExamResult(null);
              setExamStarted(false);
              setListeningAnswers({});
              setReadingAnswers({});
              setWritingSubmission('');
              setSpeakingTranscript('');
            }}
            className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-cyan-300" /> Retake Exam
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDashboard}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <BarChart className="w-4 h-4 text-pink-400" /> View on Dashboard
            </button>
            <button
              onClick={handleChat}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white text-xs font-black shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Practice Weak Points in Chat</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Pre-test introductory view (INSTANT LOAD - ZERO DELAY)
  if (!examStarted) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="rounded-3xl glass-card-neon border border-cyan-400/30 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] space-y-6 text-center relative overflow-hidden">
          
          {/* Subtle 3D floating orb decoration */}
          <div className="absolute -top-12 -left-12 w-36 h-36 rounded-full sphere-pink-3d opacity-25 blur-sm pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full sphere-cyan-3d opacity-20 blur-sm pointer-events-none" />

          {/* Language Flag Badge with 3D Specularity */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-pink-500/20 to-cyan-400/20 border border-cyan-400/40 mx-auto flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(6,182,212,0.3)] backdrop-blur-md">
            {currentLanguage.flag}
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-black border border-cyan-400/30 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>CEFR STANDARDIZED ASSESSMENT • LEVEL {currentCefr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {exam.title}
            </h1>
            <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
              Test your proficiency across all 4 core language disciplines calibrated to international standards.
            </p>
          </div>

          {/* 4 Skill Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
            <div className="p-4 rounded-2xl glass-card border border-cyan-500/20 space-y-1 hover:border-cyan-400/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-300 border border-cyan-500/30 mb-2 shadow-sm">
                <Headphones className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Listening</h4>
              <p className="text-[11px] text-slate-300">Audio dialogs & comprehension</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-emerald-500/20 space-y-1 hover:border-emerald-400/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-300 border border-emerald-500/30 mb-2 shadow-sm">
                <BookOpen className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Reading</h4>
              <p className="text-[11px] text-slate-300">Passages & contextual deduction</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-pink-500/20 space-y-1 hover:border-pink-400/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-300 border border-pink-500/30 mb-2 shadow-sm">
                <PenTool className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Writing</h4>
              <p className="text-[11px] text-slate-300">Real-world composition</p>
            </div>

            <div className="p-4 rounded-2xl glass-card border border-purple-500/20 space-y-1 hover:border-purple-400/40 transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300 border border-purple-500/30 mb-2 shadow-sm">
                <Mic className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-black text-white">Speaking</h4>
              <p className="text-[11px] text-slate-300">Spoken fluency evaluation</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                setExamStarted(true);
                setIsTimerRunning(true);
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black text-xs tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Begin Timed Mock Exam ({exam.durationMinutes} Mins)</span>
            </button>

            <button
              onClick={handleGenerateFreshAIExam}
              disabled={isGeneratingAIFresh}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl glass-card hover:bg-white/15 border border-cyan-400/30 text-cyan-300 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              title="Generate a completely new AI exam for this language and level"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingAIFresh ? 'animate-spin text-pink-400' : ''}`} />
              <span>{isGeneratingAIFresh ? 'Generating New AI Exam...' : 'Generate Fresh AI Exam'}</span>
            </button>
          </div>

          {/* Generation notice banner */}
          <AnimatePresence>
            {generationNotice && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-200 text-xs font-bold"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>{generationNotice}</span>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    );
  }

  // Active Exam Taker
  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Sticky Top Progress Header */}
      <div className="sticky top-20 z-20 rounded-2xl glass-card-neon border border-cyan-400/30 p-3.5 shadow-[0_15px_35px_rgba(0,0,0,0.7)] flex flex-wrap items-center justify-between gap-3">
        {/* Section Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/10 overflow-x-auto">
          <button
            onClick={() => setActiveSection('listening')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeSection === 'listening'
                ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>1. Listening</span>
          </button>
          <button
            onClick={() => setActiveSection('reading')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeSection === 'reading'
                ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>2. Reading</span>
          </button>
          <button
            onClick={() => setActiveSection('writing')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeSection === 'writing'
                ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>3. Writing</span>
          </button>
          <button
            onClick={() => setActiveSection('speaking')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeSection === 'speaking'
                ? 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>4. Speaking</span>
          </button>
        </div>

        {/* Timer & Finish Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl glass-card border border-cyan-400/30 text-xs font-mono font-black text-cyan-300 shadow-sm">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          <button
            onClick={handleSubmitExam}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black text-xs tracking-wider shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Evaluating...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Exam</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* SECTION 1: LISTENING */}
      {activeSection === 'listening' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl glass-card border border-cyan-500/30 text-xs text-cyan-200 flex items-center gap-2.5">
            <Headphones className="w-4 h-4 shrink-0 text-cyan-400" />
            <span>Listen carefully to each audio excerpt. You can adjust playback speed and listen multiple times.</span>
          </div>

          {exam.listening.map((item, idx) => (
            <div key={item.id} className="rounded-3xl glass-card border border-white/15 p-6 space-y-4 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">Audio Passage {idx + 1}</span>
                  <h3 className="text-base font-bold text-white">{item.audioTitle}</h3>
                </div>

                {/* Audio controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePlayListeningAudio(item.audioTranscript)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500/20 to-cyan-500/20 hover:from-pink-500/30 hover:to-cyan-500/30 border border-cyan-400/40 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer"
                  >
                    {isPlayingAudio ? <Pause className="w-3.5 h-3.5 text-cyan-400" /> : <Play className="w-3.5 h-3.5 fill-current text-cyan-400" />}
                    <span>{isPlayingAudio ? 'Stop Audio' : 'Play Track'}</span>
                  </button>
                  <select
                    value={audioSpeed}
                    onChange={(e) => setAudioSpeed(parseFloat(e.target.value))}
                    className="px-2.5 py-1.5 rounded-xl bg-[#090D1E] border border-cyan-400/30 text-cyan-300 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value={0.8}>0.8x Slow</option>
                    <option value={1.0}>1.0x Normal</option>
                    <option value={1.2}>1.2x Native</option>
                  </select>
                </div>
              </div>

              {/* Question & Options */}
              <div className="pt-2 space-y-3">
                <p className="text-sm font-semibold text-slate-200">{item.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setListeningAnswers({ ...listeningAnswers, [idx]: optIdx })}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        listeningAnswers[idx] === optIdx
                          ? 'border-cyan-400 bg-cyan-500/20 text-white font-black shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                          : 'border-white/10 glass-card hover:border-white/25 text-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      {listeningAnswers[idx] === optIdx && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-end">
            <button
              onClick={() => setActiveSection('reading')}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next: Reading Section</span>
              <ChevronRight className="w-4 h-4 text-cyan-300" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 2: READING */}
      {activeSection === 'reading' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl glass-card border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Read each text in {currentLanguage.name} and answer the contextual comprehension questions.</span>
          </div>

          {exam.reading.map((item, idx) => (
            <div key={item.id} className="rounded-3xl glass-card border border-white/15 p-6 space-y-4 shadow-xl">
              <div>
                <span className="text-[11px] font-black text-emerald-400 uppercase tracking-wider">Reading Passage {idx + 1}</span>
                <h3 className="text-base font-bold text-white">{item.passageTitle}</h3>
              </div>

              {/* Text Card */}
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 text-sm text-slate-200 leading-relaxed italic">
                "{item.passage}"
              </div>

              {/* Question & Options */}
              <div className="pt-2 space-y-3">
                <p className="text-sm font-semibold text-slate-200">{item.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {item.options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setReadingAnswers({ ...readingAnswers, [idx]: optIdx })}
                      className={`p-3.5 rounded-2xl border text-left text-xs font-medium transition-all flex items-center justify-between cursor-pointer ${
                        readingAnswers[idx] === optIdx
                          ? 'border-emerald-400 bg-emerald-500/20 text-white font-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'border-white/10 glass-card hover:border-white/25 text-slate-300'
                      }`}
                    >
                      <span>{opt}</span>
                      {readingAnswers[idx] === optIdx && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="flex justify-between">
            <button
              onClick={() => setActiveSection('listening')}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back: Listening</span>
            </button>
            <button
              onClick={() => setActiveSection('writing')}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next: Writing Section</span>
              <ChevronRight className="w-4 h-4 text-pink-400" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 3: WRITING */}
      {activeSection === 'writing' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl glass-card border border-pink-500/30 text-xs text-pink-200 flex items-center gap-2.5">
            <PenTool className="w-4 h-4 shrink-0 text-pink-400" />
            <span>Compose your written response directly in {currentLanguage.name}. Your submission is analyzed for vocabulary, structure, and coherence.</span>
          </div>

          <div className="rounded-3xl glass-card border border-white/15 p-6 space-y-4 shadow-xl">
            <div>
              <span className="text-[11px] font-black text-pink-400 uppercase tracking-wider">Writing Task</span>
              <h3 className="text-base font-bold text-white">{exam.writing.title}</h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
              <p className="text-sm text-slate-200 font-medium">{exam.writing.prompt}</p>
              <p className="text-xs text-slate-400">{exam.writing.context}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {exam.writing.targetTopics.map((topic, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full bg-pink-500/10 text-pink-300 text-[11px] font-bold border border-pink-500/30">
                    ✓ {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Textarea Editor */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-slate-300">
                <span>Write in {currentLanguage.name}</span>
                <span className={writingWordCount >= exam.writing.minWords ? 'text-cyan-300 font-bold' : 'text-slate-400'}>
                  {writingWordCount} / {exam.writing.minWords} min words
                </span>
              </div>
              <textarea
                value={writingSubmission}
                onChange={(e) => setWritingSubmission(e.target.value)}
                placeholder={`Write your response in ${currentLanguage.name}...`}
                rows={7}
                className="w-full rounded-2xl bg-black/30 border border-cyan-400/30 p-4 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans resize-none"
              />
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setActiveSection('reading')}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back: Reading</span>
            </button>
            <button
              onClick={() => setActiveSection('speaking')}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <span>Next: Speaking Section</span>
              <ChevronRight className="w-4 h-4 text-purple-400" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 4: SPEAKING */}
      {activeSection === 'speaking' && (
        <div className="space-y-6">
          <div className="p-3.5 rounded-2xl glass-card border border-purple-500/30 text-xs text-purple-200 flex items-center gap-2.5">
            <Mic className="w-4 h-4 shrink-0 text-purple-400" />
            <span>Oral assessment: Record your spoken answer or dictate into the microphone.</span>
          </div>

          <div className="rounded-3xl glass-card border border-white/15 p-6 space-y-4 shadow-xl">
            <div>
              <span className="text-[11px] font-black text-purple-300 uppercase tracking-wider">Speaking Prompt</span>
              <h3 className="text-base font-bold text-white">{exam.speaking.title}</h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
              <p className="text-sm text-slate-200 font-medium">{exam.speaking.prompt}</p>
              <p className="text-xs text-slate-400">{exam.speaking.context}</p>
              <div className="space-y-1.5 pt-1">
                <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Key points to address:</p>
                {exam.speaking.guidingQuestions.map((q, i) => (
                  <p key={i} className="text-xs text-slate-300 flex items-center gap-1.5">
                    <span className="text-cyan-400 font-black">•</span> {q}
                  </p>
                ))}
              </div>
            </div>

            {/* Speaking Microphone Recorder Area */}
            <div className="p-6 rounded-2xl bg-black/20 border border-white/10 flex flex-col items-center justify-center space-y-4 text-center">
              <button
                onClick={toggleSpeakingRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-lg cursor-pointer ${
                  isRecordingSpeaking
                    ? 'bg-rose-500 animate-pulse ring-4 ring-rose-400/40 shadow-[0_0_25px_rgba(244,63,94,0.6)]'
                    : 'bg-gradient-to-tr from-pink-500 to-cyan-500 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                }`}
              >
                <Mic className="w-6 h-6 text-white" />
              </button>

              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white">
                  {isRecordingSpeaking ? 'Listening to your speech... Click to finish' : 'Click to Record Spoken Answer'}
                </p>
                <p className="text-[11px] text-slate-400">
                  Target duration: ~{exam.speaking.recommendedDurationSeconds} seconds
                </p>
              </div>

              {/* Spoken Transcript preview & manual edit */}
              <div className="w-full text-left space-y-1.5 pt-2">
                <label className="text-[11px] text-slate-300 font-bold">Spoken Transcript (Recognized or Typed):</label>
                <textarea
                  value={speakingTranscript}
                  onChange={(e) => setSpeakingTranscript(e.target.value)}
                  placeholder={`Your spoken response in ${currentLanguage.name} will appear here...`}
                  rows={4}
                  className="w-full rounded-2xl bg-black/30 border border-cyan-400/30 p-3 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-sans"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setActiveSection('writing')}
              className="px-5 py-2.5 rounded-xl glass-card hover:bg-white/15 border border-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back: Writing</span>
            </button>

            <button
              onClick={handleSubmitExam}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black text-xs tracking-wider shadow-[0_0_25px_rgba(6,182,212,0.4)] transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Evaluating All 4 Sections...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Exam for Certification</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
