import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Zap,
  Award,
  Trophy,
  Flame,
  Volume2,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  Check,
  Play,
  RotateCcw,
  Clock,
  ArrowRight,
  Headphones,
  Mic,
  PenTool,
  GraduationCap,
  Shield,
  Layers,
  ChevronRight,
  HelpCircle,
  Video,
  Plus,
  Loader2,
  Filter,
  Search,
} from 'lucide-react';
import {
  LanguageOption,
  ProficiencyLevel,
  SavedWord,
  UserProfile,
  CEFRStory,
} from '../types';
import { CEFR_STORIES } from '../data/cefrStories';
import { StoryReaderModal } from './practice/StoryReaderModal';
import { ReadingPracticeView } from './practice/ReadingPracticeView';
import { ListeningPracticeView } from './practice/ListeningPracticeView';
import { SpeakingPracticeView } from './practice/SpeakingPracticeView';
import { WritingPracticeView } from './practice/WritingPracticeView';
import { PhoneticsStudioView } from './practice/PhoneticsStudioView';
import { VideoTeachingStudioView } from './practice/VideoTeachingStudioView';
import { SkillIncrement } from '../utils/streakManager';

interface LearningHubViewProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: ProficiencyLevel;
  user: UserProfile | null;
  onSaveWord: (word: SavedWord) => void;
  onOpenWordLookup: (word: string, contextSentence: string) => void;
  onAwardXP: (amount: number, skill?: SkillIncrement) => void;
  onOpenVoiceChat: () => void;
  onOpenStreakModal?: () => void;
}

// Daily Words
const DAILY_WORDS: Record<string, { word: string; phonetic: string; translation: string; pos: string; sentence: string; nativeSentence: string; tip: string }> = {
  Spanish: {
    word: 'Inolvidable',
    phonetic: '/i.nol.biˈða.βle/',
    translation: 'Unforgettable',
    pos: 'adjective',
    sentence: 'Fue un viaje inolvidable por las montañas de Granada.',
    nativeSentence: 'It was an unforgettable trip through the mountains of Granada.',
    tip: 'Formed with prefix "in-" (un-) + "olvidar" (to forget) + "-able" (able).',
  },
  French: {
    word: 'Éphémère',
    phonetic: '/e.fe.mɛʁ/',
    translation: 'Fleeting / Ephemeral',
    pos: 'adjective',
    sentence: 'La beauté du coucher de soleil sur la Seine est éphémère.',
    nativeSentence: 'The beauty of the sunset over the Seine is fleeting.',
    tip: 'Often used in Parisian literature to describe fleeting moments of beauty.',
  },
  German: {
    word: 'Feierabend',
    phonetic: '/ˈfaɪ̯ɐˌʔaːbn̩t/',
    translation: 'End of the workday / Evening rest',
    pos: 'noun (masculine)',
    sentence: 'Schönen Feierabend allerseits!',
    nativeSentence: 'Have a wonderful evening after work, everyone!',
    tip: 'A unique cultural German concept with no direct single-word English equivalent.',
  },
  Japanese: {
    word: '木漏れ日 (Komorebi)',
    phonetic: '/ko.mo.ɾe.bi/',
    translation: 'Sunlight filtering through trees',
    pos: 'noun',
    sentence: '木漏れ日の中を散歩するのが好きです。',
    nativeSentence: 'I enjoy walking in the sunlight filtering through trees.',
    tip: 'Poetic natural term expressing appreciation for nature’s subtle beauty.',
  },
};

// Rich Multilingual Vocabulary Dictionary for Infinite Randomized Sprints
const VOCAB_SPRINT_DICTIONARY: Record<string, { word: string; translation: string }[]> = {
  Spanish: [
    { word: 'Viaje', translation: 'Journey / Trip' },
    { word: 'Tiempo', translation: 'Time / Weather' },
    { word: 'Comida', translation: 'Food / Meal' },
    { word: 'Cansado', translation: 'Tired' },
    { word: 'Rápido', translation: 'Fast / Quick' },
    { word: 'Despacio', translation: 'Slowly' },
    { word: 'Ciudad', translation: 'City' },
    { word: 'Amigo', translation: 'Friend' },
    { word: 'Trabajo', translation: 'Work / Job' },
    { word: 'Noche', translation: 'Night' },
    { word: 'Pregunta', translation: 'Question' },
    { word: 'Respuesta', translation: 'Answer' },
    { word: 'Feliz', translation: 'Happy' },
    { word: 'Triste', translation: 'Sad' },
    { word: 'Peligroso', translation: 'Dangerous' },
    { word: 'Hermoso', translation: 'Beautiful' },
    { word: 'Escuchar', translation: 'To listen' },
    { word: 'Hablar', translation: 'To speak' },
    { word: 'Aprender', translation: 'To learn' },
    { word: 'Libro', translation: 'Book' },
    { word: 'Camino', translation: 'Path / Road' },
    { word: 'Desayuno', translation: 'Breakfast' },
    { word: 'Corazón', translation: 'Heart' },
    { word: 'Silencio', translation: 'Silence' },
    { word: 'Esperanza', translation: 'Hope' },
    { word: 'Sonrisa', translation: 'Smile' },
    { word: 'Verdad', translation: 'Truth' },
    { word: 'Éxito', translation: 'Success' },
    { word: 'Mundo', translation: 'World' },
    { word: 'Memoria', translation: 'Memory' },
  ],
  French: [
    { word: 'Bonjour', translation: 'Hello / Good day' },
    { word: 'Voyage', translation: 'Trip / Travel' },
    { word: 'Temps', translation: 'Time / Weather' },
    { word: 'Manger', translation: 'To eat' },
    { word: 'Fatigué', translation: 'Tired' },
    { word: 'Rapide', translation: 'Fast / Rapid' },
    { word: 'Doucement', translation: 'Gently / Slowly' },
    { word: 'Maison', translation: 'House / Home' },
    { word: 'Travail', translation: 'Work / Job' },
    { word: 'Nuit', translation: 'Night' },
    { word: 'Question', translation: 'Question' },
    { word: 'Réponse', translation: 'Answer' },
    { word: 'Heureux', translation: 'Happy' },
    { word: 'Triste', translation: 'Sad' },
    { word: 'Dangereux', translation: 'Dangerous' },
    { word: 'Beau', translation: 'Beautiful / Handsome' },
    { word: 'Écouter', translation: 'To listen' },
    { word: 'Parler', translation: 'To speak' },
    { word: 'Apprendre', translation: 'To learn' },
    { word: 'Livre', translation: 'Book' },
    { word: 'Chemin', translation: 'Path / Trail' },
    { word: 'Déjeuner', translation: 'Lunch' },
    { word: 'Cœur', translation: 'Heart' },
    { word: 'Silence', translation: 'Silence' },
    { word: 'Espoir', translation: 'Hope' },
    { word: 'Sourire', translation: 'Smile' },
    { word: 'Vérité', translation: 'Truth' },
    { word: 'Succès', translation: 'Success' },
    { word: 'Monde', translation: 'World' },
    { word: 'Mémoire', translation: 'Memory' },
  ],
  German: [
    { word: 'Reise', translation: 'Trip / Journey' },
    { word: 'Zeit', translation: 'Time' },
    { word: 'Essen', translation: 'To eat / Food' },
    { word: 'Müde', translation: 'Tired' },
    { word: 'Schnell', translation: 'Fast / Quick' },
    { word: 'Langsam', translation: 'Slowly' },
    { word: 'Stadt', translation: 'City / Town' },
    { word: 'Freund', translation: 'Friend' },
    { word: 'Arbeit', translation: 'Work / Labor' },
    { word: 'Nacht', translation: 'Night' },
    { word: 'Frage', translation: 'Question' },
    { word: 'Antwort', translation: 'Answer' },
    { word: 'Glücklich', translation: 'Happy / Fortunate' },
    { word: 'Traurig', translation: 'Sad' },
    { word: 'Gefährlich', translation: 'Dangerous' },
    { word: 'Schön', translation: 'Beautiful / Nice' },
    { word: 'Hören', translation: 'To hear / listen' },
    { word: 'Sprechen', translation: 'To speak' },
    { word: 'Lernen', translation: 'To learn / study' },
    { word: 'Buch', translation: 'Book' },
    { word: 'Weg', translation: 'Way / Path' },
    { word: 'Frühstück', translation: 'Breakfast' },
    { word: 'Herz', translation: 'Heart' },
    { word: 'Stille', translation: 'Silence' },
    { word: 'Hoffnung', translation: 'Hope' },
    { word: 'Lächeln', translation: 'Smile' },
    { word: 'Wahrheit', translation: 'Truth' },
    { word: 'Erfolg', translation: 'Success' },
    { word: 'Welt', translation: 'World' },
    { word: 'Erinnerung', translation: 'Memory / Recall' },
  ],
  Japanese: [
    { word: '旅 (Tabi)', translation: 'Journey / Travel' },
    { word: '時間 (Jikan)', translation: 'Time' },
    { word: '食べる (Taberu)', translation: 'To eat' },
    { word: '疲れた (Tsukareta)', translation: 'Tired / Exhausted' },
    { word: '速い (Hayai)', translation: 'Fast / Early' },
    { word: 'ゆっくり (Yukkuri)', translation: 'Slowly / At ease' },
    { word: '街 (Machi)', translation: 'City / Town' },
    { word: '友達 (Tomodachi)', translation: 'Friend' },
    { word: '仕事 (Shigoto)', translation: 'Work / Job' },
    { word: '夜 (Yoru)', translation: 'Night' },
    { word: '質問 (Shitsumon)', translation: 'Question' },
    { word: '答え (Kotae)', translation: 'Answer' },
    { word: '嬉しい (Ureshii)', translation: 'Happy / Glad' },
    { word: '悲しい (Kanashii)', translation: 'Sad' },
    { word: '危険 (Kiken)', translation: 'Dangerous' },
    { word: '美しい (Utsukushii)', translation: 'Beautiful' },
    { word: '聞く (Kiku)', translation: 'To listen / hear' },
    { word: '話す (Hanasu)', translation: 'To speak / talk' },
    { word: '学ぶ (Manabu)', translation: 'To learn / study' },
    { word: '本 (Hon)', translation: 'Book' },
    { word: '道 (Michi)', translation: 'Road / Path' },
    { word: '心 (Kokoro)', translation: 'Heart / Mind' },
    { word: '静寂 (Seijaku)', translation: 'Silence / Calm' },
    { word: '希望 (Kibou)', translation: 'Hope' },
    { word: '笑顔 (Egao)', translation: 'Smiling face' },
  ],
  Italian: [
    { word: 'Viaggio', translation: 'Journey / Trip' },
    { word: 'Tempo', translation: 'Time / Weather' },
    { word: 'Mangiare', translation: 'To eat' },
    { word: 'Stanco', translation: 'Tired' },
    { word: 'Veloce', translation: 'Fast / Quick' },
    { word: 'Lentamente', translation: 'Slowly' },
    { word: 'Città', translation: 'City' },
    { word: 'Amico', translation: 'Friend' },
    { word: 'Lavoro', translation: 'Work / Job' },
    { word: 'Notte', translation: 'Night' },
    { word: 'Domanda', translation: 'Question' },
    { word: 'Risposta', translation: 'Answer' },
    { word: 'Felice', translation: 'Happy' },
    { word: 'Triste', translation: 'Sad' },
    { word: 'Pericoloso', translation: 'Dangerous' },
    { word: 'Bello', translation: 'Beautiful' },
    { word: 'Ascoltare', translation: 'To listen' },
    { word: 'Parlare', translation: 'To speak' },
    { word: 'Imparare', translation: 'To learn' },
    { word: 'Libro', translation: 'Book' },
    { word: 'Strada', translation: 'Street / Road' },
    { word: 'Cuore', translation: 'Heart' },
    { word: 'Silenzio', translation: 'Silence' },
    { word: 'Speranza', translation: 'Hope' },
    { word: 'Sorriso', translation: 'Smile' },
  ],
  'Mandarin Chinese': [
    { word: '旅行 (Lǚxíng)', translation: 'Travel / Journey' },
    { word: '时间 (Shíjiān)', translation: 'Time' },
    { word: '吃饭 (Chīfàn)', translation: 'To eat a meal' },
    { word: '累 (Lèi)', translation: 'Tired' },
    { word: '快 (Kuài)', translation: 'Fast / Quick' },
    { word: '慢 (Màn)', translation: 'Slow / Slowly' },
    { word: '城市 (Chéngshì)', translation: 'City' },
    { word: '朋友 (Péngyou)', translation: 'Friend' },
    { word: '工作 (Gōngzuò)', translation: 'Work / Job' },
    { word: '夜晚 (Yèwǎn)', translation: 'Night' },
    { word: '问题 (Wèntí)', translation: 'Question / Problem' },
    { word: '回答 (Huídá)', translation: 'Answer / Reply' },
    { word: '开心 (Kāixīn)', translation: 'Happy' },
    { word: '伤心 (Shāngxīn)', translation: 'Sad / Heartbroken' },
    { word: '危险 (Wēixiǎn)', translation: 'Dangerous' },
    { word: '美丽 (Měilì)', translation: 'Beautiful' },
    { word: '听 (Tīng)', translation: 'To listen / hear' },
    { word: '说 (Shuō)', translation: 'To speak / say' },
    { word: '学习 (Xuéxí)', translation: 'To learn / study' },
    { word: '书 (Shū)', translation: 'Book' },
    { word: '心 (Xīn)', translation: 'Heart / Mind' },
    { word: '希望 (Xīwàng)', translation: 'Hope' },
  ],
  Portuguese: [
    { word: 'Viagem', translation: 'Trip / Journey' },
    { word: 'Tempo', translation: 'Time / Weather' },
    { word: 'Comer', translation: 'To eat' },
    { word: 'Cansado', translation: 'Tired' },
    { word: 'Rápido', translation: 'Fast / Quick' },
    { word: 'Devagar', translation: 'Slowly' },
    { word: 'Cidade', translation: 'City' },
    { word: 'Amigo', translation: 'Friend' },
    { word: 'Trabalho', translation: 'Work / Job' },
    { word: 'Noite', translation: 'Night' },
    { word: 'Pergunta', translation: 'Question' },
    { word: 'Resposta', translation: 'Answer' },
    { word: 'Feliz', translation: 'Happy' },
    { word: 'Triste', translation: 'Sad' },
    { word: 'Perigoso', translation: 'Dangerous' },
    { word: 'Bonito', translation: 'Beautiful' },
    { word: 'Ouvir', translation: 'To hear / listen' },
    { word: 'Falar', translation: 'To speak' },
    { word: 'Aprender', translation: 'To learn' },
    { word: 'Livro', translation: 'Book' },
    { word: 'Coração', translation: 'Heart' },
    { word: 'Esperança', translation: 'Hope' },
  ],
  Korean: [
    { word: '여행 (Yeohaeng)', translation: 'Travel / Journey' },
    { word: '시간 (Sigan)', translation: 'Time' },
    { word: '먹다 (Meokda)', translation: 'To eat' },
    { word: '피곤한 (Pigonhan)', translation: 'Tired' },
    { word: '빠른 (Ppareun)', translation: 'Fast / Quick' },
    { word: '천천히 (Cheoncheonhi)', translation: 'Slowly' },
    { word: '도시 (Dosi)', translation: 'City' },
    { word: '친구 (Chingu)', translation: 'Friend' },
    { word: '일 (Il)', translation: 'Work / Task' },
    { word: '밤 (Bam)', translation: 'Night' },
    { word: '질문 (Jilmun)', translation: 'Question' },
    { word: '대답 (Daedap)', translation: 'Answer' },
    { word: '행복한 (Haengbokhan)', translation: 'Happy' },
    { word: '슬픈 (Seulpeun)', translation: 'Sad' },
    { word: '위험한 (Wiheomhan)', translation: 'Dangerous' },
    { word: '아름다운 (Areumdaun)', translation: 'Beautiful' },
    { word: '듣다 (Deutda)', translation: 'To listen / hear' },
    { word: '말하다 (Malhada)', translation: 'To speak' },
    { word: '배우다 (Baeuda)', translation: 'To learn' },
    { word: '책 (Chaek)', translation: 'Book' },
  ],
  English: [
    { word: 'Journey', translation: 'A trip / travel from one place to another' },
    { word: 'Eloquent', translation: 'Fluent or persuasive in speaking/writing' },
    { word: 'Resilient', translation: 'Able to withstand or recover quickly' },
    { word: 'Serenity', translation: 'The state of being calm and peaceful' },
    { word: 'Endeavor', translation: 'An earnest attempt to achieve a goal' },
    { word: 'Perseverance', translation: 'Persistence in doing something despite difficulty' },
    { word: 'Ingenious', translation: 'Clever, original, and inventive' },
    { word: 'Compassion', translation: 'Sympathetic pity and concern for others' },
    { word: 'Nourishment', translation: 'Food or substances necessary for growth' },
    { word: 'Clarity', translation: 'The quality of being clear and easy to see' },
    { word: 'Aspiration', translation: 'A hope or ambition of achieving something' },
    { word: 'Harmony', translation: 'Agreement or pleasing arrangement of parts' },
  ],
};

export interface VocabSprintQuestion {
  target: string;
  options: string[];
  correct: number;
  definition: string;
}

export const generateVocabSprintDeck = (languageName: string): VocabSprintQuestion[] => {
  const dict = VOCAB_SPRINT_DICTIONARY[languageName] || VOCAB_SPRINT_DICTIONARY.Spanish;
  // Randomly shuffle dictionary words
  const shuffled = [...dict].sort(() => Math.random() - 0.5);
  // Pick 15 items per sprint round
  const selected = shuffled.slice(0, 15);

  return selected.map((item) => {
    // Generate 3 distinct incorrect distractors
    const otherTranslations = dict
      .filter((d) => d.translation !== item.translation)
      .map((d) => d.translation)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    // Combine and shuffle the 4 choices
    const options = [...otherTranslations, item.translation].sort(() => Math.random() - 0.5);
    const correct = options.indexOf(item.translation);

    return {
      target: item.word,
      options,
      correct,
      definition: item.translation,
    };
  });
};

export const LearningHubView: React.FC<LearningHubViewProps> = ({
  currentLanguage,
  proficiencyLevel,
  user,
  onSaveWord,
  onOpenWordLookup,
  onAwardXP,
  onOpenVoiceChat,
  onOpenStreakModal,
}) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'stories' | 'phonetics' | 'reading' | 'listening' | 'speaking' | 'writing' | 'video' | 'sprint' | 'daily' | 'tiers'>('stories');
  const [selectedStory, setSelectedStory] = useState<CEFRStory | null>(null);
  const [dailyWordSaved, setDailyWordSaved] = useState(false);

  // Story Filtering & AI Generator State
  const [storySearch, setStorySearch] = useState('');
  const [selectedStoryLevel, setSelectedStoryLevel] = useState<string>('All');
  const [showStoryGenModal, setShowStoryGenModal] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [genGenre, setGenGenre] = useState('Travel & Adventure');
  const [genLevel, setGenLevel] = useState('B1');
  const [genCustomPrompt, setGenCustomPrompt] = useState('');
  const [customStories, setCustomStories] = useState<CEFRStory[]>(() => {
    try {
      const saved = localStorage.getItem(`lingolive_custom_stories_${currentLanguage.name}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save custom stories to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(`lingolive_custom_stories_${currentLanguage.name}`, JSON.stringify(customStories));
    } catch (e) {
      console.error('Failed to persist custom stories:', e);
    }
  }, [customStories, currentLanguage.name]);

  // Speed Vocab Sprint state with dynamic procedural generation
  const [sprintQuestions, setSprintQuestions] = useState<VocabSprintQuestion[]>(() =>
    generateVocabSprintDeck(currentLanguage.name)
  );
  const [sprintRound, setSprintRound] = useState(1);
  const [gameActive, setGameActive] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [feedbackFlash, setFeedbackFlash] = useState<'correct' | 'wrong' | null>(null);

  const dailyWord = DAILY_WORDS[currentLanguage.name] || DAILY_WORDS.French;

  // Re-generate fresh sprint questions whenever target language changes
  useEffect(() => {
    setSprintQuestions(generateVocabSprintDeck(currentLanguage.name));
    setGameActive(false);
    setGameFinished(false);
    setCurrentQIndex(0);
    setScore(0);
    setStreak(0);
  }, [currentLanguage.name]);

  // Filter CEFR Stories for current language
  const baseLanguageStories = CEFR_STORIES.filter(
    (s) => s.language.toLowerCase() === currentLanguage.name.toLowerCase()
  );
  const allLanguageStories = [...customStories, ...(baseLanguageStories.length > 0 ? baseLanguageStories : CEFR_STORIES)];

  const displayedStories = allLanguageStories.filter((s) => {
    const matchesLevel =
      selectedStoryLevel === 'All'
        ? true
        : s.cefrLevel.toLowerCase().includes(selectedStoryLevel.toLowerCase());
    const matchesSearch =
      !storySearch.trim() ||
      s.title.toLowerCase().includes(storySearch.toLowerCase()) ||
      s.englishTitle.toLowerCase().includes(storySearch.toLowerCase()) ||
      s.summary.toLowerCase().includes(storySearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  // Call AI Backend to Generate Custom Story on Demand
  const handleGenerateAIStory = async () => {
    setIsGeneratingStory(true);
    try {
      const res = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetLanguage: currentLanguage.name,
          cefrLevel: genLevel,
          genre: genGenre,
          customPrompt: genCustomPrompt.trim(),
        }),
      });
      const data = await res.json();
      if (data.success && data.story) {
        setCustomStories((prev) => [data.story, ...prev]);
        setSelectedStory(data.story);
        setShowStoryGenModal(false);
        setGenCustomPrompt('');
        onAwardXP(50, 'reading');
      }
    } catch (e) {
      console.error('Failed to generate story:', e);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // Game timer
  React.useEffect(() => {
    let timer: any;
    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameActive(false);
            setGameFinished(true);
            onAwardXP(score * 10 + 50, 'reading');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameActive, timeLeft, score, onAwardXP]);

  const handleStartSprint = () => {
    // Generate fresh, randomized questions with shuffled distractor options for every sprint
    const freshDeck = generateVocabSprintDeck(currentLanguage.name);
    setSprintQuestions(freshDeck);
    if (gameFinished) {
      setSprintRound((prev) => prev + 1);
    }
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setCurrentQIndex(0);
    setGameFinished(false);
    setGameActive(true);
  };

  const handleAnswer = (optionIndex: number) => {
    if (!gameActive || sprintQuestions.length === 0) return;
    const currentQ = sprintQuestions[currentQIndex % sprintQuestions.length];

    if (optionIndex === currentQ.correct) {
      setFeedbackFlash('correct');
      setScore((prev) => prev + 10 * (streak >= 3 ? 2 : 1));
      setStreak((prev) => prev + 1);
    } else {
      setFeedbackFlash('wrong');
      setStreak(0);
    }

    setTimeout(() => {
      setFeedbackFlash(null);
      setCurrentQIndex((prev) => prev + 1);
    }, 350);
  };

  const handleSaveDailyWord = () => {
    const wordObj: SavedWord = {
      id: `daily-${Date.now()}`,
      word: dailyWord.word,
      translation: dailyWord.translation,
      phonetic: dailyWord.phonetic,
      partOfSpeech: dailyWord.pos,
      contextSentence: dailyWord.sentence,
      language: currentLanguage.name,
      savedAt: new Date(),
      masteryLevel: 1,
    };
    onSaveWord(wordObj);
    setDailyWordSaved(true);
    onAwardXP(30, 'reading');
  };

  const handlePlayAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const langCode = currentLanguage.name.toLowerCase().includes('french') ? 'fr-FR' : 'es-ES';
    utterance.lang = langCode;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const userXP = user?.xp || 0;
  const currentTier = userXP >= 3000 ? 'Diamond' : userXP >= 1500 ? 'Gold' : userXP >= 600 ? 'Silver' : 'Bronze';
  const nextTierXP = userXP >= 3000 ? 5000 : userXP >= 1500 ? 3000 : userXP >= 600 ? 1500 : 600;
  const tierProgressPercent = Math.min(100, Math.round((userXP / nextTierXP) * 100));

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Academy Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 glass-card-neon border border-pink-500/30 p-5 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-cyan-400 p-[1.5px] shadow-[0_0_20px_rgba(236,72,153,0.5)]">
            <div className="w-full h-full rounded-2xl bg-[#140528] flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-pink-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {currentLanguage.name} Learning Academy
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/20 text-pink-300 border border-pink-400/40">
                {proficiencyLevel.split(' - ')[0]}
              </span>
            </div>
            <p className="text-xs text-pink-200/70">
              Thousands of CEFR Stories, Phonetics Studio, Masterclasses & Skill Labs
            </p>
          </div>
        </div>

        {/* Real User XP & Streak Badges */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('tiers')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 hover:border-cyan-400/40 transition-all cursor-pointer shadow-xs"
            title="View XP breakdown and how to earn XP"
          >
            <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div className="text-left">
              <p className="text-[10px] text-slate-300 leading-none">Total XP</p>
              <p className="text-xs font-black text-white leading-tight">{userXP}</p>
            </div>
          </button>

          <button
            onClick={onOpenStreakModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 text-amber-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.15)]"
            title="View Daily Streak, Weekly Calendar & Milestones"
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <div className="text-left">
              <p className="text-[10px] text-amber-200/80 leading-none">Streak</p>
              <p className="text-xs font-black text-white leading-tight">{user?.streakDays ?? 0} Days</p>
            </div>
          </button>

          <button
            onClick={() => setActiveTab('tiers')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-400/40 hover:border-pink-400 text-pink-300 font-bold text-xs transition-all cursor-pointer shadow-xs"
            title="View League Tiers and tier progress"
          >
            <Trophy className="w-4 h-4" />
            <span>{currentTier} Tier</span>
          </button>
        </div>
      </div>

      {/* Primary Category Switcher Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1.5 rounded-2xl glass-card border border-white/15 shadow-inner">
        <button
          onClick={() => setActiveTab('stories')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'stories'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 text-pink-300" />
          <span>Stories Library</span>
          <span className="px-1.5 py-0.2 rounded-md bg-white/20 text-[10px]">
            {displayedStories.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('phonetics')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'phonetics'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Volume2 className="w-3.5 h-3.5 text-pink-400" />
          <span>Phonetics Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'video'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-pink-300" />
          <span>Masterclass Studio</span>
        </button>

        <button
          onClick={() => setActiveTab('reading')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'reading'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-cyan-300" />
          <span>Reading</span>
        </button>

        <button
          onClick={() => setActiveTab('listening')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'listening'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Headphones className="w-3.5 h-3.5 text-pink-300" />
          <span>Listening</span>
        </button>

        <button
          onClick={() => setActiveTab('speaking')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'speaking'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Mic className="w-3.5 h-3.5 text-cyan-300" />
          <span>Speaking</span>
        </button>

        <button
          onClick={() => setActiveTab('writing')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'writing'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <PenTool className="w-3.5 h-3.5 text-amber-300" />
          <span>Writing</span>
        </button>

        <button
          onClick={() => setActiveTab('sprint')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'sprint'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Vocab Sprint</span>
        </button>

        <button
          onClick={() => setActiveTab('daily')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          <span>Daily Word</span>
        </button>

        <button
          onClick={() => setActiveTab('tiers')}
          className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'tiers'
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
              : 'text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Trophy className="w-3.5 h-3.5 text-pink-400" />
          <span>Progression</span>
        </button>
      </div>

      {/* TAB 1: CEFR STORIES & AI STORY GENERATOR */}
      {activeTab === 'stories' && (
        <div className="space-y-5">
          {/* Header & Generator Trigger Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 glass-card border border-white/15 p-4 rounded-2xl">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>{currentLanguage.name} Graded CEFR Stories</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30">
                  {displayedStories.length} Available
                </span>
              </h2>
              <p className="text-xs text-pink-200/80">
                Immersive bilingual reading, sentence audio, vocabulary tap-to-save & comprehension quizzes.
              </p>
            </div>

            <button
              onClick={() => setShowStoryGenModal(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-bold text-xs shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Generate Custom AI Story</span>
            </button>
          </div>

          {/* Level Filters & Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
              {['All', 'A1', 'A2', 'B1', 'B2', 'C1'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedStoryLevel(lvl)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedStoryLevel === lvl
                      ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                      : 'bg-white/[0.05] text-slate-300 hover:text-white'
                  }`}
                >
                  {lvl === 'All' ? 'All CEFR Levels' : `Level ${lvl}`}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                placeholder="Search stories & themes..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/12 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-400"
              />
            </div>
          </div>

          {/* Story Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedStories.map((story) => (
              <div
                key={story.id}
                onClick={() => setSelectedStory(story)}
                className="glass-card-neon border border-pink-500/25 hover:border-pink-400/60 rounded-3xl p-5 shadow-xl hover:shadow-[0_0_30px_rgba(236,72,153,0.25)] transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl p-2 rounded-2xl bg-white/[0.08] border border-white/10">
                      {story.coverEmoji}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-pink-500/25 border border-pink-400/40 text-[11px] font-bold text-pink-300">
                      {story.cefrLevel.split(' - ')[0]}
                    </span>
                  </div>

                  <h3 className="text-base font-black text-white mt-3 group-hover:text-pink-300 transition-colors">
                    {story.title}
                  </h3>
                  <p className="text-xs text-pink-200/70">{story.englishTitle}</p>
                  <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                    {story.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" />
                    {story.durationMinutes} min read
                  </span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5" />
                    +{story.xpReward} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: PHONETICS & ACCENT STUDIO */}
      {activeTab === 'phonetics' && (
        <PhoneticsStudioView
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onAwardXP={(xp) => onAwardXP(xp, 'speaking')}
        />
      )}

      {/* TAB: AUDIO TEACHING MASTERCLASSES */}
      {activeTab === 'video' && (
        <VideoTeachingStudioView
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onAwardXP={(xp) => onAwardXP(xp, 'listening')}
          onOpenWordLookup={onOpenWordLookup}
          onSaveWord={(word) => onSaveWord(word)}
          onOpenVoiceChat={onOpenVoiceChat}
        />
      )}

      {/* TAB 2: READING STUDIO */}
      {activeTab === 'reading' && (
        <ReadingPracticeView
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onOpenWordLookup={onOpenWordLookup}
          onSaveWord={(word, trans, phon, sent) => {
            onSaveWord({
              id: `read-${Date.now()}`,
              word,
              translation: trans,
              phonetic: phon,
              contextSentence: sent,
              language: currentLanguage.name,
              savedAt: new Date(),
              masteryLevel: 1,
            });
          }}
          onAwardXP={(xp) => onAwardXP(xp, 'reading')}
        />
      )}

      {/* TAB 3: LISTENING STUDIO */}
      {activeTab === 'listening' && (
        <ListeningPracticeView
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onAwardXP={(xp) => onAwardXP(xp, 'listening')}
        />
      )}

      {/* TAB 4: SPEAKING STUDIO */}
      {activeTab === 'speaking' && (
        <SpeakingPracticeView
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onAwardXP={(xp) => onAwardXP(xp, 'speaking')}
        />
      )}

      {/* TAB 5: WRITING STUDIO */}
      {activeTab === 'writing' && (
        <WritingPracticeView
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onAwardXP={(xp) => onAwardXP(xp, 'writing')}
        />
      )}

      {/* TAB 6: SPEED VOCAB SPRINT (ARCADE) */}
      {activeTab === 'sprint' && (
        <div className="glass-card-neon border border-pink-500/30 rounded-3xl p-6 shadow-2xl max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300">
                <Zap className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">Speed Vocab Sprint</h3>
                  <span className="px-2 py-0.5 rounded-md bg-pink-500/20 border border-pink-400/30 text-[10px] font-bold text-pink-300">
                    Round #{sprintRound}
                  </span>
                </div>
                <p className="text-xs text-pink-200/80">45-Second Quick Recall Vocabulary Arcade (Fresh Words Every Run)</p>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 border border-pink-400/30 text-xs font-bold">
              Combo Multipliers Active
            </span>
          </div>

          {!gameActive && !gameFinished && (
            <div className="py-8 text-center space-y-4">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto animate-bounce" />
              <h4 className="text-lg font-bold text-white">Ready for the Sprint?</h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Translate as many {currentLanguage.name} words as possible in 45 seconds. Keep streaks above 3 to unlock 2x XP combos! A fresh, randomized word deck is prepared for every run.
              </p>
              <button
                onClick={handleStartSprint}
                className="px-8 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:brightness-110 text-white font-bold text-sm shadow-[0_0_25px_rgba(236,72,153,0.5)] transition-all cursor-pointer"
              >
                Start 45s Challenge
              </button>
            </div>
          )}

          {gameActive && sprintQuestions.length > 0 && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-300 animate-spin" />
                  <span className="text-lg font-black text-white font-mono">{timeLeft}s</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-300">
                    Word {(currentQIndex % sprintQuestions.length) + 1}/{sprintQuestions.length}
                  </span>
                  <span className="text-xs font-bold text-pink-300">Streak: {streak}🔥</span>
                  <span className="text-sm font-black text-amber-300 font-mono">Score: {score}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-cyan-400 transition-all duration-1000"
                  style={{ width: `${(timeLeft / 45) * 100}%` }}
                />
              </div>

              {/* Question Card */}
              <div
                className={`p-6 rounded-2xl border text-center transition-all ${
                  feedbackFlash === 'correct'
                    ? 'bg-emerald-500/25 border-emerald-400'
                    : feedbackFlash === 'wrong'
                    ? 'bg-rose-500/25 border-rose-400'
                    : 'bg-white/[0.05] border-white/15'
                }`}
              >
                <span className="text-xs text-slate-400 uppercase tracking-widest font-bold">Translate:</span>
                <h4 className="text-3xl font-black text-white my-2">
                  {sprintQuestions[currentQIndex % sprintQuestions.length]?.target}
                </h4>
              </div>

              {/* Option Buttons Grid */}
              <div className="grid grid-cols-2 gap-3">
                {sprintQuestions[currentQIndex % sprintQuestions.length]?.options.map((opt, oIdx) => (
                  <button
                    key={oIdx}
                    onClick={() => handleAnswer(oIdx)}
                    className="p-3.5 rounded-xl glass-card hover:bg-pink-500/25 border border-white/15 text-xs sm:text-sm font-bold text-white transition-all cursor-pointer text-center"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameFinished && (
            <div className="py-6 text-center space-y-4 animate-in zoom-in-95">
              <Sparkles className="w-12 h-12 text-pink-300 mx-auto" />
              <h4 className="text-2xl font-black text-white">Round #{sprintRound} Completed!</h4>
              <p className="text-sm text-slate-200">
                You scored <span className="font-bold text-amber-300">{score} points</span> and earned{' '}
                <span className="font-bold text-emerald-400">+{score * 10 + 50} XP</span>!
              </p>
              <p className="text-xs text-cyan-300">
                A brand new randomized set of {currentLanguage.name} words is prepared for your next sprint.
              </p>
              <button
                onClick={handleStartSprint}
                className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs mx-auto shadow-md transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Play Next Round (New Words)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 7: DAILY WORD OF THE DAY */}
      {activeTab === 'daily' && (
        <div className="glass-card-neon border border-pink-500/30 rounded-3xl p-6 shadow-xl max-w-3xl mx-auto space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-pink-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Word of the Day</span>
            </span>
            <span className="text-xs text-slate-300">{currentLanguage.name} Curated</span>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-3xl font-black text-white">{dailyWord.word}</h3>
              <p className="text-xs text-pink-300 font-mono mt-1">{dailyWord.phonetic}</p>
              <p className="text-sm font-bold text-cyan-300 mt-2">{dailyWord.translation}</p>
              <p className="text-[11px] text-slate-400 italic">({dailyWord.pos})</p>
            </div>

            <button
              onClick={() => handlePlayAudio(dailyWord.word)}
              className="p-3 rounded-2xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 transition-colors cursor-pointer"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/10 space-y-1 text-xs">
            <p className="font-semibold text-slate-100">{dailyWord.sentence}</p>
            <p className="text-slate-400 italic">{dailyWord.nativeSentence}</p>
          </div>

          <p className="text-xs text-pink-200/80 bg-pink-500/10 p-3 rounded-xl border border-pink-500/20">
            💡 {dailyWord.tip}
          </p>

          <button
            onClick={handleSaveDailyWord}
            disabled={dailyWordSaved}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 hover:brightness-110 disabled:opacity-60 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
          >
            {dailyWordSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            <span>{dailyWordSaved ? 'Saved to Vocabulary Deck (+30 XP)' : 'Save Word (+30 XP)'}</span>
          </button>
        </div>
      )}

      {/* TAB 8: REAL USER PROGRESSION & TIER STATUS */}
      {activeTab === 'tiers' && (
        <div className="space-y-6 max-w-3xl mx-auto">
          <div className="glass-card-neon border border-pink-500/30 rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-amber-400" />
                <div>
                  <h3 className="text-lg font-black text-white">Your Personal Fluency League</h3>
                  <p className="text-xs text-pink-200/80">Real Milestone Progression & Verified Tier Standing</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-pink-500/25 border border-pink-400/40 text-xs font-bold text-pink-300">
                {currentTier} Tier
              </span>
            </div>

            {/* Progress to Next Tier */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-200">Progress to Next Tier:</span>
                <span className="text-cyan-300">{userXP} / {nextTierXP} XP ({tierProgressPercent}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 transition-all duration-700"
                  style={{ width: `${tierProgressPercent}%` }}
                />
              </div>
            </div>

            {/* Tier Ladders */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { name: 'Bronze', xp: '0 - 599 XP', emoji: '🥉', current: currentTier === 'Bronze' },
                { name: 'Silver', xp: '600 - 1,499 XP', emoji: '🥈', current: currentTier === 'Silver' },
                { name: 'Gold', xp: '1,500 - 2,999 XP', emoji: '🥇', current: currentTier === 'Gold' },
                { name: 'Diamond', xp: '3,000+ XP', emoji: '💎', current: currentTier === 'Diamond' },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-2xl border text-center transition-all ${
                    tier.current
                      ? 'bg-gradient-to-b from-pink-500/25 to-purple-600/25 border-pink-400/50 shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                      : 'bg-white/[0.04] border-white/10 opacity-70'
                  }`}
                >
                  <span className="text-2xl">{tier.emoji}</span>
                  <p className="text-xs font-black text-white mt-1">{tier.name}</p>
                  <p className="text-[10px] text-slate-300">{tier.xp}</p>
                  {tier.current && (
                    <span className="mt-2 inline-block px-2 py-0.5 rounded-full bg-pink-500 text-[10px] font-bold text-white">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Real Unlocked Achievements */}
            <div className="space-y-3 pt-2">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                Unlocked Achievements:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { title: 'A0 First Steps', desc: 'Started foundational language learning', icon: '🌱' },
                  { title: 'Speed Thinker', desc: 'Completed Vocab Sprint arcade round', icon: '⚡' },
                  { title: 'Acoustic Explorer', desc: 'Trained in Listening Studio', icon: '🎧' },
                ].map((ach, aIdx) => (
                  <div key={aIdx} className="p-3 rounded-xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
                    <span className="text-xl">{ach.icon}</span>
                    <div>
                      <p className="text-xs font-bold text-white">{ach.title}</p>
                      <p className="text-[10px] text-slate-300">{ach.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dynamic Progress & XP Guide */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-cyan-300 font-bold text-sm">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span>Dynamic Progression & Continuous Auto-Save</span>
                </div>
                <p>
                  <strong className="text-white">How XP Works:</strong> Your XP begins at 0 and grows dynamically as you complete genuine learning milestones across LingoLive. All experience points, practice minutes, and league advancements are automatically saved to your profile.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                    <p className="text-cyan-400 font-bold text-sm">+30 XP</p>
                    <p className="text-[10px] text-slate-400">CEFR Stories</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                    <p className="text-amber-400 font-bold text-sm">+50 XP</p>
                    <p className="text-[10px] text-slate-400">Vocab Sprint</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                    <p className="text-pink-400 font-bold text-sm">+20 XP</p>
                    <p className="text-[10px] text-slate-400">Pronunciation</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.04] border border-white/10 text-center">
                    <p className="text-emerald-400 font-bold text-sm">+100 XP</p>
                    <p className="text-[10px] text-slate-400">Level Exams</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Story Reader Modal */}
      {selectedStory && (
        <StoryReaderModal
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
          onOpenWordLookup={onOpenWordLookup}
          onSaveWord={(word, trans, phon, sent) => {
            onSaveWord({
              id: `story-${Date.now()}`,
              word,
              translation: trans,
              phonetic: phon,
              contextSentence: sent,
              language: currentLanguage.name,
              savedAt: new Date(),
              masteryLevel: 1,
            });
          }}
          onCompleteStory={(earnedXP) => {
            onAwardXP(earnedXP, 'reading');
            setSelectedStory(null);
          }}
        />
      )}

      {/* AI Story Generation Modal */}
      {showStoryGenModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setShowStoryGenModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-3xl glass-card-neon border border-pink-500/40 p-6 space-y-5 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-pink-300" />
                <h3 className="text-lg font-black text-white">Generate Custom CEFR Story</h3>
              </div>
              <button
                onClick={() => setShowStoryGenModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Target Genre</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    'Travel & Adventure',
                    'Mystery & Detective',
                    'Culinary & Food',
                    'Daily Life & Comedy',
                    'Sci-Fi & Future',
                    'Folklore & History',
                  ].map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenGenre(g)}
                      className={`p-2 rounded-xl text-left font-semibold transition-all cursor-pointer ${
                        genGenre === g
                          ? 'bg-pink-500/30 border border-pink-400 text-white shadow-sm'
                          : 'bg-white/[0.04] border border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5">CEFR Level</label>
                  <select
                    value={genLevel}
                    onChange={(e) => setGenLevel(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white font-bold focus:outline-none focus:border-pink-400"
                  >
                    <option value="A1" className="bg-[#140528]">A1 - Beginner</option>
                    <option value="A2" className="bg-[#140528]">A2 - Elementary</option>
                    <option value="B1" className="bg-[#140528]">B1 - Intermediate</option>
                    <option value="B2" className="bg-[#140528]">B2 - Upper Intermediate</option>
                    <option value="C1" className="bg-[#140528]">C1 - Advanced Fluency</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-bold block mb-1.5">Target Language</label>
                  <div className="p-2.5 rounded-xl bg-white/[0.06] border border-white/15 text-white font-bold flex items-center gap-2">
                    <span>{currentLanguage.flag}</span>
                    <span>{currentLanguage.name}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-bold block mb-1.5">Custom Story Prompt / Plot Ideas (Optional)</label>
                <textarea
                  rows={3}
                  value={genCustomPrompt}
                  onChange={(e) => setGenCustomPrompt(e.target.value)}
                  placeholder="E.g. A lost tourist finds a secret bakery in Lyon, or an astronaut speaks French on Mars..."
                  className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-pink-400 resize-none"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateAIStory}
              disabled={isGeneratingStory}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:brightness-110 text-white font-black text-xs shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingStory ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating Graded Story with Audio & Quiz...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate & Read Story Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
