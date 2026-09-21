export type ProficiencyLevel =
  | 'A0 - Absolute Beginner (Zero Knowledge)'
  | 'A1 - Beginner'
  | 'A2 - Elementary'
  | 'B1 - Intermediate'
  | 'B2 - Upper Intermediate'
  | 'C1 - Advanced'
  | 'C1 - Fluent Mastery';

export interface BeginnerPhrase {
  id: string;
  category: 'Greetings' | 'Essentials' | 'Introductions' | 'Survival' | 'Numbers';
  targetText: string;
  phonetic: string;
  translation: string;
  literalBreakdown?: string;
  audioVoice?: string;
}

export interface LanguageOption {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  speechCode: string;
  defaultVoice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  defaultPartner: string;
  description: string;
  samplePhrase: string;
  sampleTranslation: string;
}

export interface PartnerPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  personality: string;
  voice: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  accent: string;
  description: string;
  topics: string[];
}

export interface ScenarioGoal {
  id: string;
  description: string;
  completed: boolean;
}

export interface PracticeScenario {
  id: string;
  title: string;
  icon: string;
  category: 'Daily Life' | 'Travel' | 'Career' | 'Dining' | 'Social' | 'Culture' | 'Housing' | 'Healthcare' | 'Advanced';
  description: string;
  difficulty: ProficiencyLevel;
  initialPrompt: string;
  goals: ScenarioGoal[];
  suggestedStarters: string[];
}

export interface ReplyOption {
  text: string;
  translation: string;
  isCorrect: boolean;
  explanation: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'partner' | 'system';
  text: string;
  translation?: string;
  phonetic?: string;
  audioBase64?: string;
  timestamp: Date;
  correction?: string;
  grammarTip?: string;
  suggestedReplies?: string[];
  replyOptions?: ReplyOption[];
  isStreaming?: boolean;
}

export interface SavedWord {
  id: string;
  word: string;
  translation: string;
  partOfSpeech?: string;
  phonetic?: string;
  definition?: string;
  contextSentence: string;
  language?: string;
  savedAt: Date;
  masteryLevel: number; // 0 to 3
  reviewCount?: number;
  lastReviewed?: string;
}

export interface PronunciationResult {
  score: number;
  fluency: string;
  phoneticTranscription: string;
  syllableBreakdown?: string;
  accuracyFeedback: string;
  drills?: string[];
}

export interface SessionReport {
  overallScore: number;
  strengths: string[];
  areasToImprove: string[];
  grammarHighlights: {
    original: string;
    better: string;
    rule: string;
  }[];
  keyVocabularyLearned: {
    term: string;
    meaning: string;
  }[];
  motivationalComment: string;
}

export type ConversationMode = 'realtime-live' | 'interactive-turn';

export type AppView = 'chat' | 'mock-tests' | 'learning-hub' | 'dashboard';

export interface SkillActivityStats {
  speakingCount: number; // voice inputs, live partner speech turns, pronunciation coach drills
  speakingMinutes: number;
  listeningCount: number; // audio playback clicks, live partner listening, phonetics audio
  listeningMinutes: number;
  readingCount: number; // partner messages read, CEFR stories read, vocab words reviewed
  readingMinutes: number;
  writingCount: number; // user messages typed & sent, written exercises
  writingMinutes: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  targetLanguage: string;
  proficiencyLevel: ProficiencyLevel;
  unlockedLevels?: ProficiencyLevel[];
  passedPromotionExams?: string[];
  levelPracticeCounts?: Record<string, number>;
  xp: number;
  streakDays: number;
  longestStreak?: number;
  lastActiveDate: string;
  activeDates?: string[];
  dailyStudyMinutes?: Record<string, number>;
  totalStudyMinutes?: number;
  skillStats?: SkillActivityStats;
  streakFreezeCount?: number;
  streakFreezeUsedDates?: string[];
  claimedMilestones?: number[];
  dailyGoalMinutes?: number;
  lastCheckInDate?: string;
  league: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
  achievements: string[];
}

// --- Mock Exam & Quiz Types ---
export type MockTestSkill = 'listening' | 'reading' | 'writing' | 'speaking';

export interface ListeningItem {
  id: string;
  audioTranscript: string;
  audioTitle: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface ReadingItem {
  id: string;
  passageTitle: string;
  passage: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface WritingItem {
  id: string;
  title: string;
  prompt: string;
  context: string;
  minWords: number;
  targetTopics: string[];
}

export interface SpeakingItem {
  id: string;
  title: string;
  prompt: string;
  context: string;
  guidingQuestions: string[];
  recommendedDurationSeconds: number;
}

export interface MockTestExam {
  id: string;
  title: string;
  targetLanguage: string;
  cefrLevel: string;
  durationMinutes: number;
  listening: ListeningItem[];
  reading: ReadingItem[];
  writing: WritingItem;
  speaking: SpeakingItem;
}

export interface MockTestResult {
  id: string;
  testTitle: string;
  targetLanguage: string;
  completedAt: string;
  overallScore: number; // 0 - 100
  cefrLevel: string;
  listeningScore: number; // 0 - 25
  readingScore: number; // 0 - 25
  writingScore: number; // 0 - 25
  speakingScore: number; // 0 - 25
  listeningFeedback: string;
  readingFeedback: string;
  writingFeedback: {
    score: number;
    grammarScore: number;
    vocabularyScore: number;
    feedback: string;
    correctionDiff?: string;
  };
  speakingFeedback: {
    score: number;
    fluencyScore: number;
    pronunciationScore: number;
    feedback: string;
  };
  improvementRoadmap: string[];
}

// --- Dashboard & Analytics Types ---
export interface PerformanceStats {
  cefrLevel: string;
  fluencyScore: number; // 0-100
  streakDays: number;
  totalStudyMinutes: number;
  totalSessions: number;
  totalXp: number;
  vocabularyMasteredCount: number;
  vocabularyLearningCount: number;
  skillsBreakdown: {
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  };
  weeklyActivity: {
    day: string;
    minutes: number;
    fluency: number;
    xp: number;
  }[];
  monthlyProgression: {
    month: string;
    overall: number;
    speaking: number;
    listening: number;
    reading: number;
    writing: number;
  }[];
  recentTests: MockTestResult[];
}

export interface CEFRStory {
  id: string;
  title: string;
  englishTitle: string;
  cefrLevel: ProficiencyLevel;
  language: string;
  category: string;
  summary: string;
  coverEmoji: string;
  durationMinutes: number;
  xpReward: number;
  paragraphs: {
    id: string;
    targetText: string;
    englishText: string;
    audioCue?: string;
    keyWords?: { word: string; translation: string; phonetic?: string }[];
  }[];
  comprehensionQuiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

export interface PromotionQuestion {
  id: string;
  type: 'listening' | 'vocabulary' | 'grammar' | 'dialogue' | 'reading';
  question: string;
  audioPrompt?: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  skillTag: string;
}

export interface PromotionExam {
  id: string;
  fromLevel: ProficiencyLevel;
  toLevel: ProficiencyLevel;
  targetLanguage: string;
  title: string;
  description: string;
  passingScore: number;
  durationMinutes: number;
  questions: PromotionQuestion[];
}

export interface LevelReadiness {
  currentLevel: ProficiencyLevel;
  nextLevel: ProficiencyLevel | null;
  practiceCount: number;
  requiredPracticeCount: number;
  isReady: boolean;
  percentage: number;
}
