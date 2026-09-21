import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Clock,
  Layers,
  Zap,
  Search,
  ChevronRight,
  ChevronLeft,
  Filter,
  Loader2,
  SlidersHorizontal,
  Headphones,
  User,
  Repeat,
  FastForward,
  Rewind,
  BookmarkPlus,
  MessageSquare,
  Flame,
  Award,
  BookMarked,
  Volume1,
  Sparkle,
  Radio,
} from 'lucide-react';
import { LanguageOption, ProficiencyLevel, SavedWord } from '../../types';

export interface VideoTeachingLesson {
  id: string;
  title: string;
  cefrLevel: string;
  duration: string;
  category: 'Phonetics' | 'Grammar' | 'Conversation' | 'Culture' | 'Advanced';
  thumbnailUrl: string;
  instructor: string;
  description: string;
  keyGrammarPoints: string[];
  keyVocabulary: { term: string; phonetic: string; meaning: string }[];
  transcriptSegments: { timestamp: string; seconds: number; speaker: string; text: string; translation: string }[];
  quizQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

// Curated Masterclasses for all Supported Languages
const EXTENSIVE_MASTERCLASS_LESSONS: Record<string, VideoTeachingLesson[]> = {
  Spanish: [
    {
      id: 'es-vid-1',
      title: 'Spanish Pronunciation: Rolling the Double RR & Soft D/B Rules',
      cefrLevel: 'A0 - Absolute Beginner',
      duration: '06:45',
      category: 'Phonetics',
      thumbnailUrl: 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=800&q=80',
      instructor: 'Prof. Sofía Ramos (Madrid Phonetics Lab)',
      description: 'Physical tongue placement drills for the rolled double RR (perro vs pero), soft intervocalic D and B, and natural Spanish rhythm.',
      keyGrammarPoints: [
        'A single "r" between vowels is tapped once against the palate (pero).',
        'A double "rr" or initial "r" vibrates the tongue tip multiple times (perro, rosa).',
        'Intervocalic "d" sounds soft like English "th" in "feather" (todo, nada).',
      ],
      keyVocabulary: [
        { term: 'El ferrocarril', phonetic: '/fe.ro.kaˈril/', meaning: 'The railway / train' },
        { term: 'Buenas tardes', phonetic: '/ˈbwe.nas ˈtaɾ.des/', meaning: 'Good afternoon' },
        { term: 'Alrededor', phonetic: '/al.re.ðeˈðoɾ/', meaning: 'Around / Roundabout' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Prof. Sofía',
          text: '¡Hola a todos! Bienvenidos a la clase magistral de pronunciación española.',
          translation: 'Hello everyone! Welcome to the Spanish pronunciation masterclass.',
        },
        {
          timestamp: '00:04',
          seconds: 4,
          speaker: 'Prof. Sofía',
          text: 'Hoy aprenderemos la diferencia fundamental entre la R simple y la doble RR.',
          translation: 'Today we will learn the fundamental difference between the single R and double RR.',
        },
        {
          timestamp: '00:08',
          seconds: 8,
          speaker: 'Prof. Sofía',
          text: 'Escuchen con atención: «pero» significa "but", mientras que «perro» significa "dog".',
          translation: 'Listen carefully: "pero" means "but", while "perro" means "dog".',
        },
        {
          timestamp: '00:12',
          seconds: 12,
          speaker: 'Prof. Sofía',
          text: 'Coloquen la punta de la lengua en el paladar y dejen fluir el aire con energía.',
          translation: 'Place the tip of your tongue on the palate and let the air flow with energy.',
        },
        {
          timestamp: '00:16',
          seconds: 16,
          speaker: 'Prof. Sofía',
          text: 'Ahora practiquemos: «El perro de Ramón corre muy rápido por el parque».',
          translation: 'Now let us practice: "Ramón\'s dog runs very fast through the park".',
        },
        {
          timestamp: '00:20',
          seconds: 20,
          speaker: 'Prof. Sofía',
          text: '¡Excelente trabajo! Con práctica diaria dominarán el ritmo auténtico del español.',
          translation: 'Excellent job! With daily practice you will master the authentic Spanish rhythm.',
        },
      ],
      quizQuestions: [
        {
          question: 'What is the phonetic difference between "pero" and "perro"?',
          options: ['Single alveolar tap vs multi-vibrating trill', 'Different vowel length', 'No difference in Spanish', 'P is silent in perro'],
          correctIndex: 0,
          explanation: '"Pero" uses a single tap, while "perro" requires multiple tongue vibrations.',
        },
        {
          question: 'How is the letter "d" pronounced between two vowels (e.g. "todo")?',
          options: ['Hard like English "door"', 'Soft and friction-like, similar to "th" in "father"', 'Completely silent', 'Like a Spanish J'],
          correctIndex: 1,
          explanation: 'Intervocalic "d" in Spanish is an approximate sound similar to voiced "th".',
        },
      ],
    },
    {
      id: 'es-vid-2',
      title: 'Tapas Culture & Social Ordering in Madrid & Seville',
      cefrLevel: 'A1 - Beginner',
      duration: '07:30',
      category: 'Culture',
      thumbnailUrl: 'https://images.unsplash.com/photo-1515443961218-a51367888e4b?w=800&q=80',
      instructor: 'Carlos Mendoza (Andalusian Gastronome)',
      description: 'Master the art of "ir de tapas", ordering cañas, asking for tapas recomendaciones, and splitting the bill with local flair.',
      keyGrammarPoints: [
        'Use "¿Nos pone...?" or "¿Me pones...?" when ordering at a counter.',
        '"La cuenta, por favor" is the universal phrase for the check.',
        'Use the polite formula "Quisiera..." or "Para mí, una copa de vino".',
      ],
      keyVocabulary: [
        { term: 'Una caña', phonetic: '/ˈu.na ˈka.ɲa/', meaning: 'A small draft beer' },
        { term: 'Tapear', phonetic: '/ta.peˈaɾ/', meaning: 'To go out eating tapas from bar to bar' },
        { term: 'La cuenta', phonetic: '/la ˈkwen.ta/', meaning: 'The bill / check' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Carlos',
          text: 'En España, comer tapas no es solo alimentarse, es una forma de celebrar la vida.',
          translation: 'In Spain, eating tapas is not just feeding oneself, it is a way of celebrating life.',
        },
        {
          timestamp: '00:04',
          seconds: 4,
          speaker: 'Carlos',
          text: 'Cuando entren a una taberna, digan con una sonrisa: «¡Buenas! ¿Qué tapa nos recomiendas?»',
          translation: 'When you enter a tavern, say with a smile: "Hello! What tapa do you recommend?"',
        },
        {
          timestamp: '00:08',
          seconds: 8,
          speaker: 'Carlos',
          text: 'Para pedir la bebida, la fórmula más natural es: «Ponme una caña bien fría, por favor».',
          translation: 'To order a drink, the most natural formula is: "Pour me a cold small draft beer, please".',
        },
        {
          timestamp: '00:12',
          seconds: 12,
          speaker: 'Carlos',
          text: 'Y al terminar la velada, simplemente piden: «¿Nos cobras cuando puedas?»',
          translation: 'And when finishing the evening, simply ask: "Could you charge us whenever you can?"',
        },
      ],
      quizQuestions: [
        {
          question: 'What does the verb "tapear" mean?',
          options: ['To take an afternoon nap', 'To go eating tapas from bar to bar', 'To pay the restaurant bill', 'To cook at home'],
          correctIndex: 1,
          explanation: '"Tapear" is the authentic social ritual of visiting several bars for drinks and small plates.',
        },
      ],
    },
    {
      id: 'es-vid-3',
      title: 'Por vs Para & Object Pronoun Placement',
      cefrLevel: 'A2 - Elementary',
      duration: '08:15',
      category: 'Grammar',
      thumbnailUrl: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=800&q=80',
      instructor: 'Dra. Valeria Soto (Salamanca University)',
      description: 'Conquer the #1 dilemma for Spanish learners: when to use "por" (reason, exchange, duration) vs "para" (purpose, deadline, destination).',
      keyGrammarPoints: [
        '"Para" points forward towards a goal, deadline, or recipient (para ti, para mañana).',
        '"Por" looks back at a cause, motive, exchange, or duration (gracias por, por dos horas).',
      ],
      keyVocabulary: [
        { term: 'Por supuesto', phonetic: '/poɾ suˈpwes.to/', meaning: 'Of course' },
        { term: 'Para siempre', phonetic: '/ˈpa.ɾa ˈsjem.pɾe/', meaning: 'Forever' },
        { term: 'Por fin', phonetic: '/poɾ fin/', meaning: 'Finally / At last' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Dra. Valeria',
          text: 'Hoy resolveremos definitivamente el dilema de «por» y «para».',
          translation: 'Today we will definitively solve the dilemma of "por" and "para".',
        },
        {
          timestamp: '00:04',
          seconds: 4,
          speaker: 'Dra. Valeria',
          text: 'Recuerden esta regla mnemotécnica: «Para» mira hacia el destino y el propósito.',
          translation: 'Remember this memory rule: "Para" looks towards destination and purpose.',
        },
        {
          timestamp: '00:08',
          seconds: 8,
          speaker: 'Dra. Valeria',
          text: 'Mientras que «Por» explica el motivo, el intercambio y el tiempo transcurrido.',
          translation: 'While "Por" explains the motive, the exchange, and elapsed duration.',
        },
        {
          timestamp: '00:12',
          seconds: 12,
          speaker: 'Dra. Valeria',
          text: 'Por ejemplo: «Estudié por tres horas para aprobar el examen».',
          translation: 'For example: "I studied for three hours in order to pass the exam".',
        },
      ],
      quizQuestions: [
        {
          question: 'Which preposition is used for giving thanks ("Thank you FOR your help")?',
          options: ['Para (Gracias para tu ayuda)', 'Por (Gracias por tu ayuda)', 'De', 'Con'],
          correctIndex: 1,
          explanation: '"Gracias por" is used because it expresses the cause/reason for gratitude.',
        },
      ],
    },
  ],
  French: [
    {
      id: 'fr-vid-1',
      title: 'French Vowels, Nasal Sounds & Silent Endings Masterclass',
      cefrLevel: 'A0 - Absolute Beginner',
      duration: '06:15',
      category: 'Phonetics',
      thumbnailUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80',
      instructor: 'Élodie Laurent (Sorbonne Linguist)',
      description: 'Unlock authentic Parisian pronunciation: mouth positions for nasal vowels (on, an, in), silent final consonants, and smooth liaison.',
      keyGrammarPoints: [
        'Final consonants (d, p, s, t, x, z) are usually completely silent in French words.',
        'The letters -ent at the end of 3rd person plural verbs (ils parlent) are never pronounced.',
        'Liaison occurs when a normally silent ending consonant connects to the starting vowel of the next word.',
      ],
      keyVocabulary: [
        { term: 'La liaison', phonetic: '/la ljɛ.zɔ̃/', meaning: 'Sound linking between words' },
        { term: 'Les voyelles nasales', phonetic: '/le vwa.jɛl na.zal/', meaning: 'Nasal vowels' },
        { term: 'Bonjour', phonetic: '/bɔ̃.ʒuʁ/', meaning: 'Good day / Hello' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Instructor Élodie',
          text: 'Bonjour à tous ! Aujourd’hui, nous allons maîtriser les sons nasaux français.',
          translation: 'Hello everyone! Today, we are going to master French nasal sounds.',
        },
        {
          timestamp: '00:04',
          seconds: 4,
          speaker: 'Instructor Élodie',
          text: 'En français, l’air passe à la fois par la bouche et par le nez pour les voyelles nasales.',
          translation: 'In French, air passes through both the mouth and nose for nasal vowels.',
        },
        {
          timestamp: '00:08',
          seconds: 8,
          speaker: 'Instructor Élodie',
          text: 'Répétez après moi avec fierté : « Un bon vin blanc ». Sentez la vibration.',
          translation: 'Repeat after me with pride: "A good white wine". Feel the vibration.',
        },
        {
          timestamp: '00:12',
          seconds: 12,
          speaker: 'Instructor Élodie',
          text: 'Et souvenez-vous : la plupart des consonnes finales comme le S et le T ne se prononcent pas !',
          translation: 'And remember: most final consonants like S and T are not pronounced!',
        },
      ],
      quizQuestions: [
        {
          question: 'Which of the following word-ending consonants is normally SILENT in French?',
          options: ['-t (e.g. in "chat")', '-c (e.g. in "avec")', '-l (e.g. in "journal")', '-r (e.g. in "bonjour")'],
          correctIndex: 0,
          explanation: 'Final -t, -s, -d, -p, and -x are generally silent at the end of French words.',
        },
      ],
    },
    {
      id: 'fr-vid-2',
      title: 'Real Parisian Café Ordering & Courteous Interactions',
      cefrLevel: 'A1 - Beginner',
      duration: '07:10',
      category: 'Conversation',
      thumbnailUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=800&q=80',
      instructor: 'Julien Mercier (Cultural Ambassador)',
      description: 'Learn how to order coffee, pastries, and lunch like a Parisian local without resorting to English, using courteous formulas.',
      keyGrammarPoints: [
        'Always open any interaction with "Bonjour Madame / Monsieur" before asking for anything.',
        'Use the conditional polite formula "Je voudrais..." (I would like) rather than "Je veux".',
        'Add "S’il vous plaît" (Please) at the end of your request.',
      ],
      keyVocabulary: [
        { term: 'Un café allongé', phonetic: '/œ̃ ka.fe a.lɔ̃.ʒe/', meaning: 'An Americano / Long black coffee' },
        { term: 'L’addition', phonetic: '/la.di.sjɔ̃/', meaning: 'The bill / check' },
        { term: 'Je voudrais', phonetic: '/ʒə vu.dʁɛ/', meaning: 'I would like (polite conditional)' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Julien',
          text: 'Entrez toujours dans le café en disant poliment « Bonjour » au serveur.',
          translation: 'Always enter the café saying a polite "Hello" to the server.',
        },
        {
          timestamp: '00:04',
          seconds: 4,
          speaker: 'Julien',
          text: 'Pour commander, dites : « Je voudrais un café allongé et un croissant, s’il vous plaît ».',
          translation: 'To order, say: "I would like an Americano coffee and a croissant, please".',
        },
        {
          timestamp: '00:08',
          seconds: 8,
          speaker: 'Julien',
          text: 'Pour payer, un simple signe de tête accompagné de « L’addition, s’il vous plaît » suffit.',
          translation: 'To pay, a simple nod accompanied by "The bill, please" is sufficient.',
        },
      ],
      quizQuestions: [
        {
          question: 'What is the most polite formula to order an item in a French café?',
          options: ['Je veux un café', 'Donne-moi un café', 'Je voudrais un café, s’il vous plaît', 'Apporte le café'],
          correctIndex: 2,
          explanation: '"Je voudrais... s’il vous plaît" is the universal polite conditional phrase.',
        },
      ],
    },
  ],
  German: [
    {
      id: 'de-vid-1',
      title: 'German Cases: Der, Die, Das & The Akkusativ / Dativ Shift',
      cefrLevel: 'A1 - Beginner',
      duration: '08:30',
      category: 'Grammar',
      thumbnailUrl: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=800&q=80',
      instructor: 'Dr. Lukas Weber (Munich Language Academy)',
      description: 'Demystify German noun genders, the direct object Akkusativ shift (der -> den), and when prepositions trigger Dativ.',
      keyGrammarPoints: [
        'Only masculine articles change in the accusative case (der -> den, ein -> einen).',
        'Feminine (die), neuter (das), and plural (die) remain unchanged in the accusative.',
        'Dative case indicates indirect objects or location with dual prepositions (in dem -> im).',
      ],
      keyVocabulary: [
        { term: 'Der Schlüssel', phonetic: '/deːɐ̯ ˈʃlʏsl̩/', meaning: 'The key' },
        { term: 'Ich brauche', phonetic: '/ɪç ˈbʁaʊ̯xə/', meaning: 'I need' },
        { term: 'Guten Morgen', phonetic: '/ˈɡuːtn̩ ˈmɔʁɡn̩/', meaning: 'Good morning' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Dr. Lukas',
          text: 'Guten Tag zusammen! Heute knacken wir das Geheimnis der deutschen Fälle.',
          translation: 'Good day everyone! Today we crack the secret of German cases.',
        },
        {
          timestamp: '00:05',
          seconds: 5,
          speaker: 'Dr. Lukas',
          text: 'Wenn Sie ein direktes Objekt haben, ändert sich nur der maskuline Artikel: aus «der» wird «den».',
          translation: 'When you have a direct object, only the masculine article changes: "der" becomes "den".',
        },
        {
          timestamp: '00:10',
          seconds: 10,
          speaker: 'Dr. Lukas',
          text: 'Zum Beispiel: «Ich sehe den Hund» und «Ich habe einen Kaffee».',
          translation: 'For example: "I see the dog" and "I have a coffee".',
        },
      ],
      quizQuestions: [
        {
          question: 'Which gender article changes form in the Akkusativ (direct object) case?',
          options: ['Masculine (der -> den)', 'Feminine (die -> der)', 'Neuter (das -> den)', 'All genders change'],
          correctIndex: 0,
          explanation: 'Only masculine articles transform in the accusative case.',
        },
      ],
    },
  ],
  Japanese: [
    {
      id: 'ja-vid-1',
      title: 'Japanese Pitch Accent, Polite Cadence & Daily Greetings',
      cefrLevel: 'A1 - Beginner',
      duration: '08:00',
      category: 'Phonetics',
      thumbnailUrl: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80',
      instructor: 'Kenji Takahashi (Tokyo Speech Institute)',
      description: 'Master Japanese mora timing, high-low pitch accent pairs (hashi = bridge vs chopsticks), and polite desu/masu cadence.',
      keyGrammarPoints: [
        'Japanese is a mora-timed language where each syllable has equal duration.',
        'Pitch accent differentiates homophones: 箸 (hashi - chopsticks) vs 橋 (hashi - bridge).',
        'Add "kudasai" or "onegaishimasu" for natural polite requests.',
      ],
      keyVocabulary: [
        { term: 'お会計 (O-kaikei)', phonetic: '/o.ka.i.keː/', meaning: 'The bill / check' },
        { term: 'ありがとうございます', phonetic: '/a.ɾi.ɡa.toː ɡo.za.i.ma.sɯ/', meaning: 'Thank you very much' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Kenji',
          text: '皆さん、こんにちは！今日は自然な日本語の発音と高低アクセントを練習しましょう。',
          translation: 'Hello everyone! Today let us practice natural Japanese pronunciation and pitch accent.',
        },
        {
          timestamp: '00:05',
          seconds: 5,
          speaker: 'Kenji',
          text: '日本語は一音一音を同じリズムで発音するのがポイントです。',
          translation: 'The key to Japanese is pronouncing every single mora with equal rhythmic timing.',
        },
        {
          timestamp: '00:10',
          seconds: 10,
          speaker: 'Kenji',
          text: '「ありがとうございます」を滑らかに言えるように練習しましょう。',
          translation: 'Let us practice saying "Arigatou gozaimasu" smoothly and naturally.',
        },
      ],
      quizQuestions: [
        {
          question: 'What timing principle does standard Japanese follow?',
          options: ['Mora-timed equal syllables', 'Stress-timed like English', 'Pitch-free monotone', 'Speed variations only'],
          correctIndex: 0,
          explanation: 'Japanese is mora-timed, giving each syllable equal beat duration.',
        },
      ],
    },
  ],
  Italian: [
    {
      id: 'it-vid-1',
      title: 'Italian Musical Cadence, Double Consonants & Expressive Phrasing',
      cefrLevel: 'A1 - Beginner',
      duration: '06:30',
      category: 'Phonetics',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&q=80',
      instructor: 'Prof. Matteo Rossi (Florence Lingua)',
      description: 'Master the rhythmic elongation of Italian double consonants (pala vs palla), open vs closed vowels, and authentic melodic intonation.',
      keyGrammarPoints: [
        'Double consonants must be held for twice as long with a brief closure (notte, bella).',
        'Vowels in Italian are pure and never glide into diphthongs.',
        'Use "Vorrei..." for courteous polite requests in cafés.',
      ],
      keyVocabulary: [
        { term: 'Il caffè espresso', phonetic: '/il kafˈfɛ eˈsprɛs.so/', meaning: 'Espresso coffee' },
        { term: 'Piacere', phonetic: '/pjaˈtʃe.re/', meaning: 'Nice to meet you' },
        { term: 'Buon appetito', phonetic: '/ˌbwɔn appeˈti.to/', meaning: 'Enjoy your meal' },
      ],
      transcriptSegments: [
        {
          timestamp: '00:00',
          seconds: 0,
          speaker: 'Prof. Matteo',
          text: 'Ciao a tutti! Benvenuti nella nostra lezione di lingua e cultura italiana.',
          translation: 'Hello everyone! Welcome to our Italian language and culture lesson.',
        },
        {
          timestamp: '00:04',
          seconds: 4,
          speaker: 'Prof. Matteo',
          text: 'L’italiano è una lingua musicale: ogni parola ha una melodia e vocali chiare.',
          translation: 'Italian is a musical language: each word has melody and clear vowels.',
        },
        {
          timestamp: '00:08',
          seconds: 8,
          speaker: 'Prof. Matteo',
          text: 'Attenzione alle doppie consonanti: «sete» significa thirst, ma «sette» è il numero 7.',
          translation: 'Pay attention to double consonants: "sete" means thirst, but "sette" is the number 7.',
        },
      ],
      quizQuestions: [
        {
          question: 'How do you pronounce Italian double consonants like in "notte"?',
          options: ['Hold the consonant closure for twice the duration', 'Pronounce it softly', 'Skip the second consonant', 'Make a silent pause before the word'],
          correctIndex: 0,
          explanation: 'Double consonants in Italian require a distinct, held articulation pause.',
        },
      ],
    },
  ],
};

// Language speech synthesis locale mapping
const getLanguageSpeechCode = (langName: string): string => {
  const map: Record<string, string> = {
    Spanish: 'es-ES',
    French: 'fr-FR',
    German: 'de-DE',
    Japanese: 'ja-JP',
    Italian: 'it-IT',
    Portuguese: 'pt-BR',
    Russian: 'ru-RU',
    Chinese: 'zh-CN',
    Korean: 'ko-KR',
    Arabic: 'ar-SA',
    Hindi: 'hi-IN',
  };
  return map[langName] || 'es-ES';
};

interface VideoTeachingStudioViewProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: ProficiencyLevel;
  onAwardXP: (amount: number) => void;
  onOpenWordLookup?: (word: string, context: string) => void;
  onSaveWord?: (word: SavedWord) => void;
  onOpenVoiceChat?: () => void;
}

export const VideoTeachingStudioView: React.FC<VideoTeachingStudioViewProps> = ({
  currentLanguage,
  proficiencyLevel,
  onAwardXP,
  onOpenWordLookup,
  onSaveWord,
  onOpenVoiceChat,
}) => {
  const langKey = EXTENSIVE_MASTERCLASS_LESSONS[currentLanguage.name] ? currentLanguage.name : 'Spanish';
  const initialLessons = EXTENSIVE_MASTERCLASS_LESSONS[langKey] || EXTENSIVE_MASTERCLASS_LESSONS.Spanish;

  const [allLessons, setAllLessons] = useState<VideoTeachingLesson[]>(initialLessons);
  const [selectedLesson, setSelectedLesson] = useState<VideoTeachingLesson>(initialLessons[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom AI Lesson generator state
  const [customTopic, setCustomTopic] = useState('');
  const [isGeneratingCustom, setIsGeneratingCustom] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // High-Reliability Audio Engine State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1.0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [isLoopingSegment, setIsLoopingSegment] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'transcript' | 'grammar' | 'vocabulary' | 'quiz'>('transcript');
  const [isSpeakingNow, setIsSpeakingNow] = useState<boolean>(false);

  // Quiz interactive state
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number | null>(null);

  // References for flawless speech synthesis loop
  const isPlayingRef = useRef<boolean>(false);
  const isLoopingRef = useRef<boolean>(false);
  const speedRef = useRef<number>(1.0);
  const volumeRef = useRef<number>(1.0);
  const isMutedRef = useRef<boolean>(false);
  const currentSegmentIndexRef = useRef<number>(0);
  const selectedLessonRef = useRef<VideoTeachingLesson>(initialLessons[0]);
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const keepAliveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextLineTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep refs synchronized
  useEffect(() => {
    isPlayingRef.current = isPlaying;
    isLoopingRef.current = isLoopingSegment;
    speedRef.current = playbackSpeed;
    volumeRef.current = volume;
    isMutedRef.current = isMuted;
    currentSegmentIndexRef.current = currentSegmentIndex;
    selectedLessonRef.current = selectedLesson;
  }, [isPlaying, isLoopingSegment, playbackSpeed, volume, isMuted, currentSegmentIndex, selectedLesson]);

  // Keep-alive heartbeat to prevent browser SpeechSynthesis pauses/freezes
  useEffect(() => {
    keepAliveTimerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }
    }, 4500);

    return () => {
      if (keepAliveTimerRef.current) clearInterval(keepAliveTimerRef.current);
      if (nextLineTimeoutRef.current) clearTimeout(nextLineTimeoutRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Synchronize lessons on language change
  useEffect(() => {
    stopPlayback();
    const key = EXTENSIVE_MASTERCLASS_LESSONS[currentLanguage.name] ? currentLanguage.name : 'Spanish';
    const lessons = EXTENSIVE_MASTERCLASS_LESSONS[key] || EXTENSIVE_MASTERCLASS_LESSONS.Spanish;
    setAllLessons(lessons);
    setSelectedLesson(lessons[0]);
    setCurrentSegmentIndex(0);
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  }, [currentLanguage.name]);

  // Stop playback completely
  const stopPlayback = () => {
    if (nextLineTimeoutRef.current) {
      clearTimeout(nextLineTimeoutRef.current);
      nextLineTimeoutRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsSpeakingNow(false);
  };

  // Play audio for a specific sentence index
  const playSentenceAudio = (index: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (nextLineTimeoutRef.current) {
      clearTimeout(nextLineTimeoutRef.current);
      nextLineTimeoutRef.current = null;
    }
    
    window.speechSynthesis.cancel();

    const segments = selectedLessonRef.current.transcriptSegments || [];
    if (!segments[index]) {
      setIsPlaying(false);
      setIsSpeakingNow(false);
      return;
    }

    const currentSegment = segments[index];
    const textToSpeak = currentSegment.text;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    utterance.lang = getLanguageSpeechCode(currentLanguage.name);
    utterance.rate = Math.max(0.65, speedRef.current * 0.92);
    utterance.volume = isMutedRef.current ? 0 : volumeRef.current;
    
    // Pick authentic voice if available
    const voices = window.speechSynthesis.getVoices();
    const targetLangCode = getLanguageSpeechCode(currentLanguage.name).toLowerCase();
    const matchingVoice = voices.find(
      (v) => v.lang.toLowerCase() === targetLangCode || v.lang.toLowerCase().startsWith(targetLangCode.split('-')[0])
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setIsSpeakingNow(true);
    };

    utterance.onend = () => {
      setIsSpeakingNow(false);
      
      // If loop active, repeat this line
      if (isLoopingRef.current && isPlayingRef.current) {
        nextLineTimeoutRef.current = setTimeout(() => {
          if (isPlayingRef.current) {
            playSentenceAudio(currentSegmentIndexRef.current);
          }
        }, 600);
        return;
      }

      // If playing continuous lecture, advance to next sentence
      if (isPlayingRef.current) {
        const nextIdx = index + 1;
        if (nextIdx < segments.length) {
          nextLineTimeoutRef.current = setTimeout(() => {
            if (isPlayingRef.current) {
              setCurrentSegmentIndex(nextIdx);
              playSentenceAudio(nextIdx);
            }
          }, 550);
        } else {
          // Finished entire lesson!
          setIsPlaying(false);
          setIsSpeakingNow(false);
          onAwardXP(30);
          setStatusMessage('🎉 Masterclass completed! +30 XP awarded.');
          setTimeout(() => setStatusMessage(null), 4000);
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis playback note:', e);
      setIsSpeakingNow(false);
    };

    activeUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      setIsPlaying(true);
      playSentenceAudio(currentSegmentIndex);
    }
  };

  const handleSelectSentence = (idx: number) => {
    setCurrentSegmentIndex(idx);
    setIsPlaying(true);
    playSentenceAudio(idx);
  };

  const handlePrevSentence = () => {
    const prevIdx = Math.max(0, currentSegmentIndex - 1);
    setCurrentSegmentIndex(prevIdx);
    if (isPlaying) {
      playSentenceAudio(prevIdx);
    }
  };

  const handleNextSentence = () => {
    const segments = selectedLesson.transcriptSegments || [];
    const nextIdx = Math.min(segments.length - 1, currentSegmentIndex + 1);
    setCurrentSegmentIndex(nextIdx);
    if (isPlaying) {
      playSentenceAudio(nextIdx);
    }
  };

  const handleReplayCurrent = () => {
    setIsPlaying(true);
    playSentenceAudio(currentSegmentIndex);
  };

  const handleToggleLoop = () => {
    setIsLoopingSegment((prev) => !prev);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (isPlaying) {
      playSentenceAudio(currentSegmentIndex);
    }
  };

  const handleToggleMute = () => {
    setIsMuted((prev) => !prev);
  };

  const handleSelectLesson = (les: VideoTeachingLesson) => {
    stopPlayback();
    setSelectedLesson(les);
    setCurrentSegmentIndex(0);
    setSelectedQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(null);
  };

  // Generate a custom AI Masterclass lesson
  const handleGenerateCustomLesson = async () => {
    if (!customTopic.trim() || isGeneratingCustom) return;
    setIsGeneratingCustom(true);
    setStatusMessage('Crafting pedagogical Masterclass lesson with AI...');

    try {
      const resp = await fetch('/api/generate-video-masterclass', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: currentLanguage.name,
          proficiencyLevel,
          topic: customTopic,
          category: 'Conversation',
        }),
      });

      if (!resp.ok) throw new Error('Generation failed');
      const data = await resp.json();

      const newLesson: VideoTeachingLesson = {
        id: `custom-mc-${Date.now()}`,
        title: data.title || customTopic,
        cefrLevel: data.cefrLevel || proficiencyLevel,
        duration: data.duration || '07:00',
        category: 'Conversation',
        thumbnailUrl: data.thumbnailUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
        instructor: data.instructor || `Prof. ${currentLanguage.name} Expert`,
        description: data.description || `Comprehensive lesson focusing on ${customTopic}.`,
        keyGrammarPoints: data.keyGrammarPoints || ['Focus on active verb conjugation and situational vocabulary.'],
        keyVocabulary: data.keyVocabulary || [{ term: customTopic, phonetic: '/custom/', meaning: customTopic }],
        transcriptSegments: (data.transcriptSegments || []).map((seg: any, idx: number) => ({
          timestamp: seg.timestamp || `00:${(idx * 5).toString().padStart(2, '0')}`,
          seconds: idx * 5,
          speaker: seg.speaker || 'Instructor',
          text: seg.text || '',
          translation: seg.translation || '',
        })),
        quizQuestions: data.quizQuestions || [
          {
            question: `What is the key communicative objective of this lesson?`,
            options: ['Mastering the core expressions', 'Memorizing grammar rules', 'Skipping pronunciation', 'Translating word-by-word'],
            correctIndex: 0,
            explanation: 'The masterclass focuses on practical conversational mastery.',
          },
        ],
      };

      setAllLessons((prev) => [newLesson, ...prev]);
      handleSelectLesson(newLesson);
      setCustomTopic('');
      setStatusMessage('✨ Custom Masterclass generated and ready!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.warn('Custom lesson generator fallback:', err);
      // Fallback local custom lesson
      const fallbackLesson: VideoTeachingLesson = {
        id: `custom-mc-${Date.now()}`,
        title: `${currentLanguage.name} Masterclass: ${customTopic}`,
        cefrLevel: proficiencyLevel,
        duration: '06:30',
        category: 'Conversation',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80',
        instructor: `Prof. Academic Specialist`,
        description: `Interactive lecture focusing on authentic conversation for: ${customTopic}`,
        keyGrammarPoints: [
          'Use contextual expressions and natural speech cadence.',
          'Pay close attention to word emphasis and conversational pauses.',
        ],
        keyVocabulary: [
          { term: customTopic, phonetic: '/ˈtɒp.ɪk/', meaning: 'Key lesson subject' },
        ],
        transcriptSegments: [
          {
            timestamp: '00:00',
            seconds: 0,
            speaker: 'Instructor',
            text: `Bienvenidos a nuestra lección sobre ${customTopic}.`,
            translation: `Welcome to our lesson on ${customTopic}.`,
          },
          {
            timestamp: '00:05',
            seconds: 5,
            speaker: 'Instructor',
            text: 'Escuchen atentamente las frases y repitan con buena pronunciación.',
            translation: 'Listen closely to the phrases and repeat with good pronunciation.',
          },
        ],
        quizQuestions: [
          {
            question: `What is the main focus of this custom masterclass?`,
            options: ['Real-world conversational mastery', 'Passive reading only', 'Writing essays', 'Multiple choice grammar'],
            correctIndex: 0,
            explanation: 'Masterclasses prioritize communicative fluency.',
          },
        ],
      };
      setAllLessons((prev) => [fallbackLesson, ...prev]);
      handleSelectLesson(fallbackLesson);
      setCustomTopic('');
      setStatusMessage('✨ Masterclass lesson prepared!');
      setTimeout(() => setStatusMessage(null), 3000);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  // Submit quiz
  const handleQuizSubmit = () => {
    let score = 0;
    const questions = selectedLesson.quizQuestions || [];
    questions.forEach((q, idx) => {
      if (selectedQuizAnswers[idx] === q.correctIndex) {
        score++;
      }
    });
    setQuizScore(score);
    setQuizSubmitted(true);
    if (score === questions.length && questions.length > 0) {
      onAwardXP(25);
    } else {
      onAwardXP(10);
    }
  };

  const filteredLessons = allLessons.filter((lesson) => {
    const matchesCategory = selectedCategory === 'All' || lesson.category === selectedCategory;
    const matchesSearch =
      lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lesson.cefrLevel.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeSegment = selectedLesson.transcriptSegments ? selectedLesson.transcriptSegments[currentSegmentIndex] : null;
  const totalSegments = selectedLesson.transcriptSegments?.length || 0;
  const progressPercent = totalSegments > 0 ? ((currentSegmentIndex + 1) / totalSegments) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner / Status Alert */}
      {statusMessage && (
        <div className="p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-white/60 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Studio Grid: Left Lesson Board (7 cols) + Right Lesson Selector (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: The Interactive Audio Classroom Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="glass-card-neon rounded-3xl border border-pink-500/30 overflow-hidden shadow-2xl flex flex-col">
            
            {/* Stage Header */}
            <div className="p-4 sm:p-5 border-b border-white/10 bg-black/40 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-[2px] shadow-lg ${isSpeakingNow ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900' : ''}`}>
                    <img
                      src={selectedLesson.thumbnailUrl}
                      alt={selectedLesson.instructor}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  {isSpeakingNow && (
                    <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-cyan-500 border-2 border-black"></span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-lg bg-pink-500/20 text-pink-300 font-black text-[10px] border border-pink-500/30">
                      {selectedLesson.cefrLevel.split(' - ')[0]}
                    </span>
                    <span className="text-[11px] font-bold text-cyan-300">
                      {selectedLesson.category} Lecture
                    </span>
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white leading-tight mt-0.5 line-clamp-1">
                    {selectedLesson.title}
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium">
                    {selectedLesson.instructor}
                  </p>
                </div>
              </div>

              {/* Speech Engine Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.06] border border-white/15 text-[11px] font-bold text-white/90">
                <Radio className={`w-3.5 h-3.5 ${isSpeakingNow ? 'text-pink-400 animate-pulse' : 'text-slate-400'}`} />
                <span>{isSpeakingNow ? 'Lecture Speaking' : isPlaying ? 'Continuous Play' : 'Ready'}</span>
              </div>
            </div>

            {/* Stage Center Audio Board with Visualizer & Phrase Highlight */}
            <div className="p-6 sm:p-8 bg-gradient-to-b from-[#110524] via-[#090214] to-[#120426] flex flex-col items-center justify-between min-h-[290px] relative">
              
              {/* Top Speaker Indicator & Sound Waveform Equalizer */}
              <div className="w-full flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                  <Volume2 className="w-4 h-4 text-pink-400" />
                  <span>{activeSegment?.speaker || 'Instructor'}</span>
                </div>

                {/* Animated Dynamic Equalizer Bars */}
                <div className="flex items-center gap-1 h-5 px-3 py-1 rounded-full bg-black/40 border border-white/10">
                  {[0.4, 0.9, 0.6, 1.0, 0.7, 0.8, 0.5, 0.9, 0.3].map((heightScale, barIdx) => (
                    <span
                      key={barIdx}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isSpeakingNow
                          ? 'bg-gradient-to-t from-pink-500 to-cyan-400 animate-pulse'
                          : 'bg-white/20 h-1.5'
                      }`}
                      style={{
                        height: isSpeakingNow ? `${Math.max(4, heightScale * 18)}px` : '4px',
                        animationDelay: `${barIdx * 100}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive Target Sentence Display with Clickable Words */}
              <div className="w-full max-w-2xl my-auto text-center space-y-4 py-2">
                {activeSegment ? (
                  <>
                    <div className="p-4 sm:p-5 rounded-2xl bg-black/60 border border-pink-500/20 backdrop-blur-md shadow-2xl">
                      <p className="text-base sm:text-lg md:text-xl font-black text-white flex flex-wrap justify-center gap-2 leading-relaxed">
                        {activeSegment.text.split(' ').map((word, wIdx) => {
                          const cleanWord = word.replace(/[.,?!«»"']/g, '');
                          return (
                            <span
                              key={wIdx}
                              onClick={() => onOpenWordLookup && onOpenWordLookup(cleanWord, activeSegment.text)}
                              className="hover:text-pink-300 hover:underline cursor-pointer transition-all px-1.5 py-0.5 rounded-lg hover:bg-pink-500/20"
                              title="Click word for instant translation & dictionary lookup"
                            >
                              {word}
                            </span>
                          );
                        })}
                      </p>

                      <p className="mt-3 text-xs sm:text-sm text-cyan-200/90 font-medium italic border-t border-white/10 pt-2.5">
                        "{activeSegment.translation}"
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      💡 Tip: Click any word above to look up its definition and grammar usage.
                    </p>
                  </>
                ) : (
                  <p className="text-slate-400 text-sm">Select a phrase or start playback.</p>
                )}
              </div>

              {/* Timeline Progress Bar */}
              <div className="w-full mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                  <span>Line {currentSegmentIndex + 1} of {totalSegments}</span>
                  <span>{Math.round(progressPercent)}% Completed</span>
                </div>
                <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Control Bar */}
            <div className="p-4 bg-black/80 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              
              {/* Prev / Play / Next / Replay Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevSentence}
                  disabled={currentSegmentIndex === 0}
                  className="p-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] disabled:opacity-40 text-white transition-all cursor-pointer"
                  title="Previous Sentence"
                >
                  <Rewind className="w-4 h-4" />
                </button>

                <button
                  onClick={handleTogglePlay}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-sm shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all cursor-pointer active:scale-95"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 fill-white" />
                      <span>Pause Lecture</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                      <span>Start Lecture</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleNextSentence}
                  disabled={currentSegmentIndex >= totalSegments - 1}
                  className="p-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] disabled:opacity-40 text-white transition-all cursor-pointer"
                  title="Next Sentence"
                >
                  <FastForward className="w-4 h-4" />
                </button>

                <button
                  onClick={handleReplayCurrent}
                  className="p-2.5 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-cyan-300 transition-all cursor-pointer"
                  title="Replay Current Sentence Audio"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={handleToggleLoop}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isLoopingSegment
                      ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                  }`}
                  title="Repeat current sentence in a loop until mastered"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Loop Line</span>
                </button>
              </div>

              {/* Speed Pills & Volume Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-black/40 p-0.5 rounded-xl border border-white/10">
                  {[0.75, 1.0, 1.25].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-pink-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleToggleMute}
                  className="p-2 rounded-xl bg-white/[0.07] hover:bg-white/[0.14] text-white transition-all cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-300" />}
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Tabs: Interactive Transcript, Grammar Notes, Key Vocab, and Quiz */}
          <div className="glass-card rounded-3xl border border-white/15 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
              <button
                onClick={() => setActiveTab('transcript')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'transcript'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Synchronized Transcript ({totalSegments})</span>
              </button>

              <button
                onClick={() => setActiveTab('grammar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'grammar'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Grammar & Takeaways</span>
              </button>

              <button
                onClick={() => setActiveTab('vocabulary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'vocabulary'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Vocabulary ({selectedLesson.keyVocabulary.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('quiz')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === 'quiz'
                    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Comprehension Quiz</span>
              </button>
            </div>

            {/* TAB CONTENT 1: TRANSCRIPT */}
            {activeTab === 'transcript' && (
              <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                {selectedLesson.transcriptSegments?.map((seg, sIdx) => {
                  const isActive = currentSegmentIndex === sIdx;
                  return (
                    <div
                      key={sIdx}
                      onClick={() => handleSelectSentence(sIdx)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-pink-500/15 border-pink-500/60 shadow-[0_0_15px_rgba(236,72,153,0.2)]'
                          : 'bg-white/[0.03] border-white/10 hover:bg-white/[0.08] hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-pink-300">{seg.speaker}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">{seg.timestamp}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectSentence(sIdx);
                            }}
                            className="p-1 rounded-lg bg-white/10 hover:bg-pink-500/30 text-white transition-all"
                            title="Listen to this line"
                          >
                            <Volume2 className="w-3 h-3 text-cyan-300" />
                          </button>
                        </div>
                      </div>

                      <p className="text-sm font-black text-white leading-snug">
                        {seg.text}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 font-medium italic">
                        {seg.translation}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* TAB CONTENT 2: GRAMMAR */}
            {activeTab === 'grammar' && (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10">
                  <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">
                    Masterclass Pedagogical Overview
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedLesson.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-pink-300 uppercase tracking-wider">
                    Key Grammar & Pronunciation Rules
                  </h4>
                  {selectedLesson.keyGrammarPoints.map((pt, pIdx) => (
                    <div key={pIdx} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-white">
                      <CheckCircle2 className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: VOCABULARY */}
            {activeTab === 'vocabulary' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLesson.keyVocabulary.map((voc, vIdx) => (
                    <div key={vIdx} className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-white">{voc.term}</span>
                          <button
                            onClick={() => {
                              if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                                const utt = new SpeechSynthesisUtterance(voc.term);
                                utt.lang = getLanguageSpeechCode(currentLanguage.name);
                                window.speechSynthesis.speak(utt);
                              }
                            }}
                            className="p-1 rounded-lg bg-white/10 hover:bg-cyan-500/20 text-cyan-300"
                            title="Hear pronunciation"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] font-mono text-cyan-300">{voc.phonetic}</p>
                        <p className="text-xs text-slate-300 mt-1">{voc.meaning}</p>
                      </div>

                      {onSaveWord && (
                        <button
                          onClick={() => {
                            onSaveWord({
                              id: `vocab-${Date.now()}-${vIdx}`,
                              word: voc.term,
                              translation: voc.meaning,
                              phonetic: voc.phonetic,
                              contextSentence: selectedLesson.title,
                              language: currentLanguage.name,
                              savedAt: new Date(),
                              masteryLevel: 1,
                            });
                            onAwardXP(5);
                            setStatusMessage(`Saved "${voc.term}" to your Flashcard Deck (+5 XP)`);
                            setTimeout(() => setStatusMessage(null), 3000);
                          }}
                          className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 font-bold text-[11px] border border-pink-400/30 transition-all cursor-pointer"
                        >
                          <BookmarkPlus className="w-3 h-3" />
                          <span>Save to Flashcards</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT 4: QUIZ */}
            {activeTab === 'quiz' && (
              <div className="space-y-4">
                {selectedLesson.quizQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-3">
                    <p className="text-xs sm:text-sm font-bold text-white">
                      {qIdx + 1}. {q.question}
                    </p>

                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = selectedQuizAnswers[qIdx] === optIdx;
                        const isCorrect = q.correctIndex === optIdx;
                        
                        let optionClass = 'bg-white/[0.04] border-white/10 hover:bg-white/[0.08] text-slate-300';
                        if (quizSubmitted) {
                          if (isCorrect) {
                            optionClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            optionClass = 'bg-rose-500/20 border-rose-500 text-rose-200';
                          }
                        } else if (isSelected) {
                          optionClass = 'bg-pink-500/25 border-pink-400 text-pink-200 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => setSelectedQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                            className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer flex items-center justify-between ${optionClass}`}
                          >
                            <span>{opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && (
                      <p className="text-xs text-cyan-300/90 bg-cyan-500/10 p-2.5 rounded-xl border border-cyan-500/20">
                        💡 {q.explanation}
                      </p>
                    )}
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(selectedQuizAnswers).length < selectedLesson.quizQuestions.length}
                    className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 disabled:opacity-50 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
                  >
                    Submit Quiz Answers & Earn XP
                  </button>
                ) : (
                  <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold text-center flex items-center justify-between">
                    <span>Quiz Complete: Score {quizScore} / {selectedLesson.quizQuestions.length}</span>
                    <button
                      onClick={() => {
                        setSelectedQuizAnswers({});
                        setQuizSubmitted(false);
                        setQuizScore(null);
                      }}
                      className="px-3 py-1 rounded-xl bg-white/10 text-white text-[11px] font-bold"
                    >
                      Retry Quiz
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Masterclasses Catalog & Filter System */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Custom Topic Generator Card */}
          <div className="glass-card p-4 rounded-3xl border border-white/15 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <h3 className="text-xs font-black text-white uppercase tracking-wider">
                Generate Custom {currentLanguage.name} Masterclass
              </h3>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerateCustomLesson()}
                placeholder="e.g. Booking a luxury hotel in Milan..."
                className="flex-1 bg-white/[0.06] border border-white/15 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
              <button
                onClick={handleGenerateCustomLesson}
                disabled={!customTopic.trim() || isGeneratingCustom}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                {isGeneratingCustom ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>Create</span>
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search masterclasses by topic or CEFR..."
                className="w-full bg-white/[0.05] border border-white/15 focus:border-pink-500 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {['All', 'Phonetics', 'Grammar', 'Conversation', 'Culture'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-pink-500 text-white shadow-xs'
                      : 'bg-white/[0.06] text-slate-300 hover:bg-white/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Masterclasses List */}
          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredLessons.map((lesson) => {
              const isSelected = selectedLesson.id === lesson.id;
              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(lesson)}
                  className={`p-3.5 rounded-3xl border transition-all cursor-pointer flex gap-3.5 items-center ${
                    isSelected
                      ? 'bg-pink-500/15 border-pink-500/60 shadow-[0_0_20px_rgba(236,72,153,0.25)]'
                      : 'glass-card border-white/10 hover:bg-white/[0.08] hover:border-white/25'
                  }`}
                >
                  {/* Thumbnail Avatar */}
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 relative bg-black">
                    <img
                      src={lesson.thumbnailUrl}
                      alt={lesson.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Volume2 className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.2 rounded-md bg-pink-500/20 text-pink-300 font-black text-[9px] border border-pink-500/30">
                        {lesson.cefrLevel.split(' - ')[0]}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-bold">
                        {lesson.category}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-black text-white truncate">
                      {lesson.title}
                    </h4>

                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {lesson.instructor} • {lesson.transcriptSegments?.length || 0} sentences
                    </p>
                  </div>

                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-pink-400' : 'text-slate-500'}`} />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
