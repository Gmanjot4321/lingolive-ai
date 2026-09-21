import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Lock,
  ChevronRight,
  BookOpen,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Languages,
  Sliders,
  Award,
  ArrowRight,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Loader2,
  AlertCircle,
  Target,
} from 'lucide-react';
import { LanguageOption, PartnerPersona, PracticeScenario, ProficiencyLevel, ChatMessage, SavedWord, ReplyOption } from '../types';
import { LEVEL_GREETINGS } from '../data/levelGreetings';
import { playPcmAudioBase64, stopCurrentAudioPlayback } from '../utils/audio';

interface InteractiveChatProps {
  currentLanguage: LanguageOption;
  currentPersona: PartnerPersona;
  currentScenario: PracticeScenario;
  proficiencyLevel: ProficiencyLevel;
  unlockedLevels?: ProficiencyLevel[];
  isReadyForPromotion?: boolean;
  readinessPercentage?: number;
  nextLevel?: ProficiencyLevel | null;
  onOpenPromotionExam?: () => void;
  messages: ChatMessage[];
  onSendMessage: (text: string, isVoiceInput?: boolean) => Promise<void>;
  isLoading: boolean;
  onOpenWordLookup: (word: string, contextSentence: string) => void;
  onOpenPronunciationCoachWithText: (text: string) => void;
  onSaveWord: (word: SavedWord) => void;
  onUpdateScenarioGoal: (goalId: string, completed: boolean) => void;
  onGenerateSessionSummary: () => void;
  isGeneratingSummary?: boolean;
  onResetChat?: () => void;
  onPlayAudio?: () => void;
}

export const InteractiveChat: React.FC<InteractiveChatProps> = ({
  currentLanguage,
  currentPersona,
  currentScenario,
  proficiencyLevel,
  unlockedLevels = ['A0 - Absolute Beginner (Zero Knowledge)'],
  isReadyForPromotion = false,
  readinessPercentage = 0,
  nextLevel = null,
  onOpenPromotionExam,
  messages,
  onSendMessage,
  isLoading,
  onOpenWordLookup,
  onOpenPronunciationCoachWithText,
  onSaveWord,
  onUpdateScenarioGoal,
  onGenerateSessionSummary,
  isGeneratingSummary = false,
  onResetChat,
  onPlayAudio,
}) => {
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const wasVoiceInputRef = useRef(false);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [loadingAudioId, setLoadingAudioId] = useState<string | null>(null);
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [helperQuery, setHelperQuery] = useState('');
  const [helperAnswer, setHelperAnswer] = useState<string | null>(null);
  const [helperLoading, setHelperLoading] = useState(false);
  const [showHelperModal, setShowHelperModal] = useState(false);
  const [showGoalAlert, setShowGoalAlert] = useState(false);
  const [selectedQuizOption, setSelectedQuizOption] = useState<
    Record<string, { index: number; isCorrect: boolean; explanation: string; text: string }>
  >({});
  const [showRightSidebar, setShowRightSidebar] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : true
  );

  const messageFeedRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const clientAudioCache = useRef<Map<string, string>>(new Map());

  // Goal metrics
  const completedGoalsCount = currentScenario.goals.filter((g) => g.completed).length;
  const totalGoalsCount = currentScenario.goals.length;
  const allGoalsCompleted = totalGoalsCount > 0 && completedGoalsCount >= totalGoalsCount;

  // Auto-scroll on new messages strictly isolated to message container
  // Never calls scrollIntoView to prevent page jump or lifting the right sidebar
  useEffect(() => {
    if (messageFeedRef.current) {
      messageFeedRef.current.scrollTo({
        top: messageFeedRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages, isLoading]);

  // Background prefetch audio for the newest AI partner message so "Listen" is instantaneous
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'model' && lastMsg.text) {
      const cleanText = lastMsg.text.trim();
      const cacheKey = `${currentLanguage.id}:${currentPersona.voice}:${cleanText.toLowerCase()}`;
      if (!clientAudioCache.current.has(cacheKey)) {
        fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voiceName: currentPersona.voice,
            language: currentLanguage.speechCode.split('-')[0],
          }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.audio) {
              clientAudioCache.current.set(cacheKey, data.audio);
            }
          })
          .catch(() => {
            // Silently ignore background prefetch errors; fallback will engage on user click
          });
      }
    }
  }, [messages, currentLanguage.id, currentLanguage.speechCode, currentPersona.voice]);

  // Handle Speech Recognition for voice input
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. You can type your response instead!');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = currentLanguage.speechCode;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
        wasVoiceInputRef.current = true;
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
      console.error('Failed to start speech recognition:', err);
      setIsRecording(false);
    }
  };

  // Play TTS for a message with instant client cache & rapid fallback
  const playMessageAudio = async (message: ChatMessage) => {
    // If currently playing or loading this message, stop immediately
    if (playingAudioId === message.id || loadingAudioId === message.id) {
      stopCurrentAudioPlayback();
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setPlayingAudioId(null);
      setLoadingAudioId(null);
      return;
    }

    // Stop any other active playback
    stopCurrentAudioPlayback();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const cleanText = message.text.trim();
    const cacheKey = `${currentLanguage.id}:${currentPersona.voice}:${cleanText.toLowerCase()}`;

    // Instant browser speech synthesis helper
    const playWithWebSpeech = () => {
      if ('speechSynthesis' in window) {
        try {
          onPlayAudio?.();
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = currentLanguage.speechCode;
          utterance.rate = audioSpeed;
          utterance.onend = () => {
            setPlayingAudioId(null);
            setLoadingAudioId(null);
          };
          utterance.onerror = () => {
            setPlayingAudioId(null);
            setLoadingAudioId(null);
          };
          setLoadingAudioId(null);
          setPlayingAudioId(message.id);
          window.speechSynthesis.speak(utterance);
          return true;
        } catch {
          setLoadingAudioId(null);
          setPlayingAudioId(null);
          return false;
        }
      }
      setLoadingAudioId(null);
      setPlayingAudioId(null);
      return false;
    };

    // 1. Instant check in pre-fetched or existing client cache
    const cachedAudio = clientAudioCache.current.get(cacheKey);
    if (cachedAudio) {
      onPlayAudio?.();
      setLoadingAudioId(null);
      setPlayingAudioId(message.id);
      await playPcmAudioBase64(cachedAudio, 24000, audioSpeed, () => {
        setPlayingAudioId(null);
      });
      return;
    }

    // 2. Set loading state to give immediate visual feedback
    setLoadingAudioId(message.id);
    setPlayingAudioId(null);

    // 3. Fetch with 2.2-second timeout protection so user is never kept waiting
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, 2200);

    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voiceName: currentPersona.voice,
          language: currentLanguage.speechCode.split('-')[0],
        }),
        signal: controller.signal,
      });

      clearTimeout(timer);
      const data = await res.json();

      if (data.success && data.audio) {
        onPlayAudio?.();
        clientAudioCache.current.set(cacheKey, data.audio);
        setLoadingAudioId(null);
        setPlayingAudioId(message.id);
        await playPcmAudioBase64(data.audio, 24000, audioSpeed, () => {
          setPlayingAudioId(null);
        });
      } else {
        // Model busy or fallback signal -> instant device speech
        playWithWebSpeech();
      }
    } catch {
      clearTimeout(timer);
      // Timeout or network interruption -> instant device speech
      playWithWebSpeech();
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    const isVoice = wasVoiceInputRef.current;
    wasVoiceInputRef.current = false;
    setInputText('');
    await onSendMessage(text, isVoice);
  };

  const toggleTranslation = (id: string) => {
    setShowTranslations((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Helper "How do I say...?"
  const handleAskHelper = async () => {
    if (!helperQuery.trim()) return;
    setHelperLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: `How do I say this in natural ${currentLanguage.name} for the scenario "${currentScenario.title}": "${helperQuery}"?`,
            },
          ],
          targetLanguage: currentLanguage.name,
          nativeLanguage: 'English',
          proficiencyLevel,
          scenario: currentScenario,
          partnerPersona: currentPersona,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setHelperAnswer(`${data.data.reply} (${data.data.replyTranslation})`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setHelperLoading(false);
    }
  };

  const langGreetings = LEVEL_GREETINGS[currentLanguage.id] || LEVEL_GREETINGS['spanish'];
  const levelData = langGreetings?.[proficiencyLevel];
  const pedagogicalFocus = levelData?.pedagogicalFocus || 'Conversational immersion calibrated to your CEFR level';

  return (
    <div className="flex-1 min-h-0 w-full flex glass-card-neon relative overflow-hidden rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
      
      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col h-full bg-transparent">
        
        {/* Chat Header Info Bar */}
        <div className="px-3 sm:px-6 py-2.5 sm:py-3 border-b border-white/10 bg-white/[0.02] backdrop-blur-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(244,63,94,0.35)]">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <span className="font-bold text-xs sm:text-sm text-white truncate">{currentPersona.name}</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 bg-white/10 text-slate-300 rounded-full border border-white/10 shrink-0">
                  {currentLanguage.name} Partner
                </span>
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.25)] shrink-0">
                  {proficiencyLevel.split(' - ')[0]}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[200px] sm:max-w-xs">{currentScenario.title}</p>
            </div>
          </div>

          {/* Controls: Audio playback speed & End Session */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 text-xs backdrop-blur-md">
              <span className="text-[10px] font-semibold text-slate-400 px-1.5 sm:px-2 hidden xs:inline">Speed:</span>
              {[0.75, 1.0, 1.25].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setAudioSpeed(speed)}
                  className={`px-1.5 sm:px-2 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                    audioSpeed === speed ? 'bg-cyan-500/20 text-cyan-300 shadow-xs border border-cyan-500/30' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {onResetChat && (
              <button
                onClick={() => {
                  if (messages.length > 1 && !window.confirm('Start a fresh conversation? This will clear current chat messages.')) {
                    return;
                  }
                  onResetChat();
                }}
                className="p-1.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0"
                title="Restart conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden xl:inline">New Chat</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!allGoalsCompleted) {
                  setShowGoalAlert(true);
                  setTimeout(() => setShowGoalAlert(false), 5000);
                  return;
                }
                onGenerateSessionSummary();
              }}
              disabled={isGeneratingSummary}
              className={`px-2.5 sm:px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 ${
                isGeneratingSummary
                  ? 'bg-pink-500/10 border-pink-400/20 text-pink-300/70 cursor-wait'
                  : allGoalsCompleted
                  ? 'bg-gradient-to-r from-emerald-500/30 via-pink-500/30 to-cyan-500/30 hover:from-emerald-500/40 hover:to-cyan-500/40 border-emerald-400/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)] cursor-pointer active:scale-95'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:border-amber-400/30 cursor-pointer'
              }`}
              title={
                allGoalsCompleted
                  ? 'All goals achieved! Generate comprehensive fluency review and CEFR report'
                  : `Complete all scenario goals (${completedGoalsCount}/${totalGoalsCount}) to unlock review`
              }
            >
              {isGeneratingSummary ? (
                <Loader2 className="w-3.5 h-3.5 text-pink-400 animate-spin" />
              ) : allGoalsCompleted ? (
                <Award className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="hidden sm:inline">
                {isGeneratingSummary
                  ? 'Analyzing...'
                  : allGoalsCompleted
                  ? 'Finish & Review'
                  : `Goals (${completedGoalsCount}/${totalGoalsCount})`}
              </span>
              <span className="sm:hidden">
                {allGoalsCompleted ? 'Review' : `${completedGoalsCount}/${totalGoalsCount}`}
              </span>
            </button>

            <button
              onClick={() => setShowRightSidebar(!showRightSidebar)}
              className={`p-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                showRightSidebar
                  ? 'bg-pink-500/20 border-pink-400/50 text-pink-300 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={showRightSidebar ? 'Hide Goals & Persona Panel' : 'Show Goals & Persona Panel'}
            >
              {showRightSidebar ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
              <span className="text-[11px] hidden md:inline">
                {showRightSidebar ? 'Hide Goals' : 'Goals'}
              </span>
            </button>
          </div>
        </div>

        {/* Goal completion requirement alert toast */}
        {showGoalAlert && (
          <div className="px-4 py-2.5 bg-amber-500/20 border-b border-amber-500/30 text-amber-200 text-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Goals in progress:</strong> You have completed {completedGoalsCount} of {totalGoalsCount} scenario goals. Fulfill all goals in the chat to unlock your Fluency Review!
              </span>
            </div>
            <button
              onClick={() => setShowRightSidebar(true)}
              className="px-2 py-0.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-[11px] font-bold shrink-0 underline cursor-pointer"
            >
              View Goals
            </button>
          </div>
        )}

        {/* CEFR Pedagogical Level Calibration Banner with Vibrant Glowing Border & Promotion Gateway */}
        <div className="px-3 sm:px-6 py-2 bg-[#090D1E]/85 border-b border-cyan-500/20 flex flex-wrap sm:flex-nowrap items-center justify-between text-xs backdrop-blur-xl shrink-0 gap-2">
          <div className="flex items-center gap-2 text-slate-300 min-w-0 flex-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)] shrink-0" />
            <span className="font-extrabold text-cyan-300 px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-[11px] shrink-0">
              {proficiencyLevel.split(' - ')[0]}
            </span>
            <span className="font-semibold text-slate-300 hidden lg:inline shrink-0">
              {proficiencyLevel.split(' - ')[1]}:
            </span>
            <span className="text-slate-300 truncate text-[11px] sm:text-xs">{pedagogicalFocus}</span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            {nextLevel && onOpenPromotionExam && (
              <button
                onClick={onOpenPromotionExam}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                  isReadyForPromotion
                    ? 'bg-gradient-to-r from-amber-400 to-pink-500 text-slate-950 font-black shadow-[0_0_12px_rgba(245,158,11,0.5)] animate-pulse'
                    : 'bg-white/5 hover:bg-white/10 text-cyan-300 border border-cyan-500/30'
                }`}
                title={`Take exam to unlock ${nextLevel.split(' - ')[0]}`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isReadyForPromotion ? `Exam Ready! Unlock ${nextLevel.split(' - ')[0]}` : `Level Exam (${readinessPercentage}%)`}</span>
              </button>
            )}
            <span className="text-[10px] text-pink-300 font-extrabold px-2 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 hidden sm:inline shadow-[0_0_8px_rgba(244,63,94,0.2)] shrink-0">
              AI Calibrated
            </span>
          </div>
        </div>

        {/* Live Scenario Goal Tracker Bar */}
        <div className="px-3 sm:px-6 py-2 bg-purple-950/40 border-b border-pink-500/15 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Target className="w-3.5 h-3.5 text-pink-400 shrink-0" />
            <span className="font-bold text-white text-[11px] sm:text-xs">Scenario Goals ({completedGoalsCount}/{totalGoalsCount}):</span>
            <span className="text-slate-400 text-[11px] truncate hidden md:inline">{currentScenario.title}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            {currentScenario.goals.map((g, idx) => (
              <button
                key={g.id}
                onClick={() => onUpdateScenarioGoal(g.id, !g.completed)}
                title={g.description}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
                  g.completed
                    ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.25)]'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 ${g.completed ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span className="max-w-[110px] sm:max-w-[150px] truncate">{g.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div ref={messageFeedRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            const isShowingTranslation = showTranslations[msg.id];

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 sm:gap-3 max-w-full sm:max-w-xl md:max-w-2xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {!isUser && (
                  <img
                    src={currentPersona.avatar}
                    alt={currentPersona.name}
                    className="w-8 h-8 rounded-xl object-cover shrink-0 ring-1 ring-white/20 mt-1 shadow-sm"
                  />
                )}

                <div className={`flex flex-col gap-1.5 min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
                  
                  {/* Sender Name & Time */}
                  <div className="text-[11px] font-medium text-slate-400 px-1">
                    {isUser ? 'You' : currentPersona.name}
                  </div>

                  {/* Main Bubble */}
                  <div
                    className={`p-3.5 sm:p-4 rounded-2xl text-sm leading-relaxed max-w-full break-words ${
                      isUser
                        ? 'bg-gradient-to-r from-pink-600 to-fuchsia-600 border border-pink-400/40 text-white rounded-tr-xs shadow-[0_4px_25px_rgba(244,63,94,0.35)]'
                        : 'glass-card border border-cyan-400/25 text-slate-100 rounded-tl-xs shadow-[0_4px_25px_rgba(0,0,0,0.5)]'
                    }`}
                  >
                    {/* Interactive clickable words */}
                    <div className="flex flex-wrap gap-x-1.5 gap-y-1 break-words">
                      {msg.text.split(' ').map((word, wIdx) => {
                        const cleanWord = word.replace(/[.,!?;:"'()]/g, '');
                        return (
                          <button
                            key={wIdx}
                            onClick={() => onOpenWordLookup(cleanWord, msg.text)}
                            className={`font-semibold transition-colors cursor-pointer ${
                              isUser
                                ? 'hover:text-pink-200 hover:underline'
                                : 'hover:text-cyan-300 hover:bg-white/10 px-1 py-0.5 rounded'
                            }`}
                            title="Click for dictionary definition & audio"
                          >
                            {word}
                          </button>
                        );
                      })}
                    </div>

                    {/* Phonetic guide if present */}
                    {msg.phonetic && (
                      <div className={`text-xs font-mono mt-2 border-t pt-1.5 break-words ${isUser ? 'border-white/20 text-pink-200' : 'border-white/10 text-cyan-300'}`}>
                        {msg.phonetic}
                      </div>
                    )}

                    {/* Translation toggle text */}
                    {msg.translation && isShowingTranslation && (
                      <div className={`mt-2.5 pt-2 text-xs font-normal p-2.5 rounded-xl border break-words ${isUser ? 'border-pink-400/30 bg-black/30 text-pink-100' : 'border-white/10 bg-white/5 text-slate-300'}`}>
                        <span className="font-bold text-cyan-300 mr-1">English:</span>
                        {msg.translation}
                      </div>
                    )}
                  </div>

                  {/* Action row under bubble */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] text-slate-400 px-1 max-w-full">
                    {!isUser && (
                      <>
                        <button
                          onClick={() => playMessageAudio(msg)}
                          disabled={loadingAudioId === msg.id}
                          className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border transition-all cursor-pointer ${
                            playingAudioId === msg.id
                              ? 'bg-pink-500/20 border-pink-400/40 text-pink-300 font-bold shadow-xs'
                              : loadingAudioId === msg.id
                              ? 'bg-white/10 border-white/20 text-cyan-300'
                              : 'border-transparent hover:border-white/10 hover:bg-white/5 text-slate-400 hover:text-pink-300'
                          }`}
                          title={playingAudioId === msg.id ? 'Stop playing' : 'Listen with native pronunciation'}
                        >
                          {loadingAudioId === msg.id ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                              <span className="text-[11px] font-semibold text-cyan-300">Loading...</span>
                            </>
                          ) : playingAudioId === msg.id ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                              <span className="text-[11px] text-pink-300">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>Listen</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => toggleTranslation(msg.id)}
                          className="flex items-center gap-1 text-slate-400 hover:text-pink-300 transition-colors cursor-pointer"
                        >
                          <Languages className="w-3.5 h-3.5" />
                          <span>{isShowingTranslation ? 'Hide Translation' : 'Translate'}</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onOpenPronunciationCoachWithText(msg.text)}
                      className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-pink-300 hover:text-white transition-all cursor-pointer shadow-xs"
                      title="Practice speaking this sentence with pronunciation analysis"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pink-400 animate-pulse" />
                      <span className="font-semibold text-[11px]">Drill Sentence</span>
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="hover:text-white transition-colors cursor-pointer p-0.5"
                      title="Copy text"
                    >
                      {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Inline Grammar Correction Tip if user made a mistake */}
                  {msg.correction && (
                    <div className="mt-2 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-xs text-amber-200 max-w-full sm:max-w-md shadow-sm break-words">
                      <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                        <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Language Coach Suggestion:</span>
                      </div>
                      <div className="font-medium text-white">
                        Better phrasing: <span className="text-amber-300 font-semibold underline">{msg.correction}</span>
                      </div>
                      {msg.grammarTip && <div className="text-amber-200/90 mt-1">{msg.grammarTip}</div>}
                    </div>
                  )}

                  {/* Interactive Multiple-Choice Reply Options (Only 1 correct option) */}
                  {!isUser && ((msg.replyOptions && msg.replyOptions.length > 0) || (msg.suggestedReplies && msg.suggestedReplies.length > 0)) && (
                    <div className="mt-3 p-3 rounded-2xl bg-[#0b0f24]/90 border border-purple-500/20 max-w-full sm:max-w-lg shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-pink-300">
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          <span>Choose Your Response (1 Correct Answer):</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold px-1.5 py-0.5 bg-white/5 rounded-md border border-white/10">Quiz Mode</span>
                      </div>

                      {/* Display Reply Options */}
                      {(() => {
                        const options: ReplyOption[] = msg.replyOptions && msg.replyOptions.length > 0
                          ? msg.replyOptions
                          : (msg.suggestedReplies || []).map((reply, idx) => ({
                              text: reply,
                              translation: 'Conversational response option',
                              isCorrect: idx === 0,
                              explanation: idx === 0
                                ? 'Natural, contextually appropriate response.'
                                : 'Alternative phrasing (less optimal for this scenario).',
                            }));

                        const activeSelection = selectedQuizOption[msg.id];

                        return (
                          <div className="space-y-2">
                            <div className="grid grid-cols-1 gap-2">
                              {options.map((option, oIdx) => {
                                const optionLetter = String.fromCharCode(65 + oIdx);
                                const isSelected = activeSelection?.index === oIdx;
                                const isCorrect = option.isCorrect;

                                let cardStyle = 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] hover:border-pink-500/30 text-slate-200';
                                if (isSelected) {
                                  if (isCorrect) {
                                    cardStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-100 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
                                  } else {
                                    cardStyle = 'bg-rose-500/20 border-rose-400 text-rose-100 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
                                  }
                                }

                                return (
                                  <button
                                    key={oIdx}
                                    onClick={() => {
                                      setSelectedQuizOption((prev) => ({
                                        ...prev,
                                        [msg.id]: {
                                          index: oIdx,
                                          isCorrect: option.isCorrect,
                                          explanation: option.explanation,
                                          text: option.text,
                                        },
                                      }));
                                    }}
                                    className={`w-full p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-start gap-2.5 ${cardStyle}`}
                                  >
                                    <span
                                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5 ${
                                        isSelected
                                          ? isCorrect
                                            ? 'bg-emerald-400 text-slate-950 font-black'
                                            : 'bg-rose-400 text-slate-950 font-black'
                                          : 'bg-white/10 text-slate-300'
                                      }`}
                                    >
                                      {isSelected ? (isCorrect ? '✓' : '✕') : optionLetter}
                                    </span>
                                    <div className="min-w-0 flex-1">
                                      <div className="font-semibold text-white text-[12px]">{option.text}</div>
                                      {option.translation && (
                                        <div className="text-[10.5px] text-slate-400 mt-0.5">{option.translation}</div>
                                      )}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Active Feedback Card */}
                            {activeSelection && (
                              <div
                                className={`p-2.5 rounded-xl border text-xs animate-in fade-in ${
                                  activeSelection.isCorrect
                                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                                    : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2 mb-1">
                                  <div className="flex items-center gap-1.5 font-bold text-[11px]">
                                    {activeSelection.isCorrect ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                        <span className="text-emerald-300">Correct Choice!</span>
                                      </>
                                    ) : (
                                      <>
                                        <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                        <span className="text-rose-300">Incorrect Choice — Try another option!</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-[11px] leading-relaxed mb-2 opacity-90">
                                  {activeSelection.explanation}
                                </div>

                                {activeSelection.isCorrect && (
                                  <button
                                    onClick={() => onSendMessage(activeSelection.text)}
                                    className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                                  >
                                    <span>Send & Continue Chat</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-center gap-3 mr-auto animate-in fade-in">
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-white/20"
              />
              <div className="p-3.5 rounded-2xl rounded-tl-xs bg-white/[0.06] border border-white/10 backdrop-blur-xl shadow-sm flex items-center gap-2 text-xs text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-150" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse delay-300" />
                <span className="ml-1 text-slate-300">{currentPersona.name} is formulating a response...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar & Voice Controls */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-[#090D1E]/90 backdrop-blur-xl shrink-0">
          
          {/* Quick "How do I say...?" helper banner */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setShowHelperModal(!showHelperModal)}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Need help? Ask "How do I say...?" in {currentLanguage.name}</span>
            </button>
            <span className="text-[11px] text-slate-300 font-semibold flex items-center gap-1">
              <span>{currentLanguage.flag}</span>
              <span>Target: <strong className="text-white">{currentLanguage.name}</strong></span>
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            
            {/* Voice Record Button */}
            <button
              id="voice-record-toggle-btn"
              onClick={toggleRecording}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isRecording
                  ? 'bg-rose-600 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.7)] animate-pulse'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-slate-300 hover:text-white'
              }`}
              title={isRecording ? 'Stop recording voice' : 'Speak your message'}
            >
              {isRecording ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-cyan-400" />}
            </button>

            {/* Text Input */}
            <div className="flex-1 relative">
              <input
                id="chat-text-input"
                type="text"
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  wasVoiceInputRef.current = false;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={
                  isRecording
                    ? 'Listening... Speak now in ' + currentLanguage.name
                    : `Type or speak in ${currentLanguage.name}...`
                }
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-sm text-white placeholder:text-slate-400 bg-[#090D1E]/70 focus:bg-[#090D1E] transition-all shadow-inner"
              />
            </div>

            {/* Send Button with Neon Gradient */}
            <button
              id="send-message-btn"
              onClick={handleSend}
              disabled={!inputText.trim() || isLoading}
              className="p-3 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all disabled:opacity-30 cursor-pointer"
              title="Send message"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

      </div>

      {/* Mobile Backdrop for Sidebar */}
      {showRightSidebar && (
        <div
          onClick={() => setShowRightSidebar(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Right Sidebar: Scenario Goals & Real-Time Coaching */}
      {showRightSidebar && (
        <aside
          id="chat-goals-sidebar"
          className="fixed inset-y-0 right-0 z-40 w-80 max-w-[85vw] h-full max-h-full md:static md:w-72 lg:w-80 shrink-0 self-stretch border-l border-white/10 md:border-pink-500/20 bg-[#140526]/95 md:bg-[#16052b]/90 backdrop-blur-2xl p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto shadow-2xl md:shadow-none"
        >
          {/* Sidebar Top Header with Title and Close Button */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-pink-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Practice Goals</span>
            </div>
            <button
              onClick={() => setShowRightSidebar(false)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close sidebar"
            >
              <PanelRightClose className="w-4 h-4" />
            </button>
          </div>

          {/* Scenario Goals Card */}
          <div className="p-4 rounded-2xl glass-card border border-pink-500/30 shadow-md">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-[1.5px] shadow-sm">
                <div className="w-full h-full rounded-xl bg-[#140528] flex items-center justify-center text-pink-300">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-white truncate">Practice Goals ({completedGoalsCount}/{totalGoalsCount})</h3>
                <p className="text-[11px] text-pink-300 truncate">{currentScenario.title}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5 leading-tight">
              Goals fulfill automatically as you chat. Complete all goals to unlock your CEFR review!
            </p>

            <div className="space-y-2">
              {currentScenario.goals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => onUpdateScenarioGoal(goal.id, !goal.completed)}
                  className={`p-2.5 rounded-xl border text-xs flex items-start justify-between gap-2 cursor-pointer transition-all ${
                    goal.completed
                      ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200 font-semibold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                      : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/10 hover:border-pink-500/30'
                  }`}
                  title="Click to toggle or complete through conversation"
                >
                  <span className="leading-snug">{goal.description}</span>
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      goal.completed ? 'text-emerald-400 font-bold' : 'text-slate-500'
                    }`}
                  />
                </div>
              ))}
            </div>

            {allGoalsCompleted && (
              <button
                onClick={onGenerateSessionSummary}
                disabled={isGeneratingSummary}
                className="w-full mt-3 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse"
              >
                <Award className="w-3.5 h-3.5" />
                <span>{isGeneratingSummary ? 'Analyzing Fluency...' : 'All Goals Done! Finish & Review'}</span>
              </button>
            )}
          </div>

          {/* Persona Details Card */}
          <div className="p-4 rounded-2xl glass-card border border-white/10 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shrink-0">
                <img
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                  className="w-full h-full rounded-2xl object-cover"
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{currentPersona.name}</h4>
                <div className="text-[11px] text-pink-400 font-bold">{currentPersona.role}</div>
                <div className="text-[10px] text-slate-400">{currentPersona.accent} Accent</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mt-2">{currentPersona.description}</p>
            
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Conversation Topics:</div>
              <div className="flex flex-wrap gap-1">
                {currentPersona.topics.map((t, i) => (
                  <span key={i} className="text-[10px] px-2 py-0.5 rounded-lg bg-white/5 text-slate-300 border border-white/10">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Pro-Tip Box */}
          <div className="p-4 rounded-2xl glass-card border border-pink-500/30 text-xs text-pink-200">
            <div className="flex items-center gap-1.5 font-bold text-pink-300 mb-1">
              <Sparkles className="w-4 h-4 text-pink-400 animate-spin [animation-duration:8s]" />
              <span>Interactive Pro-Tip</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Click any unfamiliar word in the chat stream to open contextual dictionary definitions, phonetic guides, and native pronunciation audio!
            </p>
          </div>
        </aside>
      )}

      {/* Helper Modal "How do I say...?" */}
      {showHelperModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card-neon bg-[#140528]/95 rounded-3xl max-w-md w-full p-6 shadow-[0_20px_60px_rgba(236,72,153,0.3)] border border-pink-500/30 text-white animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-sm text-white">How do I say...?</h3>
              </div>
              <button
                onClick={() => {
                  setShowHelperModal(false);
                  setHelperAnswer(null);
                  setHelperQuery('');
                }}
                className="text-slate-400 hover:text-white text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 mb-3">
              Type what you want to say in English, and AI will give you the most authentic phrase in {currentLanguage.name} for this scenario.
            </p>

            <div className="space-y-3">
              <input
                type="text"
                value={helperQuery}
                onChange={(e) => setHelperQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskHelper()}
                placeholder="e.g. Could you recommend the chef special?"
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/15 bg-white/5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500"
              />

              <button
                onClick={handleAskHelper}
                disabled={helperLoading || !helperQuery.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-semibold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md"
              >
                {helperLoading ? 'Translating & Adapting...' : 'Translate for Scenario'}
              </button>

              {helperAnswer && (
                <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30 text-xs">
                  <div className="text-[10px] font-bold text-pink-300 uppercase tracking-wider mb-1">Authentic Translation:</div>
                  <div className="font-bold text-white text-sm">{helperAnswer.split(' (')[0]}</div>
                  <div className="text-pink-200 text-xs mt-0.5">({helperAnswer.split(' (')[1]}</div>
                  <button
                    onClick={() => {
                      setInputText(helperAnswer.split(' (')[0]);
                      setShowHelperModal(false);
                    }}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs cursor-pointer"
                  >
                    Insert into Message Input
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
