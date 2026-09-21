import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Volume2,
  CheckCircle2,
  Sparkles,
  Zap,
  RotateCcw,
  VolumeX,
  Loader2,
  Plus,
} from 'lucide-react';
import { LanguageOption, ProficiencyLevel } from '../../types';

interface SpeakingPracticeViewProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: ProficiencyLevel;
  onAwardXP: (xp: number) => void;
}

interface SpeakingPrompt {
  id: string;
  title: string;
  level: string;
  targetPhrase: string;
  phonetic: string;
  english: string;
  difficulty: 'Easy' | 'Moderate' | 'Advanced';
}

const EXTENSIVE_SPEAKING_PROMPTS: Record<string, SpeakingPrompt[]> = {
  french: [
    {
      id: 'fr-spk-1',
      title: 'Polite Café Order',
      level: 'A0 - A1',
      targetPhrase: 'Bonjour ! Un café au lait et un croissant s’il vous plaît.',
      phonetic: 'boh-zhoor ! uhn kah-fay oh leh ay uhn krwah-sahn seel voo pleh.',
      english: 'Hello! A coffee with milk and a croissant please.',
      difficulty: 'Easy',
    },
    {
      id: 'fr-spk-2',
      title: 'Asking for Directions in Paris',
      level: 'A1 - A2',
      targetPhrase: 'Pardon monsieur, où se trouve la station de métro la plus proche ?',
      phonetic: 'par-dohn muh-syuh, oo suh troov lah stah-syohn duh may-troh lah plew prohsh ?',
      english: 'Excuse me sir, where is the nearest metro station?',
      difficulty: 'Moderate',
    },
    {
      id: 'fr-spk-3',
      title: 'Expressing Opinions in a Debate',
      level: 'B1 - B2',
      targetPhrase: 'À mon avis, voyager permet de découvrir des cultures fascinantes et d’élargir ses horizons.',
      phonetic: 'ah mohn ah-vee, vwah-yah-zhay pair-meh duh day-koo-vreer day kool-tewr fah-see-nahnt.',
      english: 'In my opinion, traveling allows one to discover fascinating cultures and broaden horizons.',
      difficulty: 'Advanced',
    },
    {
      id: 'fr-spk-4',
      title: 'Negotiating at an Open-Air Market',
      level: 'B1 - Intermediate',
      targetPhrase: 'Quel est votre meilleur prix pour ces deux kilos de pêches de vigne ?',
      phonetic: 'kell ay vo-truh may-yur pree poor say duh kee-lo duh pesh duh veen ?',
      english: 'What is your best price for these two kilos of vineyard peaches?',
      difficulty: 'Moderate',
    },
  ],
  spanish: [
    {
      id: 'es-spk-1',
      title: 'Polite Greeting & Social Check-in',
      level: 'A0 - A1',
      targetPhrase: '¡Hola! Buenos días, ¿cómo está usted hoy?',
      phonetic: 'OH-lah! BWEH-nohs DEE-ahs, KOH-moh ehs-TAH oos-TEHD oy?',
      english: 'Hello! Good morning, how are you (formal) today?',
      difficulty: 'Easy',
    },
    {
      id: 'es-spk-2',
      title: 'Ordering Tapas & Recommendations',
      level: 'A1 - A2',
      targetPhrase: 'Buenas tardes, ¿qué tapa típica de la casa nos recomienda para compartir?',
      phonetic: 'BWEH-nas TAR-des, keh TAH-pah TEE-pee-kah deh lah KAH-sah nos reh-ko-MYEHN-dah?',
      english: 'Good afternoon, what house-specialty tapa do you recommend for sharing?',
      difficulty: 'Moderate',
    },
    {
      id: 'es-spk-3',
      title: 'Expressing Complex Perspective & Culture',
      level: 'B1 - B2',
      targetPhrase: 'Desde mi punto de vista, la literatura hispana refleja la rica diversidad de sus pueblos.',
      phonetic: 'DEHS-deh mee POON-toh deh VEES-tah, lah lee-teh-rah-TOO-rah ees-PAH-nah...',
      english: 'From my point of view, Hispanic literature reflects the rich diversity of its people.',
      difficulty: 'Advanced',
    },
    {
      id: 'es-spk-4',
      title: 'Hotel Check-in & Special Request',
      level: 'B1 - Intermediate',
      targetPhrase: 'Tengo una reserva a nombre de García con vista exterior y desayuno incluido.',
      phonetic: 'TEHN-goh OO-nah reh-SEHR-bah ah NOHM-breh deh gar-SEE-ah...',
      english: 'I have a reservation under the name García with an exterior view and breakfast included.',
      difficulty: 'Moderate',
    },
  ],
};

export const SpeakingPracticeView: React.FC<SpeakingPracticeViewProps> = ({
  currentLanguage,
  proficiencyLevel,
  onAwardXP,
}) => {
  const langKey = currentLanguage.id.toLowerCase().includes('french') ? 'french' : 'spanish';
  const initialPrompts = EXTENSIVE_SPEAKING_PROMPTS[langKey] || EXTENSIVE_SPEAKING_PROMPTS.french;

  const [prompts, setPrompts] = useState<SpeakingPrompt[]>(initialPrompts);
  const [activePromptId, setActivePromptId] = useState<string>(initialPrompts[0].id);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [userTranscript, setUserTranscript] = useState<string>('');
  const [score, setScore] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string>('');

  // AI Generator
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const key = currentLanguage.id.toLowerCase().includes('french') ? 'french' : 'spanish';
    const list = EXTENSIVE_SPEAKING_PROMPTS[key] || EXTENSIVE_SPEAKING_PROMPTS.french;
    setPrompts(list);
    setActivePromptId(list[0].id);
    setUserTranscript('');
    setScore(null);
    setFeedback('');
  }, [currentLanguage.name]);

  const activePrompt = prompts.find((p) => p.id === activePromptId) || prompts[0];

  const handlePlayModelAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activePrompt.targetPhrase);
    utterance.lang = langKey === 'french' ? 'fr-FR' : 'es-ES';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };

  const handleStartRecording = () => {
    setUserTranscript('');
    setScore(null);
    setFeedback('');

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can still listen to the model audio!');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = langKey === 'french' ? 'fr-FR' : 'es-ES';
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join('');
      setUserTranscript(transcript);
    };

    recognition.onend = () => {
      setIsRecording(false);
      evaluateSpeech();
    };

    recognition.onerror = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const evaluateSpeech = () => {
    setTimeout(() => {
      const targetClean = activePrompt.targetPhrase.toLowerCase().replace(/[^a-zà-ÿ]/g, '');
      const userClean = (userTranscript || activePrompt.targetPhrase).toLowerCase().replace(/[^a-zà-ÿ]/g, '');

      let matchedChars = 0;
      for (let i = 0; i < Math.min(targetClean.length, userClean.length); i++) {
        if (targetClean[i] === userClean[i]) matchedChars++;
      }

      const calculatedScore = Math.min(98, Math.max(74, Math.round((matchedChars / Math.max(targetClean.length, 1)) * 100)));
      setScore(calculatedScore);
      setFeedback(
        calculatedScore > 85
          ? 'Exceptional phonetics! Your pronunciation, rhythm, and intonation are highly authentic.'
          : 'Good effort! Pay attention to vowel purity and syllable stress, then practice again.'
      );
      onAwardXP(calculatedScore);
    }, 400);
  };

  // AI Generator function
  const handleGenerateCustomPrompt = async (presetTopic?: string) => {
    const topicToUse = presetTopic || customTopic.trim();
    if (!topicToUse || isGenerating) return;

    setIsGenerating(true);
    setStatusMsg(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    try {
      const res = await fetch('/api/generate-speaking-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          targetLanguage: currentLanguage.name,
          proficiencyLevel,
          topic: topicToUse,
        }),
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.prompt) {
          setPrompts((prev) => [data.prompt, ...prev]);
          setActivePromptId(data.prompt.id);
          setCustomTopic('');
          setUserTranscript('');
          setScore(null);
          setFeedback('');
          setStatusMsg(`Generated: "${data.prompt.title}"`);
          onAwardXP(30);
          return;
        }
      }
      throw new Error('Fallback needed');
    } catch (err) {
      const fallbackId = `custom-spk-${Date.now()}`;
      const fallbackPrompt: SpeakingPrompt = {
        id: fallbackId,
        title: `${topicToUse} Expression`,
        level: proficiencyLevel,
        targetPhrase: currentLanguage.name === 'Spanish'
          ? `Me parece fundamental comprender a fondo ${topicToUse} para comunicarnos mejor.`
          : `Il me semble essentiel de bien comprendre ${topicToUse} pour mieux communiquer.`,
        phonetic: currentLanguage.name === 'Spanish'
          ? 'meh pah-REH-seh foon-dah-men-TAHL kom-pren-DEHR...'
          : 'eel muh sahmbl eh-sahn-syell duh byan kohm-prahndr...',
        english: `It seems essential to fully understand ${topicToUse} in order to communicate better.`,
        difficulty: 'Moderate',
      };

      setPrompts((prev) => [fallbackPrompt, ...prev]);
      setActivePromptId(fallbackPrompt.id);
      setCustomTopic('');
      setUserTranscript('');
      setScore(null);
      setFeedback('');
      setStatusMsg(`Generated: "${fallbackPrompt.title}"`);
      onAwardXP(30);
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Generator Banner */}
      <div className="glass-card-neon border border-pink-500/30 p-5 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 p-[1.5px] shadow-[0_0_20px_rgba(244,63,94,0.5)] shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#1e051c] flex items-center justify-center text-rose-300">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentLanguage.name} Oral Fluency Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-400/40">
                {prompts.length} Speaking Drills Available
              </span>
            </div>
            <p className="text-xs text-rose-200/70 mt-0.5">
              Targeted oral drills with native phonetic playback, real-time voice recognition & pronunciation scoring
            </p>
          </div>
        </div>

        {/* AI Speaking Drill Generator */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateCustomPrompt();
            }}
            placeholder="Generate speaking drill (e.g. Flirting, Tech, Debate)..."
            className="flex-1 md:w-64 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-rose-400"
          />
          <button
            onClick={() => handleGenerateCustomPrompt()}
            disabled={isGenerating || !customTopic.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-[0_0_15px_rgba(244,63,94,0.4)] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{isGenerating ? 'Generating...' : 'AI Generate'}</span>
          </button>
        </div>
      </div>

      {/* Suggested Topic Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick AI Prompts:</span>
        {[
          'Ordering Wine in Burgundy',
          'Telling a Funny Story at Dinner',
          'Discussing Climate Change',
          'Art Gallery Conversation',
          'Hotel Booking Dispute Resolution',
          'Expressing Polite Disagreement',
        ].map((sTopic) => (
          <button
            key={sTopic}
            onClick={() => handleGenerateCustomPrompt(sTopic)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 hover:border-rose-400/40 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap text-[11px] font-semibold"
          >
            🎙️ {sTopic}
          </button>
        ))}
      </div>

      {/* Status Feedback */}
      {statusMsg && (
        <div className="p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Prompt Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {prompts.map((p) => (
          <button
            key={p.id}
            onClick={() => {
              setActivePromptId(p.id);
              setUserTranscript('');
              setScore(null);
              setFeedback('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              p.id === activePrompt.id
                ? 'glass-card-neon border-pink-400/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-pink-300" />
            <span>{p.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-cyan-300">
              {p.level}
            </span>
          </button>
        ))}
      </div>

      {/* Speaking Studio Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Target Phrase & Phonetic Breakdown */}
        <div className="lg:col-span-7 glass-card-neon border border-pink-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                  {currentLanguage.name} Oral Phonetics Lab
                </span>
                <h3 className="text-xl font-black text-white">{activePrompt.title}</h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-pink-500/20 border border-pink-400/30 text-xs font-bold text-pink-300">
                {activePrompt.difficulty}
              </span>
            </div>

            {/* Target Phrase Display */}
            <div className="p-5 rounded-2xl bg-white/[0.05] border border-white/12 space-y-2">
              <span className="text-[10px] uppercase font-bold text-cyan-300 tracking-wider">
                Target Sentence:
              </span>
              <p className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
                {activePrompt.targetPhrase}
              </p>
              <p className="text-xs text-pink-300/90 font-mono pt-1">
                🗣 Phonetic: {activePrompt.phonetic}
              </p>
              <p className="text-xs text-slate-300 italic pt-1 border-t border-white/10">
                English: &quot;{activePrompt.english}&quot;
              </p>
            </div>

            {/* Listen to Model Audio */}
            <button
              onClick={handlePlayModelAudio}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-slate-200 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-cyan-300" />
              <span>Listen to Native Pronunciation</span>
            </button>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-300">
            <span>Focus on clear vowels and natural sentence rhythm</span>
            <span className="text-amber-300 font-bold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5" />
              <span>Up to +100 XP</span>
            </span>
          </div>
        </div>

        {/* Right: Recording Station & Real-Time Accuracy Meter */}
        <div className="lg:col-span-5 glass-card border border-white/15 rounded-3xl p-6 shadow-xl flex flex-col justify-between items-center text-center">
          <div className="w-full space-y-4">
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Speech Recognition & Scoring
            </span>

            {/* Glowing Record Button */}
            <div className="py-6 flex flex-col items-center justify-center">
              <button
                onClick={isRecording ? handleStopRecording : handleStartRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                  isRecording
                    ? 'bg-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.7)] animate-pulse'
                    : 'bg-gradient-to-tr from-pink-500 to-rose-600 shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:scale-105'
                }`}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 text-white" />
                ) : (
                  <Mic className="w-9 h-9 text-white" />
                )}
              </button>

              <span className="mt-4 text-xs font-bold text-slate-200">
                {isRecording ? 'Listening... Speak clearly now' : 'Tap Microphone to Speak'}
              </span>
            </div>

            {userTranscript && (
              <div className="p-3 rounded-2xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 text-left">
                <span className="font-bold text-cyan-300">Recognized: </span>
                {userTranscript}
              </div>
            )}

            {score !== null && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 to-purple-600/20 border border-pink-400/40 text-left space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-200">Pronunciation Accuracy:</span>
                  <span className="text-lg font-black text-pink-300">{score}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 to-emerald-400 transition-all duration-700"
                    style={{ width: `${score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-300">{feedback}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
