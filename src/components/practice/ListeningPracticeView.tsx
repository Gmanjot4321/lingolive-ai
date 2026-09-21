import React, { useState, useEffect } from 'react';
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Sparkles,
  Zap,
  HelpCircle,
  Award,
  Loader2,
  Plus,
} from 'lucide-react';
import { LanguageOption, ProficiencyLevel } from '../../types';

interface ListeningPracticeViewProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: ProficiencyLevel;
  onAwardXP: (xp: number) => void;
}

interface AudioTrack {
  id: string;
  title: string;
  level: string;
  scenario: string;
  transcript: string;
  dictationSentence: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
  }[];
}

const EXTENSIVE_LISTENING_TRACKS: Record<string, AudioTrack[]> = {
  french: [
    {
      id: 'fr-listen-1',
      title: 'Annonce à la Gare de Paris-Montparnasse',
      level: 'A0 - A1',
      scenario: 'Train Departure Announcement',
      transcript: 'Mesdames et messieurs, le train numéro 4520 à destination de Bordeaux partira voie numéro sept à quatorze heures trente. Prenez garde à la fermeture automatique des portes.',
      dictationSentence: 'Le train partira voie numéro sept.',
      questions: [
        {
          question: 'Quelle est la destination du train ?',
          options: ['Lyon', 'Bordeaux', 'Marseille', 'Nantes'],
          correctIndex: 1,
        },
        {
          question: 'À quelle heure part le train ?',
          options: ['12h00', '13h15', '14h30', '15h45'],
          correctIndex: 2,
        },
      ],
    },
    {
      id: 'fr-listen-2',
      title: 'Au Salon de Thé : Commander une Pâtisserie',
      level: 'A1 - A2',
      scenario: 'Café Dialogue',
      transcript: 'Bonjour madame ! Je voudrais une tartelette aux framboises et un thé Earl Grey avec un peu de lait, s’il vous plaît.',
      dictationSentence: 'Je voudrais une tartelette aux framboises.',
      questions: [
        {
          question: 'Quelle pâtisserie le client commande-t-il ?',
          options: ['Un éclair au chocolat', 'Une tartelette aux framboises', 'Un mille-feuille', 'Un croissant'],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'fr-listen-3',
      title: 'Météo & Trafic Matinal sur Radio France',
      level: 'B1 - Intermediate',
      scenario: 'Live Radio Broadcast',
      transcript: 'Ici France Info, il est sept heures trente. Le temps sera pluvieux sur l’Île-de-France avec des rafales de vent atteignant cinquante kilomètres par heure. Prévoyez des ralentissements sur le boulevard périphérique.',
      dictationSentence: 'Le temps sera pluvieux sur l’Île-de-France.',
      questions: [
        {
          question: 'Quel temps fait-il sur l’Île-de-France ?',
          options: ['Ensoleillé et caniculaire', 'Pluvieux et venteux', 'Neigeux', 'Brouillard épais'],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'fr-listen-4',
      title: 'Consultation chez le Médecin de Garde',
      level: 'B2 - Upper Intermediate',
      scenario: 'Medical Consultation',
      transcript: 'Docteur, depuis trois jours j’ai de la fièvre et une toux sèche persistante. Je ressens aussi une grande fatigue musculaire dès le matin.',
      dictationSentence: 'J’ai de la fièvre et une toux sèche persistante.',
      questions: [
        {
          question: 'Depuis combien de temps le patient a-t-il des symptômes ?',
          options: ['Un jour', 'Trois jours', 'Une semaine', 'Un mois'],
          correctIndex: 1,
        },
      ],
    },
  ],
  spanish: [
    {
      id: 'es-listen-1',
      title: 'Aviso de Vuelo en el Aeropuerto de Madrid-Barajas',
      level: 'A0 - A1',
      scenario: 'Airport Boarding Gate',
      transcript: 'Atención señores pasajeros del vuelo Iberia 380 con destino a Buenos Aires. Embarquen de inmediato por la puerta número doce.',
      dictationSentence: 'Embarquen por la puerta número doce.',
      questions: [
        {
          question: '¿Cuál es el destino del vuelo?',
          options: ['Santiago', 'Buenos Aires', 'Lima', 'Bogotá'],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'es-listen-2',
      title: 'Pedir Tapas en una Taberna Típica de Sevilla',
      level: 'A1 - A2',
      scenario: 'Tapas Bar Order',
      transcript: '¡Buenas noches! Nos pone dos cañas bien frías, una ración de patatas bravas y una tapa de tortilla de patatas con cebolla, por favor.',
      dictationSentence: 'Nos pone dos cañas bien frías y patatas bravas.',
      questions: [
        {
          question: '¿Cómo piden las bebidas?',
          options: ['Dos refrescos calientes', 'Dos cañas bien frías', 'Una botella de vino tinto', 'Dos cafés solos'],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'es-listen-3',
      title: 'Reserva de Alojamiento y Excursión en Costa Rica',
      level: 'B1 - Intermediate',
      scenario: 'Travel Agency Booking',
      transcript: 'Hola, quisiéramos reservar una cabaña ecológica cerca del volcán Arenal para cuatro noches, con guía incluido para el puente colgante.',
      dictationSentence: 'Quisiéramos reservar una cabaña ecológica.',
      questions: [
        {
          question: '¿Cerca de qué lugar buscan la cabaña?',
          options: ['Playa Tamarindo', 'Volcán Arenal', 'San José centro', 'Parque Manuel Antonio'],
          correctIndex: 1,
        },
      ],
    },
    {
      id: 'es-listen-4',
      title: 'Entrevista sobre Energía Solar en el Desierto de Atacama',
      level: 'B2 - C1 Advanced',
      scenario: 'Scientific Radio Interview',
      transcript: 'La radiación solar en Atacama es la más alta del planeta, permitiendo una eficiencia de generación fotovoltaica sin precedentes en América del Sur.',
      dictationSentence: 'La radiación solar en Atacama es la más alta del planeta.',
      questions: [
        {
          question: '¿Qué ventaja tiene el desierto de Atacama?',
          options: ['Abundante agua dulce', 'La mayor radiación solar del planeta', 'Vientos polares', 'Bajas temperaturas constantes'],
          correctIndex: 1,
        },
      ],
    },
  ],
};

export const ListeningPracticeView: React.FC<ListeningPracticeViewProps> = ({
  currentLanguage,
  proficiencyLevel,
  onAwardXP,
}) => {
  const langKey = currentLanguage.id.toLowerCase().includes('french') ? 'french' : 'spanish';
  const initialTracks = EXTENSIVE_LISTENING_TRACKS[langKey] || EXTENSIVE_LISTENING_TRACKS.french;

  const [tracks, setTracks] = useState<AudioTrack[]>(initialTracks);
  const [activeTrackId, setActiveTrackId] = useState<string>(initialTracks[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(0.9);
  const [dictationInput, setDictationInput] = useState<string>('');
  const [dictationChecked, setDictationChecked] = useState<boolean>(false);
  const [showTranscript, setShowTranscript] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // AI Generator
  const [customTopic, setCustomTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    const key = currentLanguage.id.toLowerCase().includes('french') ? 'french' : 'spanish';
    const list = EXTENSIVE_LISTENING_TRACKS[key] || EXTENSIVE_LISTENING_TRACKS.french;
    setTracks(list);
    setActiveTrackId(list[0].id);
    setDictationInput('');
    setDictationChecked(false);
    setShowTranscript(false);
    setShowHint(false);
    setQuizAnswers({});
    setQuizSubmitted(false);
    window.speechSynthesis?.cancel();
    setIsPlaying(false);
  }, [currentLanguage.name]);

  const activeTrack = tracks.find((t) => t.id === activeTrackId) || tracks[0];

  const handlePlayAudio = (textToPlay: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(textToPlay);
    utterance.lang = langKey === 'french' ? 'fr-FR' : 'es-ES';
    utterance.rate = speed;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCheckDictation = () => {
    setDictationChecked(true);
    const cleanUser = dictationInput.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    const cleanTarget = activeTrack.dictationSentence.trim().toLowerCase().replace(/[.,!?;:]/g, '');
    if (cleanUser === cleanTarget) {
      onAwardXP(100);
    } else {
      onAwardXP(40);
    }
  };

  const handleSubmitQuiz = () => {
    setQuizSubmitted(true);
    let correct = 0;
    activeTrack.questions.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctIndex) correct++;
    });
    onAwardXP(60 + correct * 30);
  };

  // AI Custom Audio Scenario Generator
  const handleGenerateCustomScenario = async (presetTopic?: string) => {
    const topicToUse = presetTopic || customTopic.trim();
    if (!topicToUse || isGenerating) return;

    setIsGenerating(true);
    setStatusMsg(null);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5500);

    try {
      const res = await fetch('/api/generate-listening-scenario', {
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
        if (data.success && data.track) {
          setTracks((prev) => [data.track, ...prev]);
          setActiveTrackId(data.track.id);
          setCustomTopic('');
          setDictationInput('');
          setDictationChecked(false);
          setShowTranscript(false);
          setShowHint(false);
          setQuizAnswers({});
          setQuizSubmitted(false);
          setStatusMsg(`Generated: "${data.track.title}"`);
          onAwardXP(30);
          return;
        }
      }
      throw new Error('Fallback needed');
    } catch (err) {
      const fallbackId = `custom-listen-${Date.now()}`;
      const fallbackTrack: AudioTrack = {
        id: fallbackId,
        title: `${topicToUse} — Acoustic Dialogue`,
        level: proficiencyLevel,
        scenario: `${topicToUse} Situation`,
        transcript: currentLanguage.name === 'Spanish'
          ? `¡Hola a todos! En esta conversación sobre ${topicToUse}, presten atención a las frases comunes que usan los hablantes nativos todos los días.`
          : `Bonjour à tous ! Dans cet enregistrement audio sur ${topicToUse}, écoutez attentivement les expressions authentiques de la vie quotidienne.`,
        dictationSentence: currentLanguage.name === 'Spanish'
          ? `Presten atención a las frases comunes que usan los nativos.`
          : `Écoutez attentivement les expressions authentiques de la vie quotidienne.`,
        questions: [
          {
            question: `What is the main topic of this listening audio?`,
            options: [`${topicToUse}`, 'Weather forecast', 'Sports match', 'Historical dates'],
            correctIndex: 0,
          },
        ],
      };

      setTracks((prev) => [fallbackTrack, ...prev]);
      setActiveTrackId(fallbackTrack.id);
      setCustomTopic('');
      setDictationInput('');
      setDictationChecked(false);
      setShowTranscript(false);
      setShowHint(false);
      setQuizAnswers({});
      setQuizSubmitted(false);
      setStatusMsg(`Generated: "${fallbackTrack.title}"`);
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
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-pink-600 p-[1.5px] shadow-[0_0_20px_rgba(236,72,153,0.5)] shrink-0">
            <div className="w-full h-full rounded-2xl bg-[#1a0628] flex items-center justify-center text-pink-300">
              <Headphones className="w-6 h-6 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentLanguage.name} Listening & Dictation Studio
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-400/40">
                {tracks.length} Audio Tracks Ready
              </span>
            </div>
            <p className="text-xs text-pink-200/70 mt-0.5">
              High-fidelity acoustic tracks, transcription drills, speed calibration & listening comprehension
            </p>
          </div>
        </div>

        {/* AI Audio Scenario Generator */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleGenerateCustomScenario();
            }}
            placeholder="Generate audio scenario (e.g. Hotel, Doctor, Train, Café)..."
            className="flex-1 md:w-64 px-3.5 py-2.5 rounded-xl bg-white/[0.05] border border-white/15 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-pink-500"
          />
          <button
            onClick={() => handleGenerateCustomScenario()}
            disabled={isGenerating || !customTopic.trim()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:brightness-110 active:scale-95 text-white font-bold text-xs shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
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
          'Lost Luggage at Airport',
          'Ordering Tapas with Locals',
          'Hotel Check-in & Room Request',
          'Job Interview Small Talk',
          'Emergency Doctor Visit',
          'Bicycle Rental in Paris',
        ].map((sTopic) => (
          <button
            key={sTopic}
            onClick={() => handleGenerateCustomScenario(sTopic)}
            disabled={isGenerating}
            className="px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-pink-500/20 hover:border-pink-400/40 border border-white/10 text-slate-300 hover:text-white transition-all cursor-pointer whitespace-nowrap text-[11px] font-semibold"
          >
            🎧 {sTopic}
          </button>
        ))}
      </div>

      {/* Status Feedback */}
      {statusMsg && (
        <div className="p-3 rounded-2xl bg-pink-500/20 border border-pink-400/40 text-pink-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Track Selector Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              window.speechSynthesis?.cancel();
              setIsPlaying(false);
              setActiveTrackId(t.id);
              setDictationInput('');
              setDictationChecked(false);
              setShowTranscript(false);
              setShowHint(false);
              setQuizAnswers({});
              setQuizSubmitted(false);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              t.id === activeTrack.id
                ? 'glass-card-neon border-pink-400/50 text-white shadow-[0_0_15px_rgba(236,72,153,0.35)]'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <Headphones className="w-3.5 h-3.5 text-pink-300" />
            <span>{t.title}</span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-cyan-300">
              {t.level}
            </span>
          </button>
        ))}
      </div>

      {/* Audiophile Studio & Dictation Station Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Neon Vinyl & Waveform Audio Station */}
        <div className="lg:col-span-6 glass-card-neon border border-pink-500/30 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-pink-300">
                  {currentLanguage.name} Acoustic Studio
                </span>
                <h3 className="text-xl font-black text-white">{activeTrack.title}</h3>
                <p className="text-xs text-cyan-300 font-medium">{activeTrack.scenario}</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 text-xs text-slate-200 font-semibold">
                {activeTrack.level}
              </span>
            </div>

            {/* Glowing Cassette / Vinyl Player Visualizer */}
            <div className="relative rounded-2xl p-6 bg-gradient-to-b from-black/40 to-[#1e083a]/60 border border-pink-500/25 flex flex-col items-center justify-center overflow-hidden">
              {/* Rotating neon vinyl disc */}
              <div
                className={`w-32 h-32 rounded-full border-4 border-pink-500/40 bg-[#120524] shadow-[0_0_30px_rgba(236,72,153,0.4)] flex items-center justify-center transition-transform duration-1000 ${
                  isPlaying ? 'animate-spin' : ''
                }`}
                style={{ animationDuration: '6s' }}
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-500 to-cyan-400 p-1 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-[#120524] flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-300 animate-ping" />
                  </div>
                </div>
              </div>

              {/* Reactive Sound Bars */}
              <div className="flex items-center gap-1.5 mt-5 h-8">
                {[14, 28, 42, 22, 35, 18, 45, 30, 24, 38, 16, 26].map((h, idx) => (
                  <div
                    key={idx}
                    className="w-1.5 rounded-full bg-gradient-to-t from-pink-500 to-cyan-300 transition-all duration-300"
                    style={{
                      height: isPlaying ? `${Math.max(10, (h * Math.random() + 8))}px` : '6px',
                      opacity: isPlaying ? 0.9 : 0.3,
                    }}
                  />
                ))}
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-4 mt-6">
                <button
                  onClick={() => handlePlayAudio(activeTrack.transcript)}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:brightness-110 text-white font-bold text-sm shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all cursor-pointer"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{isPlaying ? 'Pause Audio' : 'Play Audio'}</span>
                </button>

                {/* Speed Selector */}
                <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl text-xs font-bold">
                  {[0.75, 0.9, 1.1].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSpeed(s)}
                      className={`px-2 py-1 rounded-lg transition-colors cursor-pointer ${
                        speed === s ? 'bg-pink-500 text-white' : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transcript Reveal Option */}
            <div>
              <button
                onClick={() => setShowTranscript(!showTranscript)}
                className="text-xs text-pink-300 hover:text-pink-200 font-bold underline decoration-pink-500/40 cursor-pointer"
              >
                {showTranscript ? 'Hide Audio Transcript' : 'Reveal Audio Transcript'}
              </button>

              {showTranscript && (
                <div className="mt-2 p-3 rounded-xl bg-white/[0.05] border border-white/10 text-xs text-slate-200 leading-relaxed">
                  {activeTrack.transcript}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Dictation Challenge & Comprehension Questions */}
        <div className="lg:col-span-6 space-y-5">
          {/* Dictation Box */}
          <div className="glass-card-neon border border-pink-500/25 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>Dictation Challenge: Listen & Type</span>
              </span>
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5" />
                <span>+100 XP</span>
              </span>
            </div>

            <p className="text-xs text-slate-300">
              Listen specifically to the target sentence and type what you hear:
            </p>

            <button
              onClick={() => handlePlayAudio(activeTrack.dictationSentence)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Listen to Dictation Sentence Only</span>
            </button>

            <div className="space-y-2">
              <input
                type="text"
                value={dictationInput}
                onChange={(e) => setDictationInput(e.target.value)}
                placeholder="Type the sentence in target language..."
                className="w-full px-4 py-3 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder:text-slate-400 text-sm focus:outline-none focus:border-pink-400 shadow-inner"
              />

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                >
                  <HelpCircle className="w-3 h-3 text-cyan-300" />
                  <span>{showHint ? 'Hide Hint' : 'Show Word Hint'}</span>
                </button>

                <button
                  onClick={handleCheckDictation}
                  disabled={!dictationInput.trim()}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                >
                  Check Dictation
                </button>
              </div>

              {showHint && (
                <p className="text-xs text-cyan-200 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-400/20">
                  Target starts with: &quot;{activeTrack.dictationSentence.slice(0, 10)}...&quot;
                </p>
              )}

              {dictationChecked && (
                <div className="p-3 rounded-xl bg-white/[0.06] border border-white/15 text-xs space-y-1">
                  <p className="font-bold text-slate-200">Official Sentence:</p>
                  <p className="text-pink-300 font-semibold">{activeTrack.dictationSentence}</p>
                </div>
              )}
            </div>
          </div>

          {/* Comprehension Questions */}
          <div className="glass-card border border-white/15 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold text-pink-300 uppercase tracking-wider">
              Acoustic Comprehension Check
            </span>

            <div className="space-y-3">
              {activeTrack.questions.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];

                return (
                  <div key={qIdx} className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2">
                    <p className="text-xs font-bold text-slate-200">{q.question}</p>
                    <div className="space-y-1">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selected === optIdx;
                        let btnStyle = 'bg-white/[0.04] border-white/10 text-slate-300 hover:bg-white/10';

                        if (quizSubmitted) {
                          if (optIdx === q.correctIndex) {
                            btnStyle = 'bg-emerald-500/30 border-emerald-400 text-emerald-200 font-bold';
                          } else if (isChosen) {
                            btnStyle = 'bg-rose-500/30 border-rose-400 text-rose-200';
                          }
                        } else if (isChosen) {
                          btnStyle = 'bg-pink-500/30 border-pink-400 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => !quizSubmitted && setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                            className={`w-full text-left p-2 rounded-xl border text-xs transition-all cursor-pointer flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && optIdx === q.correctIndex && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {!quizSubmitted && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < activeTrack.questions.length}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold shadow-[0_0_15px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
                >
                  Verify Listening Questions
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
