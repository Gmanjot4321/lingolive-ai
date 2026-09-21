import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  Flame,
  BookOpen,
  Headphones,
  PenTool,
  Mic,
  Clock,
  Sparkles,
  ChevronRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  MessageSquare,
  User,
  Layers,
  GraduationCap,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { LanguageOption, MockTestResult, ProficiencyLevel, UserProfile } from '../types';
import { getWeekCalendarDays } from '../utils/streakManager';

export interface PerformanceDashboardProps {
  currentLanguage: LanguageOption;
  proficiencyLevel: ProficiencyLevel;
  savedWordsCount: number;
  completedGoalsCount?: number;
  totalGoalsCount?: number;
  mockTestHistory: MockTestResult[];
  studyMinutes?: number;
  userMessagesCount?: number;
  streakDays?: number;
  user?: UserProfile | null;
  onNavigateToMockTests: () => void;
  onNavigateToChat: () => void;
  onClearTestHistory?: () => void;
  onOpenStreakModal?: () => void;
}

export const PerformanceDashboardView: React.FC<PerformanceDashboardProps> = ({
  currentLanguage,
  proficiencyLevel,
  savedWordsCount,
  completedGoalsCount = 0,
  totalGoalsCount = 4,
  mockTestHistory = [],
  studyMinutes = 0,
  userMessagesCount = 0,
  streakDays = 0,
  user,
  onNavigateToMockTests,
  onNavigateToChat,
  onClearTestHistory,
  onOpenStreakModal,
}) => {
  const [activeSkillTab, setActiveSkillTab] = useState<'all' | 'speaking' | 'listening' | 'reading' | 'writing'>('all');

  const hasCompletedExams = mockTestHistory && mockTestHistory.length > 0;
  const latestExam = hasCompletedExams ? mockTestHistory[0] : null;
  const hasActivity = studyMinutes > 0 || userMessagesCount > 0 || savedWordsCount > 0;

  // Level-specific benchmarks
  const getLevelTarget = (level: string) => {
    if (level.includes('A0')) return { targetScore: 30, vocabGoal: 100, label: 'A0 Beginner' };
    if (level.includes('A1')) return { targetScore: 45, vocabGoal: 300, label: 'A1 Elementary' };
    if (level.includes('A2')) return { targetScore: 60, vocabGoal: 600, label: 'A2 Pre-Intermediate' };
    if (level.includes('B1')) return { targetScore: 75, vocabGoal: 1200, label: 'B1 Intermediate' };
    if (level.includes('B2')) return { targetScore: 88, vocabGoal: 2500, label: 'B2 Upper Intermediate' };
    if (level.includes('C1')) return { targetScore: 95, vocabGoal: 4000, label: 'C1 Advanced' };
    return { targetScore: 70, vocabGoal: 1000, label: level.split(' - ')[0] };
  };

  const levelTarget = getLevelTarget(proficiencyLevel);

  // Skill radar values: verified from official exam, or calculated strictly from real interactive practice (starts at 0% if unassessed)
  const skills = user?.skillStats || {
    speakingCount: 0,
    speakingMinutes: 0,
    listeningCount: 0,
    listeningMinutes: 0,
    readingCount: 0,
    readingMinutes: 0,
    writingCount: 0,
    writingMinutes: 0,
  };

  const effectiveWritingTurns = Math.max(userMessagesCount, skills.writingCount || 0);
  const effectiveReadingTurns = Math.max(userMessagesCount, skills.readingCount || 0);
  const effectiveSpeakingTurns = skills.speakingCount || 0;
  const effectiveListeningTurns = skills.listeningCount || 0;

  const dynamicSpeakingScore = effectiveSpeakingTurns > 0
    ? Math.min(100, Math.round(effectiveSpeakingTurns * 8 + (skills.speakingMinutes || 0) * 3))
    : 0;

  const dynamicListeningScore = effectiveListeningTurns > 0
    ? Math.min(100, Math.round(effectiveListeningTurns * 8 + (skills.listeningMinutes || 0) * 3))
    : 0;

  const dynamicReadingScore = (effectiveReadingTurns > 0 || savedWordsCount > 0)
    ? Math.min(100, Math.round(effectiveReadingTurns * 4 + savedWordsCount * 4 + (skills.readingMinutes || 0) * 2))
    : 0;

  const dynamicWritingScore = effectiveWritingTurns > 0
    ? Math.min(100, Math.round(effectiveWritingTurns * 5 + (skills.writingMinutes || 0) * 2))
    : 0;

  const skillRadarData = latestExam
    ? [
        { 
          skill: 'Speaking', 
          score: Math.round((latestExam.speakingScore / 25) * 100), 
          fullMark: 100,
          detail: `${latestExam.speakingScore}/25 on Mock Exam`,
          verified: true
        },
        { 
          skill: 'Listening', 
          score: Math.round((latestExam.listeningScore / 25) * 100), 
          fullMark: 100,
          detail: `${latestExam.listeningScore}/25 on Mock Exam`,
          verified: true
        },
        { 
          skill: 'Reading', 
          score: Math.round((latestExam.readingScore / 25) * 100), 
          fullMark: 100,
          detail: `${latestExam.readingScore}/25 on Mock Exam`,
          verified: true
        },
        { 
          skill: 'Writing', 
          score: Math.round((latestExam.writingScore / 25) * 100), 
          fullMark: 100,
          detail: `${latestExam.writingScore}/25 on Mock Exam`,
          verified: true
        },
      ]
    : hasActivity
    ? [
        { 
          skill: 'Speaking', 
          score: dynamicSpeakingScore, 
          fullMark: 100,
          detail: effectiveSpeakingTurns > 0 ? `${effectiveSpeakingTurns} spoken voice turns` : '0 voice inputs (mic unused)',
          verified: false
        },
        { 
          skill: 'Listening', 
          score: dynamicListeningScore, 
          fullMark: 100,
          detail: effectiveListeningTurns > 0 ? `${effectiveListeningTurns} audio clips listened` : '0 audio clips played',
          verified: false
        },
        { 
          skill: 'Reading', 
          score: dynamicReadingScore, 
          fullMark: 100,
          detail: `${effectiveReadingTurns} replies read • ${savedWordsCount} vocab cards`,
          verified: false
        },
        { 
          skill: 'Writing', 
          score: dynamicWritingScore, 
          fullMark: 100,
          detail: `${effectiveWritingTurns} written messages composed`,
          verified: false
        },
      ]
    : [
        { skill: 'Speaking', score: 0, fullMark: 100, detail: 'Unassessed (0%)', verified: false },
        { skill: 'Listening', score: 0, fullMark: 100, detail: 'Unassessed (0%)', verified: false },
        { skill: 'Reading', score: 0, fullMark: 100, detail: 'Unassessed (0%)', verified: false },
        { skill: 'Writing', score: 0, fullMark: 100, detail: 'Unassessed (0%)', verified: false },
      ];

  // Daily activity distribution based on actual tracked study time from user history
  const weekDays = getWeekCalendarDays(user || null);
  const activityData = weekDays.map((d) => ({
    day: d.isToday ? `${d.dayName}*` : d.dayName,
    minutes: d.studyMinutes,
    messages: d.studyMinutes > 0 ? Math.max(1, Math.round(d.studyMinutes * 1.4)) : 0,
  }));

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 pb-24 md:pb-8">
      
      {/* Real User Profile & CEFR Progression Header (Sleek Glassmorphic with Neon Glows) */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl glass-card-neon p-4 sm:p-6 md:p-8">
        
        {/* Ambient neon pink and cyan atmospheric glow spots */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-cyan-500/20 via-pink-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-pink-500/15 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
          <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
            {/* User Avatar with 3D glowing ring */}
            <div className="relative shrink-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-cyan-400 p-[2px] shadow-[0_0_25px_rgba(244,63,94,0.4)]">
                <div className="w-full h-full rounded-2xl bg-[#090D1E] flex items-center justify-center text-white">
                  <User className="w-7 h-7 sm:w-8 sm:h-8 text-cyan-300" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-cyan-500 text-[10px] font-extrabold text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                {currentLanguage.flag}
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white truncate">
                  Learner Dashboard
                </h1>
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold bg-pink-500/20 text-pink-300 rounded-full border border-pink-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                  {currentLanguage.name} • {proficiencyLevel.split(' - ')[0]}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-snug">
                Real-time fluency progression, verified CEFR metrics, and vocabulary retention
              </p>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full md:w-auto">
            <button
              onClick={onNavigateToChat}
              className="px-4 py-2.5 rounded-xl glass-pill hover:bg-white/10 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-cyan-400" />
              <span>Continue Conversation</span>
            </button>
            <button
              onClick={onNavigateToMockTests}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-white" />
              <span>{hasCompletedExams ? 'Take New Exam' : 'Take Diagnostic Exam'}</span>
            </button>
          </div>
        </div>

        {/* 4 Core Real Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 sm:mt-8">
          
          {/* Metric 1: Total Study Time */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-cyan-500/20 hover:border-cyan-400/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Total Study Time</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white">{studyMinutes}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">minutes</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-cyan-300">
              <Zap className="w-3 h-3 shrink-0" />
              <span className="truncate">Active study time</span>
            </div>
          </div>

          {/* Metric 2: Real Conversations & Turns */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-pink-500/20 hover:border-pink-400/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Messages Sent</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 shrink-0">
                <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white">{userMessagesCount}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">turns</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-pink-300 truncate">
              <TrendingUp className="w-3 h-3 shrink-0" />
              <span className="truncate">Interactive practice</span>
            </div>
          </div>

          {/* Metric 3: Saved Vocabulary Flashcards */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-purple-500/20 hover:border-purple-400/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">Vocabulary Bank</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-white">{savedWordsCount}</span>
              <span className="text-[11px] sm:text-xs text-slate-400">cards saved</span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-purple-300 truncate">
              <CheckCircle2 className="w-3 h-3 shrink-0" />
              <span className="truncate">Goal: {levelTarget.vocabGoal} words</span>
            </div>
          </div>

          {/* Metric 4: CEFR Exam Readiness */}
          <div className="p-3.5 sm:p-4 rounded-2xl glass-card border border-emerald-500/20 hover:border-emerald-400/40 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] sm:text-xs font-semibold text-slate-400">CEFR Benchmark</span>
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>
            <div className="mt-2.5 sm:mt-3 flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-2xl font-extrabold text-white">
                {latestExam ? `${latestExam.overallScore}%` : 'Uncertified'}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400">
                {latestExam ? latestExam.cefrLevel.split(' - ')[0] : '0 Exams'}
              </span>
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-300 truncate">
              <ShieldCheck className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {hasCompletedExams ? `${mockTestHistory.length} ${mockTestHistory.length === 1 ? 'exam' : 'exams'} certified` : 'Diagnostic needed'}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* Main Analytics Grid: 4-Skill Radar & Fluency Activity Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Left Column: 4-Skill Radar Analysis (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl sm:rounded-3xl glass-card-neon p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <Award className="w-4 h-4 text-cyan-400" />
                  <span>CEFR 4-Skill Balance</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  {hasCompletedExams
                    ? 'Verified from your latest mock exam'
                    : hasActivity
                    ? 'Estimated from interactive practice'
                    : 'Unassessed — complete an exam or start practicing to measure skills'}
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border shrink-0 ${
                hasCompletedExams 
                  ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' 
                  : hasActivity
                  ? 'bg-purple-500/15 text-purple-300 border-purple-500/30'
                  : 'bg-slate-500/15 text-slate-300 border-slate-500/30'
              }`}>
                {hasCompletedExams ? 'Certified' : hasActivity ? 'Activity-based' : 'Unassessed (0%)'}
              </span>
            </div>

            {/* Radar Visualizer */}
            <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={skillRadarData}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.15)" />
                  <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="rgba(255, 255, 255, 0.2)" tick={{ fill: '#64748b', fontSize: 8 }} />
                  <Radar
                    name="Mastery"
                    dataKey="score"
                    stroke="#00f0ff"
                    fill="#00f0ff"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>

              {!hasCompletedExams && !hasActivity && (
                <div className="absolute inset-0 bg-[#090D1E]/80 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center p-4 text-center">
                  <span className="text-xs font-bold text-white mb-1">0% Baseline • Unassessed</span>
                  <p className="text-[11px] text-slate-400 max-w-xs mb-3">
                    Take a diagnostic exam or start a conversation to assess your CEFR 4-skill balance.
                  </p>
                  <button
                    onClick={onNavigateToMockTests}
                    className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-sm"
                  >
                    Take Diagnostic Exam
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Skill Breakdown List */}
          <div className="grid grid-cols-2 gap-2 pt-3 sm:pt-4 border-t border-white/10">
            {skillRadarData.map((item) => {
              const Icon =
                item.skill === 'Speaking'
                  ? Mic
                  : item.skill === 'Listening'
                  ? Headphones
                  : item.skill === 'Reading'
                  ? BookOpen
                  : PenTool;

              const skillColor =
                item.skill === 'Speaking'
                  ? 'text-pink-400'
                  : item.skill === 'Listening'
                  ? 'text-cyan-400'
                  : item.skill === 'Reading'
                  ? 'text-purple-400'
                  : 'text-emerald-400';

              return (
                <div key={item.skill} className="p-2 sm:p-2.5 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col justify-between gap-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] sm:text-xs text-slate-300 font-semibold flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${skillColor}`} />
                      <span>{item.skill}</span>
                    </span>
                    <span className={`text-[11px] sm:text-xs font-black ${item.score > 0 ? skillColor : 'text-slate-500'}`}>
                      {item.score}%
                    </span>
                  </div>
                  {item.detail && (
                    <span className="text-[10px] text-slate-400 truncate leading-tight">
                      {item.detail}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Fluency Progression Area Chart (7 Cols) */}
        <div className="lg:col-span-7 rounded-2xl sm:rounded-3xl glass-card-neon p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4 gap-2">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-pink-400" />
                  <span>Weekly Study Pacing</span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                  Daily active study minutes in {currentLanguage.name}
                </p>
              </div>
              <button
                onClick={onOpenStreakModal}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/15 hover:bg-pink-500/25 border border-pink-500/30 text-pink-300 text-xs font-bold shrink-0 transition-all cursor-pointer"
                title="View and adjust streak"
              >
                <Flame className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                <span>{streakDays}d Streak</span>
              </button>
            </div>

            {/* Area Chart */}
            <div className="w-full h-56 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 19, 36, 0.95)',
                      borderColor: 'rgba(255, 255, 255, 0.15)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '11px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="minutes"
                    name="Study Minutes"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorMinutes)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 sm:pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span className="text-[11px] sm:text-xs">Aim for 15–20 minutes daily for rapid neural retention.</span>
            <button
              onClick={onNavigateToChat}
              className="text-pink-400 hover:text-pink-300 font-bold flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <span>Practice Now</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Verified Mock Exams History Section */}
      <div className="rounded-2xl sm:rounded-3xl glass-card-neon p-4 sm:p-6 md:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-cyan-400" />
              <span>Official CEFR Diagnostic History</span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Comprehensive 4-skill mock assessments taken on LingoLive
            </p>
          </div>
          <div className="flex items-center gap-2 self-stretch sm:self-auto">
            {hasCompletedExams && onClearTestHistory && (
              <button
                onClick={() => {
                  if (window.confirm('Reset all diagnostic exam history? This will clear all recorded mock test results.')) {
                    onClearTestHistory();
                  }
                }}
                className="px-3 py-2 sm:py-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/10 hover:border-rose-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
                title="Clear exam history to start fresh"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset History</span>
              </button>
            )}
            <button
              onClick={onNavigateToMockTests}
              className="px-3.5 py-2 sm:py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial shadow-sm"
            >
              <span>Launch Exam</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {hasCompletedExams ? (
          <div className="space-y-3">
            {mockTestHistory.map((test) => (
              <div
                key={test.id}
                className="p-3.5 sm:p-4 rounded-2xl glass-card border border-white/10 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-white text-xs sm:text-sm">{test.testTitle}</span>
                    <span className="px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 text-[10px] sm:text-[11px] font-bold border border-cyan-500/30">
                      {test.cefrLevel.split(' - ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-400 mt-1 flex-wrap">
                    <span>{test.targetLanguage}</span>
                    <span>•</span>
                    <span>{new Date(test.completedAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{test.overallScore}% Overall</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:flex sm:items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-300">
                    <Mic className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{test.speakingScore}/25</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-300">
                    <Headphones className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>{test.listeningScore}/25</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>{test.readingScore}/25</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start gap-1 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[11px] sm:text-xs text-slate-300">
                    <PenTool className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                    <span>{test.writingScore}/25</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-2xl border border-dashed border-white/15 text-center flex flex-col items-center justify-center bg-white/[0.02]">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No Mock Exams Taken Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mt-1 mb-4 leading-relaxed">
              Take a comprehensive 15-minute diagnostic exam across Listening, Reading, Writing, and Speaking to establish your certified CEFR baseline score and personalized radar chart.
            </p>
            <button
              onClick={onNavigateToMockTests}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-xs font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all cursor-pointer"
            >
              Start {proficiencyLevel.split(' - ')[0]} Diagnostic Exam
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
