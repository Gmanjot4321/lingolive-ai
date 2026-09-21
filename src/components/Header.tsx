import React, { useState } from 'react';
import {
  Sparkles,
  Volume2,
  BookOpen,
  ChevronDown,
  Layers,
  Compass,
  CheckCircle2,
  MessageSquare,
  Award,
  BarChart3,
  GraduationCap,
  User,
  Flame,
  Lock,
  Unlock,
  ArrowRight,
  X,
  Wrench,
} from 'lucide-react';
import {
  LanguageOption,
  PartnerPersona,
  PracticeScenario,
  ProficiencyLevel,
  ConversationMode,
  AppView,
  UserProfile,
} from '../types';
import { SUPPORTED_LANGUAGES, PROFICIENCY_LEVELS, PARTNER_PERSONAS } from '../data/languages';
import { isLevelUnlocked, getNextLevel } from '../data/levelProgression';

interface HeaderProps {
  activeView: AppView;
  onSelectView: (view: AppView) => void;
  currentLanguage: LanguageOption;
  onSelectLanguage: (lang: LanguageOption) => void;
  currentPersona: PartnerPersona;
  onSelectPersona: (persona: PartnerPersona) => void;
  proficiencyLevel: ProficiencyLevel;
  onSelectProficiency: (level: ProficiencyLevel) => void;
  unlockedLevels?: ProficiencyLevel[];
  isReadyForPromotion?: boolean;
  readinessPercentage?: number;
  nextLevel?: ProficiencyLevel | null;
  onOpenPromotionExam?: () => void;
  currentScenario: PracticeScenario;
  onOpenScenarioModal: () => void;
  conversationMode: ConversationMode;
  onToggleMode: (mode: ConversationMode) => void;
  savedWordsCount: number;
  onOpenVocabulary: () => void;
  onOpenPronunciationCoach: () => void;
  onOpenBeginnerFoundations: () => void;
  completedGoalsCount: number;
  totalGoalsCount: number;
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onOpenStreakModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeView,
  onSelectView,
  currentLanguage,
  onSelectLanguage,
  proficiencyLevel,
  onSelectProficiency,
  unlockedLevels = ['A0 - Absolute Beginner (Zero Knowledge)'],
  isReadyForPromotion = false,
  readinessPercentage = 0,
  nextLevel = null,
  onOpenPromotionExam,
  currentScenario,
  onOpenScenarioModal,
  savedWordsCount,
  onOpenVocabulary,
  onOpenPronunciationCoach,
  onOpenBeginnerFoundations,
  completedGoalsCount,
  totalGoalsCount,
  user,
  onOpenAuthModal,
  onOpenStreakModal,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);

  const isA0 = proficiencyLevel.includes('A0');

  return (
    <header className="sticky top-0 z-40 bg-[#140528]/95 backdrop-blur-2xl border-b border-pink-500/20 shadow-[0_4px_30px_rgba(26,4,46,0.8)] w-full">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 lg:px-6 py-1.5 md:py-0">
        {/* Desktop Single-Row Layout */}
        <div className="hidden md:flex items-center justify-between h-16 gap-2 lg:gap-3">
          {/* Brand Identity with Neon Gradient Icon */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-400 p-[1.5px] shadow-[0_0_16px_rgba(236,72,153,0.45)]">
              <div className="w-full h-full rounded-2xl bg-[#140528] flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  LingoLive
                </span>
                <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-pink-500/25 text-pink-300 rounded-full border border-pink-400/40">
                  CEFR
                </span>
              </div>
            </div>
          </div>

          {/* Primary View Segmented Navigation */}
          <nav className="flex items-center p-0.5 sm:p-1 rounded-2xl bg-white/[0.06] border border-white/12 backdrop-blur-xl shrink-0">
            <button
              onClick={() => onSelectView('chat')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'chat'
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)] border border-pink-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <MessageSquare className={`w-3.5 h-3.5 ${activeView === 'chat' ? 'text-pink-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Voice & Chat</span>
              <span className="lg:hidden">Chat</span>
            </button>

            <button
              onClick={() => onSelectView('learning-hub')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'learning-hub'
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)] border border-pink-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 ${activeView === 'learning-hub' ? 'text-cyan-300' : 'text-slate-400'}`} />
              <span>Academy</span>
            </button>

            <button
              onClick={() => onSelectView('mock-tests')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'mock-tests'
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)] border border-pink-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Award className={`w-3.5 h-3.5 ${activeView === 'mock-tests' ? 'text-amber-300' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Mock Exams</span>
              <span className="lg:hidden">Exams</span>
            </button>

            <button
              onClick={() => onSelectView('dashboard')}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-600/30 text-white shadow-[0_0_12px_rgba(236,72,153,0.3)] border border-pink-400/50'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className={`w-3.5 h-3.5 ${activeView === 'dashboard' ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="hidden lg:inline">Analytics</span>
              <span className="lg:hidden">Stats</span>
            </button>
          </nav>

          {/* Right Configuration Controls & Tools */}
          <div className="flex items-center gap-1 lg:gap-1.5 shrink-0">
            {/* Target Language Dropdown */}
            <div className="relative">
              <button
                id="language-select-dropdown"
                onClick={() => {
                  setLangDropdownOpen(!langDropdownOpen);
                  setLevelDropdownOpen(false);
                  setToolsDropdownOpen(false);
                }}
                className="flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
                title={`Target Language: ${currentLanguage.name}`}
              >
                <span className="text-base leading-none">{currentLanguage.flag}</span>
                <span className="hidden xl:inline">{currentLanguage.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLangDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-[#090D1E]/98 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.9)] py-1.5 z-50 animate-in fade-in zoom-in-95 max-h-[min(450px,calc(100vh-5.5rem))] overflow-y-auto">
                    <div className="px-3 py-1.5 border-b border-white/10 text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
                      Target Language
                    </div>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.id}
                        onClick={() => {
                          onSelectLanguage(lang);
                          setLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs transition-colors hover:bg-white/10 cursor-pointer min-h-[44px] ${
                          lang.id === currentLanguage.id ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg">{lang.flag}</span>
                          <div className="text-left">
                            <p className="font-bold text-white">{lang.name}</p>
                            <p className="text-[10px] text-slate-400">{lang.nativeName}</p>
                          </div>
                        </div>
                        {lang.id === currentLanguage.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Proficiency Level Dropdown Container */}
            <div className="relative">
              <button
                id="proficiency-level-dropdown"
                onClick={() => {
                  setLevelDropdownOpen(!levelDropdownOpen);
                  setLangDropdownOpen(false);
                  setToolsDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2 lg:px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  proficiencyLevel.includes('A0') || proficiencyLevel.includes('A1')
                    ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                    : proficiencyLevel.includes('A2') || proficiencyLevel.includes('B1')
                    ? 'border-purple-400/40 bg-purple-500/15 text-purple-300'
                    : 'border-pink-500/40 bg-pink-500/15 text-pink-300'
                }`}
                title={`Proficiency: ${proficiencyLevel}`}
              >
                <Layers className="w-3 h-3" />
                <span>{proficiencyLevel.split(' - ')[0]}</span>
                <ChevronDown className="w-3 h-3 opacity-70" />
              </button>

              {levelDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setLevelDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-2rem)] rounded-3xl bg-[#090D1E]/98 backdrop-blur-2xl border border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.95)] p-3 z-50 animate-in fade-in zoom-in-95 space-y-2.5 max-h-[min(520px,calc(100vh-5.5rem))] overflow-y-auto overscroll-contain">
                    <div className="px-2 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" />
                        <span>CEFR Progression</span>
                      </span>
                      <span className="text-slate-400">Locked by Exam</span>
                    </div>

                    {/* Level Promotion Progress Banner */}
                    {nextLevel && (
                      <div className="p-3 rounded-2xl bg-white/[0.04] border border-cyan-500/30 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-cyan-300 flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-amber-400" /> Unlock {nextLevel.split(' - ')[0]}
                          </span>
                          <span className="text-amber-400 font-bold">{readinessPercentage}% Readiness</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all"
                            style={{ width: `${readinessPercentage}%` }}
                          />
                        </div>
                        <button
                          onClick={() => {
                            setLevelDropdownOpen(false);
                            onOpenPromotionExam?.();
                          }}
                          className={`w-full py-2 px-3 rounded-xl text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                            isReadyForPromotion
                              ? 'bg-gradient-to-r from-amber-400 to-pink-400 hover:from-amber-300 hover:to-pink-300 animate-pulse'
                              : 'bg-gradient-to-r from-cyan-400 to-pink-400 hover:from-cyan-300 hover:to-pink-300'
                          }`}
                        >
                          <span>{isReadyForPromotion ? `Take ${proficiencyLevel.split(' - ')[0]} ➔ ${nextLevel.split(' - ')[0]} Exam Now!` : `Challenge ${nextLevel.split(' - ')[0]} Exam`}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    <div className="space-y-1">
                      {PROFICIENCY_LEVELS.map((level) => {
                        const levelCode = level.split(' - ')[0];
                        const isSelected = level === proficiencyLevel;
                        const isUnlocked = isLevelUnlocked(level, unlockedLevels);

                        return (
                          <button
                            key={level}
                            onClick={() => {
                              if (isUnlocked) {
                                onSelectProficiency(level);
                                setLevelDropdownOpen(false);
                              } else {
                                setLevelDropdownOpen(false);
                                onOpenPromotionExam?.();
                              }
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs text-left transition-all cursor-pointer min-h-[44px] ${
                              isSelected
                                ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-cyan-400/50 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                                : isUnlocked
                                ? 'hover:bg-white/10 text-slate-300'
                                : 'opacity-50 hover:opacity-80 hover:bg-white/5 text-slate-400'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                              <span
                                className={`font-black px-1.5 py-0.5 rounded text-[11px] shrink-0 ${
                                  isSelected
                                    ? 'bg-cyan-500 text-slate-950'
                                    : isUnlocked
                                    ? 'bg-white/10 text-white'
                                    : 'bg-white/5 text-slate-400'
                                }`}
                              >
                                {levelCode}
                              </span>
                              <span className="font-semibold text-slate-200 truncate">{level.split(' - ')[1]}</span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                              {!isUnlocked && (
                                <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                                  <Lock className="w-2.5 h-2.5 text-slate-400" />
                                  <span>Locked</span>
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {isA0 && (
                      <div className="pt-2 border-t border-white/10">
                        <button
                          onClick={() => {
                            onOpenBeginnerFoundations();
                            setLevelDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          <Compass className="w-3.5 h-3.5 text-pink-400" />
                          <span>Open A0 Zero-Knowledge Soundboard</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Collapsed Practice Tools Menu on medium screens (768px - 1279px) */}
            <div className="relative xl:hidden">
              <button
                id="header-tools-dropdown"
                onClick={() => {
                  setToolsDropdownOpen(!toolsDropdownOpen);
                  setLangDropdownOpen(false);
                  setLevelDropdownOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/12 text-xs font-bold text-slate-200 transition-all cursor-pointer shadow-sm"
                title="Practice Tools: Scenario, Phonetics & Vocabulary Deck"
              >
                <Wrench className="w-3.5 h-3.5 text-pink-400" />
                <span className="hidden lg:inline text-[11px]">Tools</span>
                {savedWordsCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
                )}
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {toolsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setToolsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 max-w-[calc(100vw-2rem)] rounded-2xl bg-[#090D1E]/98 backdrop-blur-2xl border border-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2 z-50 animate-in fade-in zoom-in-95 space-y-1.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-cyan-400 uppercase tracking-wider border-b border-white/10">
                      Practice Tools & Coach
                    </div>

                    {/* Scenario Option */}
                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        onOpenScenarioModal();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{currentScenario.icon}</span>
                        <div>
                          <p className="font-bold text-white text-xs">{currentScenario.title}</p>
                          <p className="text-[10px] text-slate-400">Scenario Practice ({completedGoalsCount}/{totalGoalsCount} goals)</p>
                        </div>
                      </div>
                      <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 text-[10px] font-mono font-bold">
                        {completedGoalsCount}/{totalGoalsCount}
                      </span>
                    </button>

                    {/* Phonetics Coach Option */}
                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        onOpenPronunciationCoach();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-white/[0.04] hover:bg-white/10 text-xs text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-pink-400" />
                        <div>
                          <p className="font-bold text-white text-xs">Phonetics Studio</p>
                          <p className="text-[10px] text-slate-400">Pronunciation & Accent Coach</p>
                        </div>
                      </div>
                    </button>

                    {/* Vocabulary Deck Option */}
                    <button
                      onClick={() => {
                        setToolsDropdownOpen(false);
                        onOpenVocabulary();
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-xs text-left transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-pink-400" />
                        <div>
                          <p className="font-bold text-pink-200 text-xs">Vocabulary Deck</p>
                          <p className="text-[10px] text-pink-300/80">Saved flashcards & drills</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500 text-slate-950 text-[10px] font-black">
                        {savedWordsCount}
                      </span>
                    </button>

                    {/* A0 Foundations */}
                    {isA0 && (
                      <button
                        onClick={() => {
                          setToolsDropdownOpen(false);
                          onOpenBeginnerFoundations();
                        }}
                        className="w-full flex items-center gap-2 p-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-300 text-xs font-semibold cursor-pointer"
                      >
                        <Compass className="w-4 h-4 text-cyan-400" />
                        <span>A0 Soundboard</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Desktop Promotion Exam Button (Large screens) */}
            {onOpenPromotionExam && nextLevel && (
              <button
                onClick={onOpenPromotionExam}
                className={`hidden 2xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isReadyForPromotion
                    ? 'border-amber-400/50 bg-gradient-to-r from-amber-500/25 to-pink-500/25 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse'
                    : 'border-white/10 bg-white/[0.04] hover:bg-white/10 text-slate-300'
                }`}
                title={`Take promotion exam to unlock ${nextLevel.split(' - ')[0]}`}
              >
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>{isReadyForPromotion ? 'Exam Ready!' : 'Promotion'}</span>
                <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-white/10 text-cyan-300 font-bold">
                  {proficiencyLevel.split(' - ')[0]}➔{nextLevel.split(' - ')[0]}
                </span>
              </button>
            )}

            {/* Scenario Button (Expanded on xl+) */}
            <button
              onClick={onOpenScenarioModal}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              title={`Scenario: ${currentScenario.title} (${completedGoalsCount}/${totalGoalsCount} goals)`}
            >
              <span className="text-sm">{currentScenario.icon}</span>
              <span className="hidden 2xl:inline max-w-[90px] truncate">{currentScenario.title}</span>
              <span className="px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono text-slate-300">
                {completedGoalsCount}/{totalGoalsCount}
              </span>
            </button>

            {/* Phonetics Quick Button (Expanded on xl+) */}
            <button
              onClick={onOpenPronunciationCoach}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 text-xs font-semibold text-slate-200 transition-colors cursor-pointer"
              title="Phonetics & Pronunciation Coach"
            >
              <Volume2 className="w-3.5 h-3.5 text-pink-400" />
              <span>Phonetics</span>
            </button>

            {/* Vocabulary Deck Button (Expanded on xl+) */}
            <button
              onClick={onOpenVocabulary}
              className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 text-xs font-semibold text-pink-300 transition-colors cursor-pointer"
              title={`Vocabulary Deck (${savedWordsCount} saved words)`}
            >
              <BookOpen className="w-3.5 h-3.5 text-pink-400" />
              <span className="font-bold">{savedWordsCount}</span>
            </button>

            {/* Interactive Streak Trigger */}
            <button
              onClick={onOpenStreakModal}
              className="flex items-center gap-1 px-2 lg:px-2.5 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-xs font-bold text-amber-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(245,158,11,0.2)]"
              title={`Daily Learning Streak: ${user?.streakDays ?? 0} days | Total Study Time: ${user?.totalStudyMinutes ?? 0} mins (Click to view)`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>{user?.streakDays ?? 0}d</span>
            </button>

            {/* Learner Account & Sync Button */}
            <button
              onClick={onOpenAuthModal}
              className={`flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                user
                  ? 'glass-card-neon border-pink-400/40 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:brightness-110'
                  : 'bg-gradient-to-r from-pink-500 to-cyan-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.4)] hover:brightness-110'
              }`}
              title="Learner Profile & Cloud Sync"
            >
              {user ? (
                <>
                  <span className="text-sm leading-none">{user.avatar}</span>
                  <span className="hidden lg:inline font-bold truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">Sign In</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Header Layout: Top Bar + Horizontally Scrollable Action Strip */}
        <div className="md:hidden flex flex-col gap-1.5 py-1 w-full max-w-full overflow-hidden">
          {/* Top row: Brand & High-level actions */}
          <div className="flex items-center justify-between gap-2 px-1 w-full min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-pink-500 via-rose-500 to-cyan-400 p-[1.5px] shadow-[0_0_12px_rgba(236,72,153,0.4)] shrink-0">
                <div className="w-full h-full rounded-xl bg-[#140528] flex items-center justify-center text-white">
                  <Sparkles className="w-3.5 h-3.5 text-pink-300 animate-pulse" />
                </div>
              </div>
              <span className="text-sm font-black tracking-tight text-white shrink-0">
                LingoLive
              </span>
              <span className="px-1.5 py-0.2 text-[8px] font-extrabold bg-pink-500/25 text-pink-300 rounded-full border border-pink-400/40 shrink-0">
                CEFR
              </span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Streak */}
              <button
                onClick={onOpenStreakModal}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-[11px] font-bold text-amber-300 shadow-xs cursor-pointer"
                title={`Streak: ${user?.streakDays ?? 0}d`}
              >
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
                <span>{user?.streakDays ?? 0}d</span>
              </button>

              {/* Profile */}
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gradient-to-r from-pink-500/30 to-purple-600/30 border border-pink-400/40 text-[11px] font-bold text-white shadow-xs cursor-pointer"
              >
                <span className="text-xs">{user?.avatar || '👤'}</span>
                <span className="text-[10px] truncate max-w-[50px]">{user ? user.name.split(' ')[0] : 'Profile'}</span>
              </button>
            </div>
          </div>

          {/* Bottom row: Touch-friendly Horizontally Scrollable Action Strip */}
          <div className="overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-1.5 py-1 px-0.5 w-full max-w-full touch-pan-x min-w-0">
            {/* Target Language Button */}
            <button
              id="mobile-language-select-dropdown"
              onClick={() => {
                setLangDropdownOpen(!langDropdownOpen);
                setLevelDropdownOpen(false);
              }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.08] active:bg-white/[0.15] border border-white/15 text-xs font-bold text-slate-100 shadow-xs shrink-0 min-h-[34px] cursor-pointer"
            >
              <span className="text-base">{currentLanguage.flag}</span>
              <span className="text-[11px] font-bold">{currentLanguage.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Proficiency Level Button */}
            <button
              id="mobile-proficiency-level-dropdown"
              onClick={() => {
                setLevelDropdownOpen(!levelDropdownOpen);
                setLangDropdownOpen(false);
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold shadow-xs shrink-0 min-h-[34px] cursor-pointer ${
                proficiencyLevel.includes('A0') || proficiencyLevel.includes('A1')
                  ? 'border-cyan-400/40 bg-cyan-500/15 text-cyan-300'
                  : proficiencyLevel.includes('A2') || proficiencyLevel.includes('B1')
                  ? 'border-purple-400/40 bg-purple-500/15 text-purple-300'
                  : 'border-pink-500/40 bg-pink-500/15 text-pink-300'
              }`}
            >
              <Layers className="w-3 h-3" />
              <span>{proficiencyLevel.split(' - ')[0]}</span>
              <ChevronDown className="w-3 h-3 opacity-70" />
            </button>

            {/* Mobile Promotion Exam Button (if ready or next level available) */}
            {onOpenPromotionExam && nextLevel && (
              <button
                onClick={onOpenPromotionExam}
                className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-[11px] font-bold shadow-xs shrink-0 min-h-[34px] cursor-pointer ${
                  isReadyForPromotion
                    ? 'border-amber-400/60 bg-gradient-to-r from-amber-500/30 to-pink-500/30 text-amber-300 animate-pulse'
                    : 'border-white/10 bg-white/[0.06] text-slate-300'
                }`}
              >
                <Award className="w-3 h-3 text-amber-400" />
                <span>Exam</span>
                <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-white/10 text-cyan-300">
                  {nextLevel.split(' - ')[0]}
                </span>
              </button>
            )}

            {/* Scenario Button */}
            <button
              onClick={onOpenScenarioModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.08] active:bg-white/[0.15] border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xs shrink-0 min-h-[34px] cursor-pointer"
            >
              <span className="text-xs">{currentScenario.icon}</span>
              <span className="max-w-[110px] truncate text-[11px]">{currentScenario.title}</span>
              <span className="px-1 py-0.2 rounded bg-white/10 text-[9px] font-mono text-pink-300 font-bold">
                {completedGoalsCount}/{totalGoalsCount}
              </span>
            </button>

            {/* Phonetics Quick Button */}
            <button
              onClick={onOpenPronunciationCoach}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.08] active:bg-white/[0.15] border border-white/15 text-[11px] font-semibold text-slate-200 shadow-xs shrink-0 min-h-[34px] cursor-pointer"
            >
              <Volume2 className="w-3 h-3 text-pink-400" />
              <span>Phonetics</span>
            </button>

            {/* Vocabulary Deck Button */}
            <button
              onClick={onOpenVocabulary}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-pink-500/20 active:bg-pink-500/30 border border-pink-500/40 text-[11px] font-semibold text-pink-300 shadow-xs shrink-0 min-h-[34px] cursor-pointer"
            >
              <BookOpen className="w-3 h-3 text-pink-400" />
              <span className="font-bold">{savedWordsCount} words</span>
            </button>
          </div>

          {/* Mobile Language Selector Modal */}
          {langDropdownOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
                onClick={() => setLangDropdownOpen(false)}
              />
              <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#090D1E] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-4 space-y-3 max-h-[80vh] overflow-y-auto animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-black text-white">Select Target Language</h3>
                    <p className="text-[10px] text-slate-400">Instant immersion calibration</p>
                  </div>
                  <button
                    onClick={() => setLangDropdownOpen(false)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-1">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        onSelectLanguage(lang);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer min-h-[44px] ${
                        lang.id === currentLanguage.id ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/40' : 'text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{lang.flag}</span>
                        <div className="text-left">
                          <p className="font-bold text-white">{lang.name}</p>
                          <p className="text-[10px] text-slate-400">{lang.nativeName}</p>
                        </div>
                      </div>
                      {lang.id === currentLanguage.id && <CheckCircle2 className="w-4 h-4 text-cyan-400" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Mobile CEFR Level Drawer / Modal */}
          {levelDropdownOpen && (
            <div className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm -z-10"
                onClick={() => setLevelDropdownOpen(false)}
              />
              <div className="w-full max-w-sm rounded-t-3xl sm:rounded-3xl bg-[#090D1E] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.95)] p-4 space-y-3 max-h-[82vh] overflow-y-auto animate-in slide-in-from-bottom-5">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-cyan-400" />
                      <span>CEFR Proficiency Level</span>
                    </h3>
                    <p className="text-[10px] text-slate-400">Higher levels locked by Exam</p>
                  </div>
                  <button
                    onClick={() => setLevelDropdownOpen(false)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Level Promotion Progress Banner */}
                {nextLevel && (
                  <div className="p-3 rounded-2xl bg-white/[0.04] border border-cyan-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-cyan-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" /> Unlock {nextLevel.split(' - ')[0]}
                      </span>
                      <span className="text-amber-400 font-bold">{readinessPercentage}% Ready</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all"
                        style={{ width: `${readinessPercentage}%` }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        setLevelDropdownOpen(false);
                        onOpenPromotionExam?.();
                      }}
                      className={`w-full py-2.5 px-3 rounded-xl text-slate-950 font-black text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md ${
                        isReadyForPromotion
                          ? 'bg-gradient-to-r from-amber-400 to-pink-400 text-slate-950 font-black animate-pulse'
                          : 'bg-gradient-to-r from-cyan-400 to-pink-400 text-slate-950'
                      }`}
                    >
                      <span>{isReadyForPromotion ? `Take ${proficiencyLevel.split(' - ')[0]} ➔ ${nextLevel.split(' - ')[0]} Exam Now!` : `Challenge ${nextLevel.split(' - ')[0]} Exam`}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <div className="space-y-1">
                  {PROFICIENCY_LEVELS.map((level) => {
                    const levelCode = level.split(' - ')[0];
                    const isSelected = level === proficiencyLevel;
                    const isUnlocked = isLevelUnlocked(level, unlockedLevels);

                    return (
                      <button
                        key={level}
                        onClick={() => {
                          if (isUnlocked) {
                            onSelectProficiency(level);
                            setLevelDropdownOpen(false);
                          } else {
                            setLevelDropdownOpen(false);
                            onOpenPromotionExam?.();
                          }
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-2xl text-xs text-left transition-all cursor-pointer min-h-[44px] ${
                          isSelected
                            ? 'bg-gradient-to-r from-pink-500/20 to-cyan-500/20 border border-cyan-400/50 text-white font-bold shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                            : isUnlocked
                            ? 'hover:bg-white/10 text-slate-300'
                            : 'opacity-50 hover:opacity-80 hover:bg-white/5 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
                          <span
                            className={`font-black px-1.5 py-0.5 rounded text-[11px] shrink-0 ${
                              isSelected
                                ? 'bg-cyan-500 text-slate-950'
                                : isUnlocked
                                ? 'bg-white/10 text-white'
                                : 'bg-white/5 text-slate-400'
                            }`}
                          >
                            {levelCode}
                          </span>
                          <span className="font-semibold text-slate-200 truncate">{level.split(' - ')[1]}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                          {!isUnlocked && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                              <Lock className="w-2.5 h-2.5 text-slate-400" />
                              <span>Locked</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {isA0 && (
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        onOpenBeginnerFoundations();
                        setLevelDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 p-2 rounded-xl bg-pink-500/20 active:bg-pink-500/30 text-pink-300 border border-pink-500/30 text-xs font-semibold cursor-pointer"
                    >
                      <Compass className="w-3.5 h-3.5 text-pink-400" />
                      <span>Open A0 Zero-Knowledge Soundboard</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
