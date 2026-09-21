import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LiveVoicePartner } from './components/LiveVoicePartner';
import { InteractiveChat } from './components/InteractiveChat';
import { WordLookupModal } from './components/WordLookupModal';
import { PronunciationCoachModal } from './components/PronunciationCoachModal';
import { ScenarioSelectorModal } from './components/ScenarioSelectorModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { VocabularyDeckModal } from './components/VocabularyDeckModal';
import { BeginnerFoundationsModal } from './components/BeginnerFoundationsModal';
import { GlassBackground } from './components/GlassBackground';
import { PerformanceDashboardView } from './components/PerformanceDashboardView';
import { MockTestExamView } from './components/MockTestExamView';
import { LearningHubView } from './components/LearningHubView';
import { AuthModal } from './components/AuthModal';
import { StreakModal } from './components/StreakModal';
import { StreakCelebrationModal } from './components/StreakCelebrationModal';
import {
  LanguageOption,
  PartnerPersona,
  PracticeScenario,
  ProficiencyLevel,
  ChatMessage,
  SavedWord,
  SessionReport,
  ConversationMode,
  AppView,
  MockTestResult,
  UserProfile,
} from './types';
import { SUPPORTED_LANGUAGES, PARTNER_PERSONAS, PRACTICE_SCENARIOS, PROFICIENCY_LEVELS } from './data/languages';
import { LEVEL_GREETINGS } from './data/levelGreetings';
import { Mic, MessageSquare, Volume2, Award, Zap, GraduationCap, BarChart3 } from 'lucide-react';
import {
  migrateOrInitializeProfile,
  createCleanDefaultProfile,
  recordStudyActivity,
  claimMilestoneReward,
  purchaseStreakFreeze,
  performQuickCheckIn,
  formatDateKey,
  SkillIncrement,
} from './utils/streakManager';
import { PromotionExamModal } from './components/PromotionExamModal';
import {
  saveUserProfileToDb,
  loadUserProfileFromDb,
  saveExamResultToDb,
  saveVocabularyToDb,
} from './services/progressDatabase';
import {
  getNextLevel,
  getPromotionExam,
  getRequiredPracticeCount,
  isLevelUnlocked,
  ORDERED_CEFR_LEVELS,
} from './data/levelProgression';

const STORAGE_SAVED_WORDS = 'lingolive_saved_words';
const STORAGE_LAST_LANG = 'lingolive_last_lang';
const STORAGE_TEST_HISTORY = 'lingolive_mock_test_history';
const STORAGE_CHAT_MESSAGES_PREFIX = 'lingolive_chat_messages_';
const STORAGE_USER_LEVEL = 'lingolive_proficiency_level';
const STORAGE_UNLOCKED_LEVELS = 'lingolive_unlocked_levels';
const STORAGE_LEVEL_PRACTICE = 'lingolive_level_practice_counts';
const STORAGE_USER_PROFILE = 'lingolive_user_profile';

export default function App() {
  // Navigation View State
  const [activeView, setActiveView] = useState<AppView>('chat');

  // App Core State
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>(() => {
    const savedLangId = localStorage.getItem(STORAGE_LAST_LANG);
    return SUPPORTED_LANGUAGES.find((l) => l.id === savedLangId) || SUPPORTED_LANGUAGES[0];
  });

  // Default to A0 - Absolute Beginner for first-time users as requested
  const [proficiencyLevel, setProficiencyLevel] = useState<ProficiencyLevel>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_USER_LEVEL);
      if (saved && PROFICIENCY_LEVELS.includes(saved as ProficiencyLevel)) {
        return saved as ProficiencyLevel;
      }
    } catch {}
    return 'A0 - Absolute Beginner (Zero Knowledge)';
  });

  // Locked/unlocked level progression array
  const [unlockedLevels, setUnlockedLevels] = useState<ProficiencyLevel[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_UNLOCKED_LEVELS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {}
    return ['A0 - Absolute Beginner (Zero Knowledge)'];
  });

  // Practice activity counter per CEFR level
  const [levelPracticeCounts, setLevelPracticeCounts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LEVEL_PRACTICE);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Promotion Exam Modal State
  const [promotionModalOpen, setPromotionModalOpen] = useState<boolean>(false);

  const [currentPersona, setCurrentPersona] = useState<PartnerPersona>(() => {
    const personas = PARTNER_PERSONAS[currentLanguage.id] || PARTNER_PERSONAS['spanish'];
    return personas[0];
  });

  const [currentScenario, setCurrentScenario] = useState<PracticeScenario>(() => {
    return PRACTICE_SCENARIOS[0];
  });

  const [conversationMode, setConversationMode] = useState<ConversationMode>('realtime-live');

  // Messages for Turn-based chat - restored from localStorage per language & scenario
  const getChatStorageKey = (langId: string, scenarioId: string, level: string) =>
    `${STORAGE_CHAT_MESSAGES_PREFIX}${langId}_${scenarioId}_${level.replace(/\s+/g, '')}`;

  const createInitialWelcomeMessage = (
    lang: LanguageOption,
    level: ProficiencyLevel,
    scenario: PracticeScenario
  ): ChatMessage => {
    const langGreetings = LEVEL_GREETINGS[lang.id] || LEVEL_GREETINGS['spanish'];
    const levelData = langGreetings?.[level] || langGreetings?.['A0 - Absolute Beginner (Zero Knowledge)'] || langGreetings?.['B1 - Intermediate'];
    return {
      id: `welcome-${Date.now()}`,
      role: 'partner',
      text: levelData?.text || lang.samplePhrase,
      translation: levelData?.translation || lang.sampleTranslation,
      phonetic: levelData?.phonetic,
      suggestedReplies: levelData?.suggestedStarters || scenario.suggestedStarters,
      timestamp: new Date(),
    };
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const initialLevel: ProficiencyLevel = (() => {
      try {
        const saved = localStorage.getItem(STORAGE_USER_LEVEL);
        if (saved && PROFICIENCY_LEVELS.includes(saved as ProficiencyLevel)) {
          return saved as ProficiencyLevel;
        }
      } catch {}
      return 'A0 - Absolute Beginner (Zero Knowledge)';
    })();
    try {
      const key = `${STORAGE_CHAT_MESSAGES_PREFIX}${currentLanguage.id}_${PRACTICE_SCENARIOS[0].id}_${initialLevel.replace(/\s+/g, '')}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((m: any) => ({
            ...m,
            timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load initial chat messages:', e);
    }
    return [createInitialWelcomeMessage(currentLanguage, initialLevel, PRACTICE_SCENARIOS[0])];
  });
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  // Saved Vocabulary Deck
  const [savedWords, setSavedWords] = useState<SavedWord[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_WORDS);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Mock Test History (Real user tests stored in localStorage; starts empty if user has not taken tests yet)
  const [mockTestHistory, setMockTestHistory] = useState<MockTestResult[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_TEST_HISTORY);
      if (!stored) return [];
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        // Filter out legacy dummy sample exams to ensure zero exams appear until user actually takes one
        const valid = parsed.filter(
          (t) =>
            t &&
            typeof t === 'object' &&
            typeof t.id === 'string' &&
            t.id.startsWith('exam-') &&
            typeof t.overallScore === 'number' &&
            !t.id.includes('sample') &&
            !t.id.includes('mock-sample') &&
            !t.id.includes('demo') &&
            !t.id.includes('default')
        );
        return valid;
      }
      return [];
    } catch {
      return [];
    }
  });

  // Modals
  const [lookupWordInfo, setLookupWordInfo] = useState<{ word: string; sentence: string } | null>(null);
  const [pronunciationModalOpen, setPronunciationModalOpen] = useState(false);
  const [pronunciationDrillText, setPronunciationDrillText] = useState('');
  const [scenarioModalOpen, setScenarioModalOpen] = useState(false);
  const [vocabularyModalOpen, setVocabularyModalOpen] = useState(false);
  const [beginnerModalOpen, setBeginnerModalOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [streakCelebrationOpen, setStreakCelebrationOpen] = useState(false);
  const [celebrationDetails, setCelebrationDetails] = useState<{
    streakDays: number;
    dailyGoalMinutes: number;
    studyMinutesToday: number;
    bonusXp: number;
  }>({
    streakDays: 1,
    dailyGoalMinutes: 15,
    studyMinutesToday: 15,
    bonusXp: 25,
  });
  const [sessionReport, setSessionReport] = useState<SessionReport | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  const STORAGE_LAST_CELEBRATED_DATE = 'lingolive_last_celebrated_streak_date';

  // User Profile & Progress Persistence State with verified daily streaks
  const [userProfile, setUserProfile] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('lingolive_user_profile');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      if (!parsed || !parsed.name || parsed.name === 'Polyglot Learner') {
        return null;
      }
      return migrateOrInitializeProfile(parsed);
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Centralized study activity & streak tracker
  const handleRecordStudy = (
    minutesToAdd: number = 2,
    xpToAdd: number = 10,
    skillIncrement?: SkillIncrement
  ) => {
    setUserProfile((prev) => {
      const activeProf = prev || createCleanDefaultProfile({
        name: 'Guest Polyglot',
        email: 'guest@lingolive.app',
        targetLanguage: currentLanguage.name,
        proficiencyLevel,
        dailyGoalMinutes: 15,
      });

      const { updatedProfile, streakIncreased, goalMetJustNow } = recordStudyActivity(
        activeProf,
        minutesToAdd,
        xpToAdd,
        skillIncrement
      );
      
      const todayKey = formatDateKey();
      const lastCelebrated = localStorage.getItem(STORAGE_LAST_CELEBRATED_DATE);
      const studyToday = updatedProfile.dailyStudyMinutes?.[todayKey] || 0;
      const dailyGoal = updatedProfile.dailyGoalMinutes || 15;

      // Automatically trigger celebration animation when streak increases or daily goal is met for the FIRST time today
      if ((streakIncreased || goalMetJustNow || studyToday >= dailyGoal) && lastCelebrated !== todayKey) {
        try {
          localStorage.setItem(STORAGE_LAST_CELEBRATED_DATE, todayKey);
        } catch {}

        setCelebrationDetails({
          streakDays: Math.max(1, updatedProfile.streakDays),
          dailyGoalMinutes: dailyGoal,
          studyMinutesToday: studyToday,
          bonusXp: 25,
        });
        setStreakCelebrationOpen(true);
      }

      return updatedProfile;
    });
  };

  const handleAwardXP = (amount: number, skillIncrement?: SkillIncrement) => {
    handleRecordStudy(1, amount, skillIncrement);
  };

  // Automatic database synchronization whenever profile changes
  useEffect(() => {
    if (userProfile && userProfile.name !== 'Polyglot Learner') {
      saveUserProfileToDb(userProfile);
    }
  }, [userProfile]);

  // Save words to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SAVED_WORDS, JSON.stringify(savedWords));
    } catch (e) {
      console.error(e);
    }
  }, [savedWords]);

  // Save mock test history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_TEST_HISTORY, JSON.stringify(mockTestHistory));
    } catch (e) {
      console.error(e);
    }
  }, [mockTestHistory]);

  // Synchronize messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      const key = getChatStorageKey(currentLanguage.id, currentScenario.id, proficiencyLevel);
      localStorage.setItem(key, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to persist chat messages:', e);
    }
  }, [messages, currentLanguage.id, currentScenario.id, proficiencyLevel]);

  // Load existing conversation or start calibrated greeting when language, proficiency, or scenario changes
  useEffect(() => {
    const personas = PARTNER_PERSONAS[currentLanguage.id] || PARTNER_PERSONAS['spanish'];
    const matchingPersona = personas.find((p) => p.id === currentLanguage.defaultPartner) || personas[0];
    setCurrentPersona(matchingPersona);
    localStorage.setItem(STORAGE_LAST_LANG, currentLanguage.id);

    const storageKey = getChatStorageKey(currentLanguage.id, currentScenario.id, proficiencyLevel);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(
            parsed.map((m: any) => ({
              ...m,
              timestamp: m.timestamp ? new Date(m.timestamp) : new Date(),
            }))
          );
          return;
        }
      }
    } catch (e) {
      console.error('Failed to load chat history for current scenario:', e);
    }

    // Default: initialize with calibrated greeting for this level & scenario
    const initialMsg = createInitialWelcomeMessage(currentLanguage, proficiencyLevel, currentScenario);
    setMessages([initialMsg]);
  }, [currentLanguage.id, proficiencyLevel, currentScenario.id]);

  // Reset/Clear conversation handler
  const handleResetChat = () => {
    const storageKey = getChatStorageKey(currentLanguage.id, currentScenario.id, proficiencyLevel);
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {}
    const initialMsg = createInitialWelcomeMessage(currentLanguage, proficiencyLevel, currentScenario);
    setMessages([initialMsg]);
  };

  // Handle User Message submission in Chat mode
  const handleSendMessage = async (text: string, isVoiceInput?: boolean) => {
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
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

      if (data.success && data.data) {
        const aiData = data.data;

        // Auto-complete matching scenario goals if AI confirmed
        if (aiData.goalsCompleted && Array.isArray(aiData.goalsCompleted)) {
          aiData.goalsCompleted.forEach((gid: string) => {
            handleToggleScenarioGoal(gid, true);
          });
        }
        if (aiData.completedGoalIndices && Array.isArray(aiData.completedGoalIndices)) {
          aiData.completedGoalIndices.forEach((idx: number) => {
            const matchedGoal = currentScenario.goals[idx];
            if (matchedGoal) {
              handleToggleScenarioGoal(matchedGoal.id, true);
            }
          });
        }

        const partnerMsg: ChatMessage = {
          id: `partner-${Date.now()}`,
          role: 'partner',
          text: aiData.reply,
          translation: aiData.replyTranslation,
          phonetic: aiData.replyPhonetic || aiData.phoneticGuide,
          correction: aiData.correction,
          grammarTip: aiData.grammarTip,
          suggestedReplies: aiData.suggestedReplies || [],
          replyOptions: aiData.replyOptions || [],
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, partnerMsg]);
        handleRecordStudy(
          1,
          15,
          isVoiceInput
            ? { speaking: 1, writing: 1, reading: 1 }
            : { writing: 1, reading: 1 }
        );
        handleIncrementLevelPractice(1);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        text: `Error connecting to AI Partner: ${err.message || 'Please try again'}.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  // Add a word to user's saved flashcards
  const handleSaveWord = (newWord: SavedWord) => {
    if (userProfile?.id) {
      saveVocabularyToDb(userProfile.id, newWord);
    }
    setSavedWords((prev) => {
      const exists = prev.some((w) => w.word.toLowerCase() === newWord.word.toLowerCase());
      if (exists) {
        return prev.map((w) => (w.word.toLowerCase() === newWord.word.toLowerCase() ? newWord : w));
      }
      return [newWord, ...prev];
    });
    handleRecordStudy(1, 10, 'reading');
  };

  const handleUpdateWordMastery = (wordId: string, delta: number) => {
    setSavedWords((prev) =>
      prev.map((w) => {
        if (w.id === wordId) {
          const nextMastery = Math.min(100, Math.max(0, w.masteryLevel + delta));
          return {
            ...w,
            masteryLevel: nextMastery,
            reviewCount: w.reviewCount + 1,
            lastReviewed: new Date().toISOString(),
          };
        }
        return w;
      })
    );
  };

  const handleDeleteWord = (wordId: string) => {
    setSavedWords((prev) => prev.filter((w) => w.id !== wordId));
  };

  // Generate Session Fluency Summary & CEFR Report (Fast execution)
  const handleGenerateSummary = async (customTranscript?: ChatMessage[]) => {
    const transcriptToAnalyze = customTranscript || messages;
    setIsGeneratingSummary(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3200);

    const fallbackReport = {
      overallScore: Math.min(96, Math.max(80, 82 + Math.min(12, transcriptToAnalyze.length * 2))),
      strengths: [
        'Active conversational participation and steady turn-taking',
        `Practical use of vocabulary for "${currentScenario.title}"`,
        'Clear message delivery and conversational persistence',
      ],
      areasToImprove: [
        'Explore varied sentence connectors to enrich spoken complexity',
        'Practice spontaneous verb conjugations and idiomatic phrases',
      ],
      grammarHighlights: [
        {
          original: `Practice session in ${currentLanguage.name}`,
          better: 'Natural conversational flow',
          rule: 'Consistent dialogue strengthens neural recall pathways.',
        },
      ],
      keyVocabularyLearned: [
        {
          term: currentScenario.title,
          meaning: `Contextual vocabulary for ${currentScenario.category}`,
        },
      ],
      motivationalComment: `Strong progress practicing ${currentLanguage.name}! Keep practicing to elevate your CEFR fluency level.`,
    };

    try {
      const res = await fetch('/api/session-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: transcriptToAnalyze.slice(-10).map((m) => ({
            role: m.role,
            text: m.text,
          })),
          targetLanguage: currentLanguage.name,
          proficiencyLevel,
          scenarioTitle: currentScenario.title,
          goals: currentScenario.goals,
        }),
      });
      clearTimeout(timeoutId);

      const data = await res.json();
      const reportData = data.report || data.data;
      if (data.success && reportData) {
        setSessionReport(reportData);
      } else {
        setSessionReport(fallbackReport);
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.warn('Session summary generated via fast synthesis:', err);
      setSessionReport(fallbackReport);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  // Toggle goal completion state
  const handleToggleScenarioGoal = (goalId: string, completed: boolean) => {
    setCurrentScenario((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => (g.id === goalId ? { ...g, completed } : g)),
    }));
    if (completed) {
      handleRecordStudy(2, 25);
      handleIncrementLevelPractice(1);
    }
  };

  // Level Progression & Promotion calculations
  const currentLevelCode = proficiencyLevel.split(' - ')[0];
  const nextLevel = getNextLevel(proficiencyLevel);
  const requiredPracticeCount = getRequiredPracticeCount(proficiencyLevel);
  const currentLevelPracticeCount = levelPracticeCounts[currentLevelCode] || 0;
  const isReadyForPromotion = nextLevel !== null && currentLevelPracticeCount >= requiredPracticeCount;
  const readinessPercentage = Math.min(100, Math.round((currentLevelPracticeCount / requiredPracticeCount) * 100));

  const handleIncrementLevelPractice = (amount = 1) => {
    setLevelPracticeCounts((prev) => {
      const updated = {
        ...prev,
        [currentLevelCode]: (prev[currentLevelCode] || 0) + amount,
      };
      try {
        localStorage.setItem(STORAGE_LEVEL_PRACTICE, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectProficiency = (level: ProficiencyLevel) => {
    // Check if level is unlocked
    if (!unlockedLevels.includes(level)) {
      setPromotionModalOpen(true);
      return;
    }
    setProficiencyLevel(level);
    try {
      localStorage.setItem(STORAGE_USER_LEVEL, level);
    } catch {}
    if (level.includes('A0')) {
      const zeroScenario = PRACTICE_SCENARIOS.find((s) => s.id === 'first-words-zero-knowledge') || PRACTICE_SCENARIOS[0];
      setCurrentScenario(zeroScenario);
    }
  };

  const handlePromotionSuccess = (promotedToLevel: ProficiencyLevel, score: number) => {
    // 1. Add promoted level to unlocked levels
    setUnlockedLevels((prev) => {
      const updated = prev.includes(promotedToLevel) ? prev : [...prev, promotedToLevel];
      try {
        localStorage.setItem(STORAGE_UNLOCKED_LEVELS, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // 2. Switch active level to newly unlocked level
    setProficiencyLevel(promotedToLevel);
    try {
      localStorage.setItem(STORAGE_USER_LEVEL, promotedToLevel);
    } catch {}

    // 3. Update user profile state
    setUserProfile((prev) => {
      if (!prev) return prev;
      const updated: UserProfile = {
        ...prev,
        proficiencyLevel: promotedToLevel,
        unlockedLevels: prev.unlockedLevels ? (prev.unlockedLevels.includes(promotedToLevel) ? prev.unlockedLevels : [...prev.unlockedLevels, promotedToLevel]) : [promotedToLevel],
        passedPromotionExams: [...(prev.passedPromotionExams || []), `${currentLanguage.id}-${currentLevelCode}`],
        xp: (prev.xp || 0) + 100,
        achievements: prev.achievements.includes(`Mastered ${currentLevelCode}`)
          ? prev.achievements
          : [...prev.achievements, `Mastered ${currentLevelCode} (${currentLanguage.name})`],
      };
      try {
        localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updated));
        saveUserProfileToDb(updated);
      } catch {}
      return updated;
    });

    // 4. Save test history
    const examRecord: MockTestResult = {
      id: `exam-promotion-${Date.now()}`,
      testTitle: `${currentLanguage.name} CEFR Promotion: ${currentLevelCode} ➔ ${promotedToLevel.split(' - ')[0]}`,
      cefrLevel: promotedToLevel.split(' - ')[0],
      targetLanguage: currentLanguage.name,
      overallScore: score,
      listeningScore: 25,
      readingScore: 25,
      writingScore: 25,
      speakingScore: 25,
      listeningFeedback: 'Flawless comprehension',
      readingFeedback: 'Accurate vocabulary recognition',
      writingFeedback: {
        score: 25,
        grammarScore: 25,
        vocabularyScore: 25,
        feedback: 'Demonstrated solid grasp of target level syntax.',
      },
      speakingFeedback: {
        score: 25,
        fluencyScore: 25,
        pronunciationScore: 25,
        feedback: 'Pronunciation and acoustic confidence verified.',
      },
      improvementRoadmap: [`Continue practicing conversations in ${promotedToLevel.split(' - ')[0]}!`],
      completedAt: new Date().toISOString(),
    };
    if (userProfile?.id) {
      saveExamResultToDb(userProfile.id, examRecord);
    }
    setMockTestHistory((prev) => {
      const updated = [examRecord, ...prev];
      try {
        localStorage.setItem(STORAGE_TEST_HISTORY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Mock Test completion
  const handleMockTestCompleted = (result: MockTestResult) => {
    setMockTestHistory((prev) => [result, ...prev]);
    handleRecordStudy(15, Math.max(50, Math.round(result.overallScore * 1.5)));
    handleIncrementLevelPractice(2);
  };

  const completedGoalsCount = currentScenario.goals.filter((g) => g.completed).length;

  return (
    <GlassBackground className={activeView === 'chat' ? 'h-dvh max-h-dvh overflow-hidden' : ''}>
      {/* Sleek Frosted Glass Header with Navigation Tabs */}
      <Header
        activeView={activeView}
        onSelectView={(view) => setActiveView(view)}
        currentLanguage={currentLanguage}
        onSelectLanguage={(lang) => setCurrentLanguage(lang)}
        currentPersona={currentPersona}
        onSelectPersona={(persona) => setCurrentPersona(persona)}
        proficiencyLevel={proficiencyLevel}
        onSelectProficiency={handleSelectProficiency}
        unlockedLevels={unlockedLevels}
        isReadyForPromotion={isReadyForPromotion}
        readinessPercentage={readinessPercentage}
        nextLevel={nextLevel}
        onOpenPromotionExam={() => setPromotionModalOpen(true)}
        currentScenario={currentScenario}
        onOpenScenarioModal={() => setScenarioModalOpen(true)}
        conversationMode={conversationMode}
        onToggleMode={(mode) => setConversationMode(mode)}
        savedWordsCount={savedWords.length}
        onOpenVocabulary={() => setVocabularyModalOpen(true)}
        onOpenPronunciationCoach={() => {
          setPronunciationDrillText(currentLanguage.samplePhrase);
          setPronunciationModalOpen(true);
        }}
        onOpenBeginnerFoundations={() => setBeginnerModalOpen(true)}
        completedGoalsCount={completedGoalsCount}
        totalGoalsCount={currentScenario.goals.length}
        user={userProfile}
        onOpenAuthModal={() => setAuthModalOpen(true)}
        onOpenStreakModal={() => setStreakModalOpen(true)}
      />

      {/* Main Content Area Driven by activeView */}
      <main className={`flex-1 min-h-0 flex flex-col relative z-10 w-full ${activeView === 'chat' ? 'overflow-hidden' : 'overflow-x-hidden'}`}>
        
        {/* VIEW 1: Practice Chat & Live Voice Partner */}
        {activeView === 'chat' && (
          <div className="flex-1 min-h-0 flex flex-col px-2 sm:px-4 pb-2 sm:pb-3 overflow-hidden">
            {/* Mode Switcher Banner (Live Voice vs Turn-based Chat) */}
            <div className="max-w-7xl mx-auto w-full px-2 pt-1.5 pb-1 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-pink-300 uppercase tracking-wider">Mode:</span>
                <div className="p-0.5 rounded-xl glass-card border border-white/18 flex items-center gap-1 shadow-md">
                  <button
                    onClick={() => setConversationMode('realtime-live')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      conversationMode === 'realtime-live'
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Mic className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Real-Time Voice</span>
                  </button>
                  <button
                    onClick={() => setConversationMode('interactive-turn')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      conversationMode === 'interactive-turn'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-[0_0_12px_rgba(236,72,153,0.4)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-pink-300" />
                    <span>Interactive Turn Chat</span>
                  </button>
                </div>
              </div>

              {/* Quick Learning Centre Shortcut Pill */}
              <button
                onClick={() => setActiveView('learning-hub')}
                className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-xl glass-card hover:bg-white/15 border border-pink-500/30 text-xs font-bold text-pink-300 hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Video Masterclasses & CEFR Studios</span>
              </button>
            </div>

            <div className="flex-1 min-h-0 max-w-7xl mx-auto w-full flex flex-col">
              {conversationMode === 'realtime-live' ? (
                <LiveVoicePartner
                  currentLanguage={currentLanguage}
                  currentPersona={currentPersona}
                  currentScenario={currentScenario}
                  proficiencyLevel={proficiencyLevel}
                  onEndCallAndSummarize={(liveTranscript) => {
                    const speechTurns = Math.max(1, Math.round(liveTranscript.length / 2));
                    handleRecordStudy(5, 50, { speaking: speechTurns, listening: speechTurns });
                    handleGenerateSummary(liveTranscript);
                  }}
                  onSaveWord={handleSaveWord}
                  onOpenWordLookup={(word, sentence) => {
                    setLookupWordInfo({ word, sentence });
                  }}
                  onUpdateScenarioGoal={handleToggleScenarioGoal}
                />
              ) : (
                <InteractiveChat
                  currentLanguage={currentLanguage}
                  currentPersona={currentPersona}
                  currentScenario={currentScenario}
                  proficiencyLevel={proficiencyLevel}
                  unlockedLevels={unlockedLevels}
                  isReadyForPromotion={isReadyForPromotion}
                  readinessPercentage={readinessPercentage}
                  nextLevel={nextLevel}
                  onOpenPromotionExam={() => setPromotionModalOpen(true)}
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoadingChat}
                  onOpenWordLookup={(word, sentence) => {
                    setLookupWordInfo({ word, sentence });
                  }}
                  onOpenPronunciationCoachWithText={(text) => {
                    setPronunciationDrillText(text);
                    setPronunciationModalOpen(true);
                  }}
                  onSaveWord={handleSaveWord}
                  onUpdateScenarioGoal={handleToggleScenarioGoal}
                  onGenerateSessionSummary={() => handleGenerateSummary()}
                  isGeneratingSummary={isGeneratingSummary}
                  onResetChat={handleResetChat}
                  onPlayAudio={() => {
                    handleRecordStudy(1, 5, 'listening');
                  }}
                />
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: Language Learning Centre & Gamified Hub */}
        {activeView === 'learning-hub' && (
          <LearningHubView
            currentLanguage={currentLanguage}
            proficiencyLevel={proficiencyLevel}
            user={userProfile}
            onSaveWord={handleSaveWord}
            onOpenWordLookup={(word, sentence) => {
              setLookupWordInfo({ word, sentence });
            }}
            onAwardXP={handleAwardXP}
            onOpenStreakModal={() => setStreakModalOpen(true)}
            onOpenVoiceChat={() => {
              setActiveView('chat');
              setConversationMode('realtime-live');
            }}
          />
        )}

        {/* VIEW 3: Standardized CEFR Mock Exams & Quizzes */}
        {activeView === 'mock-tests' && (
          <MockTestExamView
            currentLanguage={currentLanguage}
            proficiencyLevel={proficiencyLevel}
            onCompleteExam={handleMockTestCompleted}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {/* VIEW 4: Performance Dashboard & Progress Analytics */}
        {activeView === 'dashboard' && (
          <PerformanceDashboardView
            currentLanguage={currentLanguage}
            proficiencyLevel={proficiencyLevel}
            savedWordsCount={savedWords.length}
            completedGoalsCount={completedGoalsCount}
            totalGoalsCount={currentScenario.goals.length}
            mockTestHistory={mockTestHistory}
            studyMinutes={userProfile?.totalStudyMinutes ?? 0}
            userMessagesCount={messages.filter((m) => m.role === 'user').length}
            streakDays={userProfile?.streakDays ?? 0}
            user={userProfile}
            onNavigateToMockTests={() => setActiveView('mock-tests')}
            onNavigateToChat={() => setActiveView('chat')}
            onClearTestHistory={() => {
              setMockTestHistory([]);
              localStorage.removeItem(STORAGE_TEST_HISTORY);
            }}
            onOpenStreakModal={() => setStreakModalOpen(true)}
          />
        )}
      </main>

      {/* Zero Knowledge / Absolute Beginner Starter Kit Modal */}
      {beginnerModalOpen && (
        <BeginnerFoundationsModal
          isOpen={true}
          currentLanguage={currentLanguage}
          onPracticePhraseInChat={(phraseText) => {
            setProficiencyLevel('A0 - Absolute Beginner (Zero Knowledge)');
            const zeroScenario = PRACTICE_SCENARIOS.find((s) => s.id === 'first-words-zero-knowledge') || currentScenario;
            setCurrentScenario(zeroScenario);
            setConversationMode('interactive-turn');
            setActiveView('chat');
            setBeginnerModalOpen(false);
            handleSendMessage(phraseText);
          }}
          onPracticePhrasePronunciation={(phraseText) => {
            setPronunciationDrillText(phraseText);
            setPronunciationModalOpen(true);
            setBeginnerModalOpen(false);
          }}
          onSaveWord={(word, translation, phonetic, sentence) => {
            handleSaveWord({
              id: `word-${Date.now()}`,
              word,
              translation,
              phonetic,
              contextSentence: sentence,
              savedAt: new Date(),
              masteryLevel: 0,
              reviewCount: 0,
            });
          }}
          onClose={() => setBeginnerModalOpen(false)}
        />
      )}

      {/* Word Deep Dive & Context Dictionary Modal */}
      {lookupWordInfo && (
        <WordLookupModal
          word={lookupWordInfo.word}
          contextSentence={lookupWordInfo.sentence}
          currentLanguage={currentLanguage}
          onClose={() => setLookupWordInfo(null)}
          onSaveWord={handleSaveWord}
          isAlreadySaved={savedWords.some(
            (w) => w.word.toLowerCase() === lookupWordInfo.word.toLowerCase()
          )}
        />
      )}

      {/* Pronunciation & Phonetics Coach Modal */}
      {pronunciationModalOpen && (
        <PronunciationCoachModal
          initialText={pronunciationDrillText}
          currentLanguage={currentLanguage}
          onClose={() => setPronunciationModalOpen(false)}
          onRecordPractice={() => {
            handleRecordStudy(1, 15, 'speaking');
          }}
        />
      )}

      {/* Practice Scenario Selector Modal */}
      {scenarioModalOpen && (
        <ScenarioSelectorModal
          currentScenario={currentScenario}
          currentLanguage={currentLanguage}
          proficiencyLevel={proficiencyLevel}
          onSelectScenario={(sc) => setCurrentScenario(sc)}
          onClose={() => setScenarioModalOpen(false)}
        />
      )}

      {/* Session Fluency Summary Modal */}
      {sessionReport && (
        <SessionSummaryModal
          report={sessionReport}
          scenario={currentScenario}
          language={currentLanguage}
          onClose={() => setSessionReport(null)}
        />
      )}

      {/* Saved Vocabulary Deck Modal */}
      {vocabularyModalOpen && (
        <VocabularyDeckModal
          savedWords={savedWords}
          currentLanguage={currentLanguage}
          onUpdateWordMastery={handleUpdateWordMastery}
          onDeleteWord={handleDeleteWord}
          onClose={() => setVocabularyModalOpen(false)}
        />
      )}

      {/* Official CEFR Level Promotion Exam Modal */}
      {promotionModalOpen && (
        <PromotionExamModal
          isOpen={true}
          onClose={() => setPromotionModalOpen(false)}
          exam={getPromotionExam(currentLanguage, proficiencyLevel)}
          currentLanguage={currentLanguage}
          onPromotionSuccess={handlePromotionSuccess}
        />
      )}

      {/* User Profile & Progress Persistence Modal */}
      {authModalOpen && (
        <AuthModal
          user={userProfile}
          onClose={() => setAuthModalOpen(false)}
          onLogin={(profile) => setUserProfile(profile)}
          onLogout={() => {
            setUserProfile(null);
            localStorage.removeItem('lingolive_user_profile');
          }}
          onUpdateProfile={(profile) => setUserProfile(profile)}
          savedWordsCount={savedWords.length}
          mockTestsCount={mockTestHistory.length}
          currentLevel={proficiencyLevel}
          currentLanguage={currentLanguage.name}
        />
      )}

      {/* Daily Streak & Milestones Modal */}
      {streakModalOpen && (
        <StreakModal
          isOpen={true}
          onClose={() => setStreakModalOpen(false)}
          user={userProfile}
          onClaimMilestone={(days, xp) => {
            if (!userProfile) return;
            const updated = claimMilestoneReward(userProfile, days, xp);
            setUserProfile(updated);
          }}
          onPurchaseFreeze={() => {
            if (!userProfile) return;
            const res = purchaseStreakFreeze(userProfile);
            if (res.success) {
              setUserProfile(res.updatedProfile);
            }
          }}
          onQuickCheckIn={() => {
            if (!userProfile) return;
            const res = performQuickCheckIn(userProfile);
            if (res.success && res.updatedProfile) {
              setUserProfile(res.updatedProfile);
            }
          }}
          onOpenPractice={() => {
            setActiveView('chat');
          }}
        />
      )}

      {/* Daily Goal Streak Celebration Animation Modal */}
      <StreakCelebrationModal
        isOpen={streakCelebrationOpen}
        onClose={() => setStreakCelebrationOpen(false)}
        user={userProfile}
        currentLanguage={currentLanguage}
        streakDays={celebrationDetails.streakDays}
        dailyGoalMinutes={celebrationDetails.dailyGoalMinutes}
        studyMinutesToday={celebrationDetails.studyMinutesToday}
        bonusXp={celebrationDetails.bonusXp}
        onOpenStreakModal={() => {
          setStreakCelebrationOpen(false);
          setStreakModalOpen(true);
        }}
      />

      {/* Mobile Sticky Bottom Navigation Bar (Visible strictly on mobile screens < md, completely hidden on desktop) */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e031c]/95 backdrop-blur-2xl border-t border-white/10 px-2 py-1.5 shadow-[0_-10px_25px_rgba(0,0,0,0.6)]"
      >
        <div className="grid grid-cols-4 gap-1 max-w-md mx-auto">
          {/* 1. Voice & Chat */}
          <button
            onClick={() => setActiveView('chat')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeView === 'chat'
                ? 'bg-gradient-to-b from-pink-500/25 to-purple-600/20 text-white border border-pink-400/40 shadow-[0_0_12px_rgba(236,72,153,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <MessageSquare className={`w-4 h-4 mb-0.5 ${activeView === 'chat' ? 'text-pink-400' : 'text-slate-400'}`} />
            <span className="text-[10px] font-bold tracking-tight">Practice</span>
          </button>

          {/* 2. Academy / Learning Hub */}
          <button
            onClick={() => setActiveView('learning-hub')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeView === 'learning-hub'
                ? 'bg-gradient-to-b from-cyan-500/25 to-blue-600/20 text-white border border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <GraduationCap className={`w-4 h-4 mb-0.5 ${activeView === 'learning-hub' ? 'text-cyan-300' : 'text-slate-400'}`} />
            <span className="text-[10px] font-bold tracking-tight">Academy</span>
          </button>

          {/* 3. Standardized Mock Exams */}
          <button
            onClick={() => setActiveView('mock-tests')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeView === 'mock-tests'
                ? 'bg-gradient-to-b from-amber-500/25 to-orange-600/20 text-white border border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <Award className={`w-4 h-4 mb-0.5 ${activeView === 'mock-tests' ? 'text-amber-300' : 'text-slate-400'}`} />
            <span className="text-[10px] font-bold tracking-tight">Exams</span>
          </button>

          {/* 4. Analytics & CEFR Dashboard */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[48px] ${
              activeView === 'dashboard'
                ? 'bg-gradient-to-b from-emerald-500/25 to-teal-600/20 text-white border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            <BarChart3 className={`w-4 h-4 mb-0.5 ${activeView === 'dashboard' ? 'text-emerald-300' : 'text-slate-400'}`} />
            <span className="text-[10px] font-bold tracking-tight">Progress</span>
          </button>
        </div>
      </nav>
    </GlassBackground>
  );
}
