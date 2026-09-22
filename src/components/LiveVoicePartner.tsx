import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  PhoneOff,
  Volume2,
  VolumeX,
  Sparkles,
  RefreshCw,
  Award,
  BookOpen,
  MessageSquare,
  Globe,
  Radio,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { LanguageOption, PartnerPersona, PracticeScenario, ProficiencyLevel, ChatMessage, SavedWord } from '../types';
import { GaplessAudioQueue, pcmFloat32ToBase64 } from '../utils/audio';
import { LEVEL_GREETINGS } from '../data/levelGreetings';
import { AIVoiceSphere } from './AIVoiceSphere';

interface LiveVoicePartnerProps {
  currentLanguage: LanguageOption;
  currentPersona: PartnerPersona;
  currentScenario: PracticeScenario;
  proficiencyLevel: ProficiencyLevel;
  onEndCallAndSummarize: (messages: ChatMessage[]) => void;
  onSaveWord: (word: SavedWord) => void;
  onOpenWordLookup: (word: string, contextSentence: string) => void;
  onUpdateScenarioGoal: (goalId: string, completed: boolean) => void;
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
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [partnerSpeaking, setPartnerSpeaking] = useState<boolean>(false);
  const [userSpeaking, setUserSpeaking] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<ChatMessage[]>([]);
  const [currentTurnText, setCurrentTurnText] = useState<string>('');
  const [liveHint, setLiveHint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'orb' | 'transcript' | 'goals'>('orb');
  const [inputVolume, setInputVolume] = useState<number>(0);
  const [callDurationSeconds, setCallDurationSeconds] = useState<number>(0);
  const [speechPacing, setSpeechPacing] = useState<'slow' | 'normal'>('normal');

  const wsRef = useRef<WebSocket | null>(null);
  const audioQueueRef = useRef<GaplessAudioQueue | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const isMutedRef = useRef<boolean>(false);
  isMutedRef.current = isMuted;

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

  // Audio starter pronunciation preview
  const handlePlayStarterAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = currentLanguage.speechCode || 'es-ES';
    utterance.rate = speechPacing === 'slow' ? 0.8 : 0.95;
    window.speechSynthesis.speak(utterance);
  };

  // Initialize Gapless Audio Queue
  useEffect(() => {
    audioQueueRef.current = new GaplessAudioQueue((playing) => {
      setPartnerSpeaking(playing);
    });

    return () => {
      audioQueueRef.current?.stop();
    };
  }, []);

  // Connect to Gemini Live API WebSocket
  const startLiveSession = async () => {
    try {
      setIsConnecting(true);
      setErrorMsg(null);

      // 1. Get User Media Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      micStreamRef.current = stream;

      // 2. Setup Web Audio Input Processor at 16kHz
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputCtx = new AudioContextClass({ sampleRate: 16000 });
      inputAudioCtxRef.current = inputCtx;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      // Simple volume analyzer
      const analyser = inputCtx.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      analyser.connect(processor);
      processor.connect(inputCtx.destination);

      // 3. Connect to WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to server Live WS, sending session config...');
        ws.send(
          JSON.stringify({
            type: 'start_session',
            targetLanguage: currentLanguage.name,
            proficiencyLevel: proficiencyLevel,
            scenarioTitle: `${currentScenario.title}: ${currentScenario.description}`,
            partnerName: currentPersona.name,
            voiceName: currentPersona.voice,
          })
        );
      };

      ws.onmessage = (evt) => {
        try {
          const data = JSON.parse(evt.data);

          if (data.type === 'session_ready') {
            setIsConnected(true);
            setIsConnecting(false);
            // Add initial system message
            const introMsg: ChatMessage = {
              id: 'init-msg',
              role: 'system',
              text: `Connected to ${currentPersona.name} in ${currentLanguage.name}. Start speaking into your microphone!`,
              timestamp: new Date(),
            };
            setTranscript((prev) => [...prev, introMsg]);
          } else if (data.type === 'audio_chunk' && data.audio) {
            audioQueueRef.current?.enqueueChunk(data.audio, 24000);
          } else if (data.type === 'partner_text' && data.text) {
            setCurrentTurnText((prev) => prev + data.text);
          } else if (data.type === 'interrupted') {
            console.log('User interrupted partner');
            audioQueueRef.current?.stop();
            setPartnerSpeaking(false);
          } else if (data.type === 'turn_complete') {
            setCurrentTurnText((text) => {
              if (text.trim()) {
                const partnerMsg: ChatMessage = {
                  id: `partner-${Date.now()}`,
                  role: 'partner',
                  text: text.trim(),
                  timestamp: new Date(),
                };
                setTranscript((prev) => [...prev, partnerMsg]);
              }
              return '';
            });
          } else if (data.type === 'error') {
            console.error('WS Error message:', data.error);
            setErrorMsg(data.error);
          }
        } catch (e) {
          console.error('Error handling WS message:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('WebSocket error:', e);
        setErrorMsg('Failed to connect to real-time voice service. Please verify your microphone and connection.');
        setIsConnecting(false);
        setIsConnected(false);
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        setIsConnected(false);
        setIsConnecting(false);
      };

      // 4. Stream Mic Audio to WS
      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setInputVolume(avg);
        setUserSpeaking(avg > 15);

        const channelData = e.inputBuffer.getChannelData(0);
        const base64Audio = pcmFloat32ToBase64(channelData);

        wsRef.current.send(
          JSON.stringify({
            type: 'audio_input',
            audio: base64Audio,
          })
        );
      };
    } catch (err: any) {
      console.error('Failed to start Live session:', err);
      setErrorMsg(err.message || 'Microphone access denied or audio initialization failed.');
      setIsConnecting(false);
      setIsConnected(false);
    }
  };

  // End live voice call
  const endLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: 'end_session' }));
      wsRef.current.close();
      wsRef.current = null;
    }

    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (inputAudioCtxRef.current && inputAudioCtxRef.current.state !== 'closed') {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }

    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }

    audioQueueRef.current?.stop();
    setIsConnected(false);
    setIsConnecting(false);
    setPartnerSpeaking(false);
    setUserSpeaking(false);

    // Trigger session analysis report if there was a conversation
    if (transcript.length > 1) {
      onEndCallAndSummarize(transcript);
    }
  };

  // Cleanup on unmount or persona/language change
  useEffect(() => {
    return () => {
      endLiveSession();
    };
  }, [currentLanguage.id, currentPersona.id, currentScenario.id]);

  const langGreetings = LEVEL_GREETINGS[currentLanguage.id] || LEVEL_GREETINGS['spanish'];
  const levelData = langGreetings?.[proficiencyLevel];
  const pedagogicalFocus = levelData?.pedagogicalFocus || 'Conversational pacing calibrated to your CEFR level';

  return (
    <div className="flex-1 min-h-0 flex flex-col glass-card-neon text-white relative overflow-hidden rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
      
      {/* Top Status Bar & Scenario Tracker with Neon Accents */}
      <div className="relative z-10 px-3 sm:px-6 py-2 sm:py-3 border-b border-white/10 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl shrink-0 gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(244,63,94,0.4)]">
              <img
                src={currentPersona.avatar}
                alt={currentPersona.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#060814] ${
                isConnected ? 'bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,1)]' : 'bg-slate-500'
              }`}
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h2 className="text-xs sm:text-sm font-bold text-white truncate">{currentPersona.name}</h2>
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 font-extrabold border border-cyan-400/30 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                {currentLanguage.name} • {proficiencyLevel.split(' - ')[0]}
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-300 truncate hidden xs:block">{currentPersona.role}</p>
          </div>
        </div>

        {/* Center Live Status pill & Call Duration HUD */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {isConnected && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-400/40 text-pink-300 text-[10px] sm:text-xs font-mono font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-ping" />
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
            className={`px-2 sm:px-2.5 py-1 rounded-xl text-[10px] sm:text-[11px] font-bold border transition-all cursor-pointer ${
              speechPacing === 'slow'
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
            }`}
            title="Calibrate speech pacing"
          >
            {speechPacing === 'slow' ? '🐢 Slow' : '⚡ Normal'}
          </button>
        </div>

        {/* View Tabs Switcher */}
        <div className="flex items-center bg-white/5 p-0.5 sm:p-1 rounded-2xl border border-white/10 backdrop-blur-md shrink-0">
          <button
            onClick={() => setActiveTab('orb')}
            className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'orb'
                ? 'bg-gradient-to-r from-pink-500/25 to-cyan-500/25 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Stage
          </button>
          <button
            onClick={() => setActiveTab('transcript')}
            className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'transcript'
                ? 'bg-gradient-to-r from-pink-500/25 to-cyan-500/25 text-white shadow-[0_0_12px_rgba(244,63,94,0.3)] border border-pink-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Transcript {transcript.length > 0 && `(${transcript.length})`}
          </button>
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-2 sm:px-3 py-1 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'goals'
                ? 'bg-gradient-to-r from-pink-500/25 to-cyan-500/25 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)] border border-cyan-400/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Goals
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="flex-1 min-h-0 relative flex flex-col items-center justify-start sm:justify-center p-2.5 sm:p-4 overflow-y-auto bg-transparent">
        
        {/* Error Notification */}
        {errorMsg && (
          <div className="absolute top-2 z-20 max-w-md w-full p-3 rounded-2xl bg-rose-950/80 border border-rose-500/30 text-rose-200 text-xs flex items-start gap-2 shadow-lg backdrop-blur-md animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-rose-300">Connection Notice</div>
              <div className="text-rose-200">{errorMsg}</div>
            </div>
          </div>
        )}

        {/* TAB 1: Live Voice Orb Stage (Engineered to fit with 0 scrolling) */}
        {activeTab === 'orb' && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-between text-center max-w-xl w-full py-1">
            
            {/* Compact Scenario & CEFR Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/12 text-xs text-slate-200 shadow-sm shrink-0">
              <span className="font-extrabold text-cyan-300 bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-400/30 text-[10px]">
                {proficiencyLevel.split(' - ')[0]}
              </span>
              <span className="text-slate-200 font-semibold truncate max-w-[280px] sm:max-w-md">{currentScenario.title}</span>
            </div>

            {/* Modern Moving 3D Fluid AI Voice Sphere */}
            <AIVoiceSphere
              partnerSpeaking={partnerSpeaking}
              userSpeaking={userSpeaking}
              isConnected={isConnected}
              inputVolume={inputVolume}
              partnerName={currentPersona.name}
            />

            {/* Real-time Subtitle / Spoken Feed with Clickable Words */}
            <div className="w-full min-h-[56px] max-h-24 flex items-center justify-center px-2 py-1 shrink-0">
              {currentTurnText ? (
                <div className="p-3 rounded-2xl glass-card-neon border border-pink-400/40 text-white text-xs sm:text-sm font-medium leading-relaxed max-w-lg shadow-[0_10px_35px_rgba(236,72,153,0.3)] animate-in fade-in overflow-y-auto max-h-24">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-pink-400 font-black text-[10px] uppercase tracking-wider">{currentPersona.name}</span>
                    <span className="text-[9px] text-cyan-300 font-semibold flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" /> Tap any word for instant meaning
                    </span>
                  </div>
                  <p className="text-slate-100">
                    {currentTurnText.split(/\s+/).map((w, idx) => {
                      const clean = w.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"']/g, '');
                      return (
                        <span
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (clean.trim()) onOpenWordLookup(clean.trim(), currentTurnText);
                          }}
                          className="hover:text-pink-300 hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          {w}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ) : transcript.length > 0 && transcript[transcript.length - 1].role === 'partner' ? (
                <div className="p-3 rounded-2xl glass-card border border-white/18 text-slate-200 text-xs sm:text-sm font-medium leading-relaxed max-w-lg shadow-xl overflow-y-auto max-h-24">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-pink-400 font-bold text-[10px]">{currentPersona.name}</span>
                    <span className="text-[9px] text-slate-400">Click words for definition</span>
                  </div>
                  <p>
                    {transcript[transcript.length - 1].text.split(/\s+/).map((w, idx) => {
                      const clean = w.replace(/[.,/#!$%^&*;:{}=\-_`~()¿?¡!"']/g, '');
                      return (
                        <span
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (clean.trim()) onOpenWordLookup(clean.trim(), transcript[transcript.length - 1].text);
                          }}
                          className="hover:text-pink-300 hover:underline underline-offset-4 cursor-pointer transition-colors"
                        >
                          {w}{' '}
                        </span>
                      );
                    })}
                  </p>
                </div>
              ) : !isConnected ? (
                <p className="text-xs text-slate-300 max-w-md text-center">
                  Practice natural real-time speech calibrated for <span className="text-cyan-300 font-bold">{proficiencyLevel.split(' - ')[0]}</span> with <span className="text-pink-300 font-bold">{currentPersona.name}</span>.
                </p>
              ) : (
                <div className="text-[11px] sm:text-xs text-pink-200 flex items-center gap-2 bg-pink-500/10 px-3.5 py-1.5 rounded-full border border-pink-500/25">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,1)]" />
                  Live audio stream active. Speak in {currentLanguage.name} naturally.
                </div>
              )}
            </div>

            {/* Conversation Starters & Suggestions with Audio Preview */}
            <div className="mt-1 flex flex-wrap items-center justify-center gap-1.5 max-w-lg shrink-0">
              <span className="text-[10px] font-bold text-pink-300 uppercase tracking-wider w-full flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-cyan-300" />
                <span>Suggested Prompt Starters:</span>
              </span>
              {currentScenario.suggestedStarters.slice(0, 3).map((starter, i) => (
                <div
                  key={i}
                  className="flex items-center rounded-lg bg-white/[0.08] hover:bg-pink-500/20 border border-white/18 text-[11px] text-slate-200 transition-all shadow-sm hover:border-pink-400/40 overflow-hidden"
                >
                  <button
                    onClick={() => {
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.send(JSON.stringify({ type: 'text_input', text: starter }));
                      }
                    }}
                    className="px-2.5 py-1 text-left hover:text-white cursor-pointer line-clamp-1"
                  >
                    &quot;{starter}&quot;
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePlayStarterAudio(starter);
                    }}
                    className="p-1 text-pink-300 hover:text-white border-l border-white/10 hover:bg-pink-500/30 cursor-pointer"
                    title="Hear native pronunciation"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: Live Transcript View (Pinkish Glassmorphism) */}
        {activeTab === 'transcript' && (
          <div className="w-full max-w-2xl h-full flex flex-col animate-in fade-in">
            <div className="text-xs font-semibold text-pink-300 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Real-Time Dialogue Transcript</span>
              <span className="text-[11px] text-cyan-300">Tap words for instant dictionary</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 p-4 rounded-3xl glass-card border border-white/15 shadow-inner">
              {transcript.filter((m) => m.role !== 'system').length === 0 ? (
                <div className="text-center py-12 text-slate-300 text-xs">
                  No conversation turns recorded yet. Start speaking to generate live dialogue transcript!
                </div>
              ) : (
                transcript
                  .filter((m) => m.role !== 'system')
                  .map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className="text-[10px] font-semibold text-slate-300 mb-1">
                        {msg.role === 'user' ? 'You (Learner)' : currentPersona.name}
                      </div>
                      <div
                        className={`p-3.5 rounded-2xl text-xs sm:text-sm max-w-[85%] leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-tr-xs shadow-[0_4px_15px_rgba(236,72,153,0.3)]'
                            : 'glass-card border border-white/15 text-slate-100 rounded-tl-xs shadow-sm'
                        }`}
                      >
                        {/* Interactive words */}
                        <div className="flex flex-wrap gap-x-1.5 gap-y-0.5">
                          {msg.text.split(' ').map((word, wIdx) => {
                            const cleanWord = word.replace(/[.,!?;:"'()]/g, '');
                            return (
                              <button
                                key={wIdx}
                                onClick={() => onOpenWordLookup(cleanWord, msg.text)}
                                className={`font-medium cursor-pointer transition-colors ${
                                  msg.role === 'user'
                                    ? 'hover:text-amber-200 hover:underline'
                                    : 'hover:text-pink-300 hover:underline'
                                }`}
                                title="Click for definition & pronunciation"
                              >
                                {word}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Scenario Goals View (Pinkish Glassmorphism) */}
        {activeTab === 'goals' && (
          <div className="w-full max-w-xl h-full flex flex-col justify-center animate-in fade-in">
            <div className="p-6 rounded-3xl glass-card-neon border border-pink-500/30 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-pink-300 border border-pink-400/40">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">{currentScenario.title}</h3>
                  <p className="text-xs text-pink-200/70">{currentScenario.description}</p>
                </div>
              </div>

              <div className="space-y-2.5">
                {currentScenario.goals.map((goal) => (
                  <div
                    key={goal.id}
                    onClick={() => onUpdateScenarioGoal(goal.id, !goal.completed)}
                    className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                      goal.completed
                        ? 'bg-pink-500/20 border-pink-400/50 text-pink-200 font-medium shadow-[0_0_12px_rgba(236,72,153,0.25)]'
                        : 'bg-white/[0.04] border-white/10 text-slate-200 hover:bg-white/[0.08]'
                    }`}
                  >
                    <span className="text-xs font-medium">{goal.description}</span>
                    <CheckCircle2
                      className={`w-4 h-4 ${goal.completed ? 'text-pink-400 font-bold' : 'text-slate-400'}`}
                    />
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-white/10 text-center text-xs text-pink-200/80">
                Goals automatically track and validate as you practice in conversation!
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Bottom Voice Control Dock */}
      <div className="relative z-10 px-6 py-3.5 border-t border-white/10 bg-white/[0.03] backdrop-blur-xl flex items-center justify-between">
        
        {/* Left: Mute status & language badge */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            disabled={!isConnected}
            className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
              isMuted
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
            } disabled:opacity-40`}
            title={isMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <div className="hidden sm:block text-xs">
            <div className="font-semibold text-white">{isMuted ? 'Microphone Muted' : 'Microphone Live'}</div>
            <div className="text-slate-400">{currentLanguage.flag} Speaking {currentLanguage.name}</div>
          </div>
        </div>

        {/* Center: Main Action Button (Start Call / End Call) */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <button
              id="start-live-call-btn"
              onClick={startLiveSession}
              disabled={isConnecting}
              className="flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:from-pink-400 hover:via-rose-400 hover:to-purple-500 text-white font-black text-sm shadow-[0_0_30px_rgba(236,72,153,0.55)] border border-pink-300/40 hover:scale-[1.03] active:scale-[0.98] transition-all disabled:opacity-60 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-white animate-pulse" />
              <span>{isConnecting ? 'Starting Voice Partner...' : 'Start Live Voice Call'}</span>
            </button>
          ) : (
            <button
              id="end-live-call-btn"
              onClick={endLiveSession}
              className="flex items-center gap-2.5 px-7 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-sm shadow-[0_0_25px_rgba(225,29,72,0.5)] border border-rose-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" />
              <span>End Call & Review</span>
            </button>
          )}
        </div>

        {/* Right: Quick Interrupt / Volume Help */}
        <div className="flex items-center gap-2">
          {isConnected && partnerSpeaking && (
            <button
              onClick={() => {
                audioQueueRef.current?.stop();
                setPartnerSpeaking(false);
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              title="Interrupt AI to speak now"
            >
              Interrupt
            </button>
          )}
          <button
            onClick={() => setActiveTab(activeTab === 'transcript' ? 'orb' : 'transcript')}
            className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Toggle Transcript view"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        </div>

      </div>

    </div>
  );
};
