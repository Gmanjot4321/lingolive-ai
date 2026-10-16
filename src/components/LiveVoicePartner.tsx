import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  Award,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  RefreshCw,
  HelpCircle,
  Volume1,
} from 'lucide-react';
import {
  LanguageOption,
  PartnerPersona,
  PracticeScenario,
  ProficiencyLevel,
  ChatMessage,
  SavedWord,
} from '../types';
import { getLevelGreeting } from '../data/levelGreetings';
import { AIVoiceSphere } from './AIVoiceSphere';
import {
  playPcmAudioBase64,
  stopCurrentAudioPlayback,
} from '../utils/audio';

interface LiveVoicePartnerProps {
  currentLanguage: LanguageOption;
  currentPersona: PartnerPersona;
  currentScenario: PracticeScenario;
  proficiencyLevel: ProficiencyLevel;
  onEndCallAndSummarize: (messages: ChatMessage[]) => void;
  onSaveWord: (word: SavedWord) => void;
  onOpenWordLookup: (word: string, contextSentence: string) => void;
  onUpdateScenarioGoal: (goalId: string, completed: boolean) => void;
  isGeneratingSummary?: boolean;
}

export const LiveVoicePartner: React.FC<LiveVoicePartnerProps> = ({
  currentLanguage,
  currentPersona,
  currentScenario,
  proficiencyLevel,
  onEndCallAndSummarize,
  onSaveWord,
  onOpenWordLookup,
  onUpdateScenarioGoal,
  isGeneratingSummary = false,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [partnerSpeaking, setPartnerSpeaking] = useState<boolean>(false);
  const [userSpeaking, setUserSpeaking] = useState<boolean>(false);
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [currentTurnText, setCurrentTurnText] = useState<string>('');
  const [currentSpeaker, setCurrentSpeaker] = useState<'partner' | 'user' | null>(null);
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [speechPacing, setSpeechPacing] = useState<'slow' | 'normal'>('normal');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [showGoalsDrawer, setShowGoalsDrawer] = useState<boolean>(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;
  const isConnectedRef = useRef<boolean>(false);
  isConnectedRef.current = isConnected;
  const isThinkingRef = useRef<boolean>(false);
  isThinkingRef.current = isThinking;
  const partnerSpeakingRef = useRef<boolean>(false);
  partnerSpeakingRef.current = partnerSpeaking;

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const volumeAnimFrameRef = useRef<number | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const lastSpokenTextRef = useRef<string>('');
  const transcriptScrollRef = useRef<HTMLDivElement | null>(null);

  const isA0 =
    proficiencyLevel.includes('A0') ||
    proficiencyLevel.toLowerCase().includes('zero') ||
    proficiencyLevel.toLowerCase().includes('scratch');

  // Auto-scroll transcript to bottom
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [transcript, interimTranscript]);

  // Call duration counter
  useEffect(() => {
    let interval: any;
    if (isConnected) {
      interval = setInterval(() => {
        setCallDurationSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDurationSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isConnected]);

  // Text-to-speech helper with rapid fallback
  const speakText = async (text: string, messageId?: string) => {
    stopCurrentAudioPlayback();
    if (!text.trim()) return;

    setPartnerSpeaking(true);
    setCurrentSpeaker('partner');
    if (messageId) setPlayingMessageId(messageId);

    const speed = speechPacing === 'slow' ? 0.85 : 1.0;
    const cleanText = text.trim();

    // Fallback: Web Speech API
    const speakViaBrowser = () => {
      if ('speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          // For A0, English guidance with target words is spoken in English or target code
          utterance.lang = isA0 ? 'en-US' : currentLanguage.speechCode || 'es-ES';
          utterance.rate = speed;
          utterance.onend = () => {
            setPartnerSpeaking(false);
            setCurrentSpeaker(null);
            setPlayingMessageId(null);
          };
          utterance.onerror = () => {
            setPartnerSpeaking(false);
            setCurrentSpeaker(null);
            setPlayingMessageId(null);
          };
          window.speechSynthesis.speak(utterance);
          return;
        } catch {
          setPartnerSpeaking(false);
          setCurrentSpeaker(null);
          setPlayingMessageId(null);
        }
      }
      setPartnerSpeaking(false);
      setCurrentSpeaker(null);
      setPlayingMessageId(null);
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          text: cleanText,
          voiceName: currentPersona.voice,
          speed,
          language: isA0 ? 'en' : currentLanguage.speechCode.split('-')[0],
        }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      if (data.success && data.audio) {
        await playPcmAudioBase64(data.audio, 24000, speed, () => {
          setPartnerSpeaking(false);
          setCurrentSpeaker(null);
          setPlayingMessageId(null);
        });
      } else {
        speakViaBrowser();
      }
    } catch {
      speakViaBrowser();
    }
  };

  // Start continuous audio level monitoring from user's mic
  const startVolumeMonitoring = (stream: MediaStream) => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkVolume = () => {
        if (!isConnectedRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(1, avg / 80);
        setInputVolume(normalized);

        const isSpeaking = normalized > 0.12 && !isMutedRef.current && !partnerSpeakingRef.current;
        setUserSpeaking(isSpeaking);
        if (isSpeaking) {
          setCurrentSpeaker('user');
        }

        volumeAnimFrameRef.current = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (e) {
      console.warn('AudioContext volume monitoring setup failed:', e);
    }
  };

  // Process user's spoken turn and ask AI partner to respond adaptively
  const handleUserSpokenTurn = async (rawText: string) => {
    const userText = rawText.trim();
    if (!userText || isThinkingRef.current) return;

    setInterimTranscript('');
    lastSpokenTextRef.current = '';

    // Add user turn to transcript
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: userText,
      timestamp: new Date(),
    };

    const updatedTranscript = [...transcript, userMsg];
    setTranscript(updatedTranscript);
    setCurrentTurnText(`You: ${userText}`);
    setIsThinking(true);
    setCurrentSpeaker(null);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedTranscript.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          targetLanguage: currentLanguage.name,
          nativeLanguage: 'English',
          proficiencyLevel,
          scenario: currentScenario,
          partnerPersona: currentPersona,
          goals: currentScenario.goals,
        }),
      });

      const data = await res.json();
      setIsThinking(false);

      if (data.reply) {
        const partnerMsg: ChatMessage = {
          id: `partner-${Date.now()}`,
          role: 'partner',
          text: data.reply,
          translation: data.replyTranslation,
          phonetic: data.phoneticGuide,
          correction: data.correction,
          grammarTip: data.grammarTip,
          suggestedReplies: data.suggestedReplies,
          timestamp: new Date(),
        };

        setTranscript((prev) => [...prev, partnerMsg]);
        setCurrentTurnText(`${currentPersona.name}: ${data.reply}`);

        // Update goals completed
        if (Array.isArray(data.goalsCompleted) && data.goalsCompleted.length > 0) {
          data.goalsCompleted.forEach((gid: string) => {
            onUpdateScenarioGoal(gid, true);
          });
        }

        // Partner speaks response out loud
        speakText(data.reply, partnerMsg.id);
      }
    } catch (err: any) {
      setIsThinking(false);
      console.error('Error generating partner voice response:', err);

      // Adaptive conversational fallback
      const fallbackReply = isA0
        ? `To say "Very good!" in ${currentLanguage.name}, we say "${currentScenario.samplePhrase || 'Bien'}". Can you try saying that?`
        : `¡Muy bien! Te escucho con claridad. ¿Qué más me puedes comentar sobre ${currentScenario.title}?`;

      const partnerMsg: ChatMessage = {
        id: `partner-${Date.now()}`,
        role: 'partner',
        text: fallbackReply,
        translation: 'Very good! I hear you clearly. What else can you tell me?',
        timestamp: new Date(),
      };
      setTranscript((prev) => [...prev, partnerMsg]);
      setCurrentTurnText(`${currentPersona.name}: ${fallbackReply}`);
      speakText(fallbackReply, partnerMsg.id);
    }
  };

  // Initialize Speech Recognition loop
  const initSpeechRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn('SpeechRecognition API not available in this browser');
      return null;
    }

    try {
      const recognition = new SpeechRecognition();
      // For A0, users speak mostly English with occasional target words
      recognition.lang = isA0 ? 'en-US' : currentLanguage.speechCode || 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        if (isMutedRef.current || partnerSpeakingRef.current) return;

        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptChunk = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcriptChunk + ' ';
          } else {
            currentInterim += transcriptChunk;
          }
        }

        const combined = (finalChunk + currentInterim).trim();
        if (combined) {
          setInterimTranscript(combined);
          lastSpokenTextRef.current = combined;
          setUserSpeaking(true);
          setCurrentSpeaker('user');

          // Reset silence timer: when user pauses for 1.6s, submit the turn automatically
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (lastSpokenTextRef.current.trim() && !partnerSpeakingRef.current) {
              const textToSend = lastSpokenTextRef.current;
              lastSpokenTextRef.current = '';
              handleUserSpokenTurn(textToSend);
            }
          }, 1600);
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error !== 'no-speech') {
          console.warn('Speech recognition status:', e.error);
        }
      };

      recognition.onend = () => {
        // Automatically restart listening if call is active
        if (isConnectedRef.current && !isMutedRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      return recognition;
    } catch (e) {
      console.warn('Speech recognition init error:', e);
      return null;
    }
  };

  // Start live voice call session
  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      setErrorMsg(null);
      stopCurrentAudioPlayback();

      // 1. Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Start volume analyser
      startVolumeMonitoring(stream);

      // 3. Start speech recognition
      const recognition = initSpeechRecognition();
      if (recognition) {
        recognitionRef.current = recognition;
        try {
          recognition.start();
        } catch {}
      }

      setIsConnected(true);
      setIsConnecting(false);

      // 4. Determine initial greeting based on level and scenario
      const levelGreetingData = getLevelGreeting(
        currentLanguage.id,
        currentLanguage.name,
        proficiencyLevel,
        currentScenario.samplePhrase || 'Bonjour',
        currentScenario.sampleTranslation || 'Hello',
        currentPersona.name
      );

      const openingText = levelGreetingData.text;

      const introMsg: ChatMessage = {
        id: `intro-${Date.now()}`,
        role: 'partner',
        text: openingText,
        translation: levelGreetingData.translation,
        phonetic: levelGreetingData.phonetic,
        suggestedReplies: levelGreetingData.suggestedStarters,
        timestamp: new Date(),
      };

      setTranscript([introMsg]);
      setCurrentTurnText(`${currentPersona.name}: ${openingText}`);

      // Greet the student out loud!
      setTimeout(() => {
        speakText(openingText, introMsg.id);
      }, 400);
    } catch (err: any) {
      console.error('Failed to start Live Voice session:', err);
      setErrorMsg(
        err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Please allow microphone access to start the voice call.'
          : err.message || 'Microphone initialization failed.'
      );
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  // End live voice call session and trigger review
  const endLiveSession = () => {
    stopCurrentAudioPlayback();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (volumeAnimFrameRef.current) {
      cancelAnimationFrame(volumeAnimFrameRef.current);
      volumeAnimFrameRef.current = null;
    }

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setPartnerSpeaking(false);
    setUserSpeaking(false);
    setIsThinking(false);
    setCurrentSpeaker(null);

    // Trigger fluency summary and evaluation
    if (transcript.length > 0) {
      onEndCallAndSummarize(transcript);
    }
  };

  // Manual interrupt of partner speech
  const handleInterrupt = () => {
    stopCurrentAudioPlayback();
    setPartnerSpeaking(false);
    setCurrentSpeaker(null);
  };

  // Submit typed or manually spoken message
  const handleSendManualMessage = () => {
    const text = typedMessage.trim() || interimTranscript.trim();
    if (!text) return;
    setTypedMessage('');
    setInterimTranscript('');
    handleUserSpokenTurn(text);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCurrentAudioPlayback();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (volumeAnimFrameRef.current) {
        cancelAnimationFrame(volumeAnimFrameRef.current);
      }
    };
  }, []);

  const completedGoalsCount = currentScenario.goals.filter((g) => g.completed).length;
  const totalGoalsCount = currentScenario.goals.length;

  return (
    <div className="flex-1 min-h-0 flex flex-col glass-card-neon text-white relative overflow-hidden rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] border border-white/10">
      
      {/* Top Call Navigation & Status Bar */}
      <div className="relative z-10 px-4 sm:px-6 py-2.5 border-b border-white/10 flex items-center justify-between bg-white/[0.03] backdrop-blur-xl shrink-0 gap-2">
        
        {/* Left: Persona identity */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#060814] ${
                isConnected ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,1)]' : 'bg-slate-500'
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">{currentPersona.name}</h2>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-extrabold border border-cyan-400/30">
                {currentLanguage.name} • {proficiencyLevel.split(' - ')[0]}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-pink-300/80 truncate">
              {currentPersona.role} • {currentPersona.accent} Accent
            </p>
          </div>
        </div>

        {/* Center: Live Call Timer HUD */}
        <div className="flex items-center gap-2 shrink-0">
          {isConnected && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-xs font-mono font-bold shadow-[0_0_15px_rgba(236,72,153,0.3)]">
              <span className="w-2 h-2 rounded-full bg-pink-400 animate-ping" />
              <span>
                {Math.floor(callDurationSeconds / 60)
                  .toString()
                  .padStart(2, '0')}
                :
                {(callDurationSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Speech Pacing Toggle */}
          <button
            onClick={() => setSpeechPacing(speechPacing === 'normal' ? 'slow' : 'normal')}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
              speechPacing === 'slow'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle speech pace"
          >
            {speechPacing === 'slow' ? '🐢 Slow Pace' : '⚡ Normal'}
          </button>

          {/* Toggle Goals Pill */}
          <button
            onClick={() => setShowGoalsDrawer(!showGoalsDrawer)}
            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
              showGoalsDrawer
                ? 'bg-pink-500/25 border-pink-400 text-pink-200'
                : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
            }`}
          >
            <Award className="w-3 h-3 text-amber-400" />
            <span>Goals ({completedGoalsCount}/{totalGoalsCount})</span>
          </button>
        </div>

        {/* Right: Quick Review Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={endLiveSession}
            disabled={(!isConnected && transcript.length === 0) || isGeneratingSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500/25 to-purple-600/25 hover:from-pink-500/35 hover:to-purple-600/35 border border-pink-400/40 text-pink-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-40"
            title="Evaluate full call conversation"
          >
            {isGeneratingSummary ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-pink-300" />
            ) : (
              <Award className="w-3.5 h-3.5 text-pink-300" />
            )}
            <span className="hidden sm:inline">
              {isGeneratingSummary ? 'Evaluating...' : 'Evaluate Call'}
            </span>
          </button>
        </div>

      </div>

      {/* Main Dual Stage: Left Voice Call Stage | Right Live Transcript */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden relative">

        {/* LEFT COLUMN: Voice Call Stage & 3D Interactive Sphere */}
        <div className="w-full lg:w-[50%] flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-gradient-to-b from-white/[0.02] to-transparent p-3 sm:p-5 justify-between relative overflow-y-auto">
          
          {/* Top Banner with Scenario & CEFR level */}
          <div className="flex items-center justify-between gap-2 px-3.5 py-1.5 rounded-2xl bg-white/[0.05] border border-white/10 text-xs shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-black text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-lg border border-cyan-400/30 text-[10px]">
                {proficiencyLevel.split(' - ')[0]}
              </span>
              <span className="text-slate-200 font-semibold truncate">{currentScenario.title}</span>
            </div>
            {isA0 && (
              <span className="text-[10px] text-pink-300 font-bold bg-pink-500/15 px-2 py-0.5 rounded-lg border border-pink-400/30">
                A0 Guided Tutor Mode
              </span>
            )}
          </div>

          {/* Error Notice */}
          {errorMsg && (
            <div className="my-2 p-3 rounded-2xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2 shadow-lg backdrop-blur-md animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-rose-300">Connection Notice</div>
                <div className="text-rose-200">{errorMsg}</div>
              </div>
            </div>
          )}

          {/* 3D Animated AI Voice Sphere */}
          <div className="my-auto py-2 flex flex-col items-center justify-center shrink-0">
            <AIVoiceSphere
              partnerSpeaking={partnerSpeaking}
              userSpeaking={userSpeaking}
              isConnected={isConnected}
              inputVolume={inputVolume}
              partnerName={currentPersona.name}
            />

            {/* Speaking Status Pill */}
            <div className="mt-2 flex items-center justify-center">
              {isThinking ? (
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-semibold animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-300" />
                  <span>{currentPersona.name} is listening & adapting...</span>
                </div>
              ) : partnerSpeaking ? (
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-pink-200 text-xs font-semibold shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                  <Volume2 className="w-3.5 h-3.5 text-pink-300 animate-bounce" />
                  <span>{currentPersona.name} is speaking...</span>
                </div>
              ) : userSpeaking ? (
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <Mic className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
                  <span>Listening to your speech...</span>
                </div>
              ) : isConnected ? (
                <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-400/25 text-cyan-200 text-xs">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span>Microphone ready — speak anytime!</span>
                </div>
              ) : (
                <div className="text-xs text-slate-300 text-center max-w-sm">
                  Click <span className="text-pink-300 font-bold">Start Live Voice Call</span> to talk with {currentPersona.name}.
                </div>
              )}
            </div>

            {/* Live Subtitle HUD */}
            <div className="w-full mt-3 min-h-[52px] max-h-24 flex items-center justify-center px-2">
              {interimTranscript ? (
                <div className="p-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-medium text-center shadow-lg animate-in fade-in">
                  <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">Hearing you...</span>
                  &quot;{interimTranscript}&quot;
                </div>
              ) : currentTurnText ? (
                <div className="p-2.5 rounded-2xl glass-card-neon border border-pink-500/30 text-slate-100 text-xs sm:text-sm font-medium text-center shadow-md animate-in fade-in max-h-24 overflow-y-auto">
                  {currentTurnText}
                </div>
              ) : null}
            </div>

            {/* Suggested Starter Chips */}
            {currentScenario.suggestedStarters && currentScenario.suggestedStarters.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center justify-center gap-1.5 max-w-md shrink-0">
                <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider w-full flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-300" />
                  <span>Suggested speech starters:</span>
                </span>
                {currentScenario.suggestedStarters.slice(0, 3).map((starter, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (isConnected) {
                        handleUserSpokenTurn(starter);
                      } else {
                        speakText(starter);
                      }
                    }}
                    className="px-2.5 py-1 rounded-xl bg-white/[0.08] hover:bg-pink-500/20 border border-white/15 text-[11px] text-slate-200 hover:text-white transition-all shadow-sm hover:border-pink-400/40 cursor-pointer flex items-center gap-1"
                  >
                    <span>&quot;{starter}&quot;</span>
                    <Volume2 className="w-3 h-3 text-pink-300 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Voice Dock Controls */}
          <div className="pt-2 border-t border-white/10 shrink-0">
            <div className="flex items-center justify-between gap-2">
              
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                disabled={!isConnected}
                className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                  isMuted
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                    : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                } disabled:opacity-40`}
                title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Main Call Action: Start Call / End Call */}
              <div className="flex-1 flex justify-center">
                {!isConnected ? (
                  <button
                    id="start-live-call-btn"
                    onClick={startLiveSession}
                    disabled={isConnecting}
                    className="flex items-center justify-center gap-2.5 w-full max-w-xs px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 text-white font-black text-xs sm:text-sm shadow-[0_0_30px_rgba(236,72,153,0.55)] border border-pink-300/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isConnecting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Connecting with {currentPersona.name}...</span>
                      </>
                    ) : (
                      <>
                        <Mic className="w-4 h-4 text-white animate-pulse" />
                        <span>Start Live Voice Call</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    id="end-live-call-btn"
                    onClick={endLiveSession}
                    className="flex items-center justify-center gap-2 w-full max-w-xs px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-rose-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>End Call & Review Fluency</span>
                  </button>
                )}
              </div>

              {/* Interrupt / Stop speaking button */}
              {isConnected && partnerSpeaking && (
                <button
                  onClick={handleInterrupt}
                  className="px-3 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-slate-200 transition-colors cursor-pointer shrink-0"
                  title="Interrupt AI to speak now"
                >
                  Interrupt
                </button>
              )}
            </div>

            {/* Quick text-turn fallback input in case mic is noisy */}
            {isConnected && (
              <div className="mt-2.5 flex items-center gap-1.5">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendManualMessage();
                  }}
                  placeholder="Can't speak aloud? Type message here..."
                  className="flex-1 bg-white/[0.05] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-pink-400/60"
                />
                <button
                  onClick={handleSendManualMessage}
                  disabled={!typedMessage.trim() && !interimTranscript.trim()}
                  className="p-1.5 rounded-xl bg-pink-500/30 hover:bg-pink-500/50 border border-pink-400/40 text-pink-200 hover:text-white transition-all cursor-pointer disabled:opacity-40"
                  title="Send turn"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Live Transcript & Scenario Panel */}
        <div className="w-full lg:w-[50%] flex flex-col bg-white/[0.01] p-3 sm:p-4 overflow-hidden">
          
          {/* Transcript Header with Scenario Goals Drawer */}
          <div className="flex items-center justify-between pb-2 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-300" />
              <h3 className="text-xs sm:text-sm font-bold text-white">Live Call Transcript</h3>
              <span className="text-[10px] text-cyan-300 font-semibold bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-400/25">
                {transcript.length} turns
              </span>
            </div>
            <div className="text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-pink-300" />
              <span>Tap words for dictionary</span>
            </div>
          </div>

          {/* Goals Drawer (if toggled) */}
          {showGoalsDrawer && (
            <div className="my-2 p-3 rounded-2xl glass-card-neon border border-pink-500/30 shadow-lg animate-in fade-in shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-pink-300">Scenario Goals</span>
                <span className="text-[10px] text-slate-300">
                  {completedGoalsCount} of {totalGoalsCount} completed
                </span>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {currentScenario.goals.map((g) => (
                  <div
                    key={g.id}
                    onClick={() => onUpdateScenarioGoal(g.id, !g.completed)}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      g.completed
                        ? 'bg-pink-500/20 border-pink-400/40 text-pink-200'
                        : 'bg-white/[0.03] border-white/10 text-slate-300 hover:bg-white/[0.06]'
                    }`}
                  >
                    <span>{g.description}</span>
                    <CheckCircle2
                      className={`w-3.5 h-3.5 shrink-0 ml-2 ${
                        g.completed ? 'text-pink-400 font-bold' : 'text-slate-500'
                      }`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Transcript Scroll Area */}
          <div
            ref={transcriptScrollRef}
            className="flex-1 overflow-y-auto space-y-3 py-3 pr-1 min-h-0"
          >
            {transcript.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3 text-pink-300">
                  <Mic className="w-6 h-6 animate-pulse" />
                </div>
                <p className="font-semibold text-slate-300">No voice turns yet</p>
                <p className="mt-1 max-w-xs text-[11px] text-slate-400">
                  Start the voice call to speak naturally with {currentPersona.name}. Your spoken dialogue will appear here with live translations and vocabulary lookups.
                </p>
              </div>
            ) : (
              transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-400 mb-1 px-1">
                    <span>{msg.role === 'user' ? 'You' : currentPersona.name}</span>
                    <span>•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div
                    className={`p-3 rounded-2xl text-xs sm:text-sm max-w-[92%] leading-relaxed shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-xs shadow-[0_4px_15px_rgba(236,72,153,0.3)]'
                        : 'glass-card border border-white/15 text-slate-100 rounded-tl-xs'
                    }`}
                  >
                    {/* Interactive words */}
                    <div className="flex flex-wrap gap-x-1 gap-y-0.5">
                      {msg.text.split(/\s+/).map((word, wIdx) => {
                        const cleanWord = word.replace(/[.,!?;:"'()]/g, '');
                        return (
                          <span
                            key={wIdx}
                            onClick={() => {
                              if (cleanWord.trim()) {
                                onOpenWordLookup(cleanWord.trim(), msg.text);
                              }
                            }}
                            className={`cursor-pointer transition-colors ${
                              msg.role === 'user'
                                ? 'hover:text-amber-200 hover:underline'
                                : 'hover:text-pink-300 hover:underline underline-offset-2'
                            }`}
                            title="Tap to look up definition & save"
                          >
                            {word}{' '}
                          </span>
                        );
                      })}
                    </div>

                    {/* Phonetic & Translation guide for partner messages */}
                    {msg.role === 'partner' && (msg.phonetic || msg.translation) && (
                      <div className="mt-2 pt-2 border-t border-white/10 text-[11px] space-y-1">
                        {msg.phonetic && (
                          <div className="text-cyan-300 font-mono text-[10px]">
                            🗣 {msg.phonetic}
                          </div>
                        )}
                        {msg.translation && (
                          <div className="text-slate-300 italic text-[11px]">
                            &ldquo;{msg.translation}&rdquo;
                          </div>
                        )}
                      </div>
                    )}

                    {/* Correction / Tip if user made an error */}
                    {msg.correction && (
                      <div className="mt-2 p-2 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-[10px] space-y-0.5">
                        <div className="font-bold">💡 Gentle Tip:</div>
                        <div>Try: <span className="text-amber-300 font-semibold">{msg.correction}</span></div>
                        {msg.grammarTip && <div className="text-amber-100/80">{msg.grammarTip}</div>}
                      </div>
                    )}

                    {/* Audio replay button for partner turns */}
                    {msg.role === 'partner' && (
                      <div className="mt-2 flex items-center justify-end">
                        <button
                          onClick={() => speakText(msg.text, msg.id)}
                          className="flex items-center gap-1 text-[10px] text-pink-300 hover:text-white px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                          title="Replay spoken audio"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{playingMessageId === msg.id ? 'Playing...' : 'Listen'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Live interim speech bubble */}
            {interimTranscript && (
              <div className="flex flex-col items-end animate-in fade-in">
                <div className="text-[10px] text-emerald-400 font-bold mb-1">Speaking...</div>
                <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm max-w-[85%] italic">
                  &quot;{interimTranscript}&quot;
                </div>
              </div>
            )}
          </div>

          {/* Bottom Evaluation Action Bar in Transcript */}
          {transcript.length > 0 && (
            <div className="pt-2 border-t border-white/10 shrink-0 flex items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400">
                Ready for feedback?
              </span>
              <button
                onClick={() => onEndCallAndSummarize(transcript)}
                disabled={isGeneratingSummary}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 hover:from-emerald-500/40 hover:to-cyan-500/40 border border-emerald-400/50 text-emerald-200 hover:text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 disabled:opacity-40"
              >
                {isGeneratingSummary ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                ) : (
                  <Award className="w-3.5 h-3.5 text-emerald-300" />
                )}
                <span>{isGeneratingSummary ? 'Evaluating Call...' : 'Evaluate Full Conversation'}</span>
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
