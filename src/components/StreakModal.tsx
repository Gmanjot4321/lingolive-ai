import React, { useState } from 'react';
import {
  Flame,
  Shield,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  X,
  Zap,
  Clock,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  Plus,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile } from '../types';
import {
  calculateStreak,
  getWeekCalendarDays,
  formatDateKey,
  hasCheckedInToday,
} from '../utils/streakManager';

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onClaimMilestone?: (days: number, xp: number) => void;
  onPurchaseFreeze?: () => void;
  onOpenPractice?: () => void;
  onQuickCheckIn?: () => void;
}

export const StreakModal: React.FC<StreakModalProps> = ({
  isOpen,
  onClose,
  user,
  onClaimMilestone,
  onPurchaseFreeze,
  onOpenPractice,
  onQuickCheckIn,
}) => {
  const [freezeMessage, setFreezeMessage] = useState<string | null>(null);
  const [justCheckedIn, setJustCheckedIn] = useState(false);

  if (!isOpen) return null;

  const todayKey = formatDateKey();
  const streakCalc = calculateStreak(user);
  const currentStreak = streakCalc.currentStreak;
  const longestStreak = Math.max(streakCalc.longestStreak, currentStreak);
  const practicedToday = streakCalc.practicedToday;

  const studyMinutesToday = user?.dailyStudyMinutes?.[todayKey] || 0;
  const totalStudyMinutes = user?.totalStudyMinutes || 0;
  const dailyGoalMinutes = user?.dailyGoalMinutes || 15;
  const goalMet = studyMinutesToday >= dailyGoalMinutes;

  const weekDays = getWeekCalendarDays(user);
  const freezeCount = streakCalc.freezeCount;
  const alreadyCheckedInToday = hasCheckedInToday(user);

  const claimedMilestones = new Set(user?.claimedMilestones || []);

  const milestones = [
    { days: 3, label: '3-Day Spark', xp: 50, xpText: '+50 XP', icon: '⚡' },
    { days: 7, label: '7-Day Flame', xp: 150, xpText: '+150 XP', icon: '🔥' },
    { days: 14, label: '14-Day Polyglot Blaze', xp: 350, xpText: '+350 XP', icon: '🏆' },
    { days: 30, label: '30-Day Language Master', xp: 1000, xpText: '+1,000 XP', icon: '👑' },
  ];

  const handleClaim = (days: number, xp: number) => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#ec4899', '#f59e0b', '#06b6d4'],
      });
    } catch {}
    onClaimMilestone?.(days, xp);
  };

  const handleBuyFreeze = () => {
    if (!user) return;
    if ((user.streakFreezeCount ?? 0) >= 2) {
      setFreezeMessage('You already have the max capacity of 2 Freeze Shields.');
      return;
    }
    if (user.xp < 100) {
      setFreezeMessage('You need at least 100 XP to purchase a Streak Freeze Shield.');
      return;
    }
    onPurchaseFreeze?.();
    setFreezeMessage('Streak Freeze Shield successfully acquired!');
    setTimeout(() => setFreezeMessage(null), 3500);
  };

  const activeDaysThisWeek = weekDays.filter((d) => d.hasPracticed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="glass-card-neon bg-[#140528]/95 rounded-3xl max-w-lg w-full p-5 sm:p-7 shadow-[0_20px_60px_rgba(236,72,153,0.35)] border border-pink-500/30 text-white animate-in zoom-in-95 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-pink-500/20">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 p-[1.5px] shadow-[0_0_20px_rgba(244,63,94,0.4)]">
              <div className="w-full h-full rounded-2xl bg-[#140528] flex items-center justify-center text-amber-400">
                <Flame className="w-6 h-6 fill-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base sm:text-lg text-white">Daily Learning Streak</h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-[10px] font-extrabold text-amber-300">
                  REAL-TIME
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-pink-200/70">
                Continuous daily practice reinforces neurological recall
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Streak Main Display Banner */}
        <div className="mt-4 p-5 rounded-3xl bg-gradient-to-r from-amber-500/20 via-rose-500/25 to-pink-600/20 border border-amber-400/40 shadow-[0_0_30px_rgba(245,158,11,0.25)] text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-inner mb-2">
              <Flame className="w-8 h-8 fill-amber-400 text-amber-300 animate-bounce [animation-duration:3s]" />
            </div>
            
            <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {currentStreak > 0 ? (
                <span>{currentStreak} {currentStreak === 1 ? 'Day' : 'Days'} on Fire!</span>
              ) : (
                <span className="text-slate-200">0 Days — Ready to Ignite!</span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-1">
              <span className="text-[11px] font-semibold text-amber-300/90">
                Personal Best: <strong className="text-white font-black">{longestStreak}d</strong>
              </span>
              <span className="text-amber-400/50">•</span>
              <span className="text-[11px] font-semibold text-amber-300/90">
                Total Study: <strong className="text-white font-black">{totalStudyMinutes}m</strong>
              </span>
              <span className="text-amber-400/50">•</span>
              <span className="text-[11px] font-semibold text-amber-300/90">
                {practicedToday ? 'Secured Today ✓' : 'Practice Needed Today'}
              </span>
            </div>

            <p className="text-xs text-amber-100/90 mt-2 max-w-sm leading-relaxed">
              {practicedToday
                ? "You've practiced today! Your streak is secured and safely counted."
                : currentStreak > 0
                ? "Your streak is active! Complete any conversation, lesson, or quiz today to keep it burning."
                : "Start your streak today! Complete any conversation, voice session, or lesson to begin."}
            </p>
          </div>
        </div>

        {/* 7-Day Real Weekly Tracker */}
        <div className="mt-4 p-4 rounded-2xl glass-card border border-white/10">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300 mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-pink-400" />
              <span>Current Week's Schedule</span>
            </div>
            <span className="text-[11px] text-pink-300">
              {activeDaysThisWeek} of 7 days completed
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {weekDays.map((day, idx) => {
              const isToday = day.isToday;
              const hasPracticed = day.hasPracticed;
              const hasFreeze = day.hasFreeze;

              return (
                <div
                  key={idx}
                  className={`p-2 sm:p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative ${
                    hasPracticed
                      ? 'bg-amber-500/25 border-amber-400/50 text-amber-200 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                      : hasFreeze
                      ? 'bg-cyan-500/25 border-cyan-400/50 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : isToday
                      ? 'bg-pink-500/20 border-pink-400/60 text-pink-300 ring-2 ring-pink-500/30'
                      : day.isPast
                      ? 'bg-white/[0.02] border-white/5 text-slate-500'
                      : 'bg-white/[0.04] border-white/10 text-slate-400'
                  }`}
                >
                  {isToday && (
                    <span className="absolute -top-2 px-1 rounded bg-pink-500 text-[8px] font-black text-white uppercase tracking-wider">
                      Today
                    </span>
                  )}
                  
                  <span className="text-[10px] font-bold">{day.dayName}</span>
                  <span className="text-[9px] opacity-70 leading-none">{day.dayNumber}</span>

                  <div className="mt-0.5">
                    {hasPracticed ? (
                      <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ) : hasFreeze ? (
                      <Shield className="w-3.5 h-3.5 text-cyan-300 fill-cyan-400/40" />
                    ) : isToday ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-pink-400 animate-spin [animation-duration:6s]" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-slate-600/50" />
                    )}
                  </div>

                  {day.studyMinutes > 0 && (
                    <span className="text-[8px] font-mono text-amber-300/80 leading-none mt-0.5">
                      {day.studyMinutes}m
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Target & Streak Freeze Protection */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Daily Study Time */}
          <div className="p-3.5 rounded-2xl glass-card border border-pink-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-pink-300 mb-1">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pink-400" />
                  <span>Today's Study Time</span>
                </div>
                {goalMet && (
                  <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-400/30">
                    Goal Met ✓
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-xl font-black text-white">{studyMinutesToday}</span>
                <span className="text-xs text-slate-400">/ {dailyGoalMinutes} mins</span>
              </div>
              <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-pink-500 via-rose-500 to-amber-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.round((studyMinutesToday / dailyGoalMinutes) * 100))}%` }}
                />
              </div>
            </div>

            {/* Quick Check-in Button (Strictly 1x per day limit) */}
            {onQuickCheckIn && (
              <div className="mt-2.5">
                <button
                  disabled={alreadyCheckedInToday}
                  onClick={() => {
                    if (alreadyCheckedInToday) return;
                    try {
                      confetti({
                        particleCount: 40,
                        spread: 60,
                        origin: { y: 0.6 },
                        colors: ['#ec4899', '#06b6d4', '#f59e0b'],
                      });
                    } catch {}
                    setJustCheckedIn(true);
                    onQuickCheckIn();
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all ${
                    alreadyCheckedInToday || justCheckedIn
                      ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-300 cursor-default shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                      : 'bg-pink-500/20 hover:bg-pink-500/30 border-pink-400/40 text-pink-200 cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(236,72,153,0.2)]'
                  }`}
                  title={
                    alreadyCheckedInToday
                      ? 'Daily check-in completed for today (1/1). Resets tomorrow at midnight.'
                      : 'Log 2 minutes of practice: secures streak, earns +20 XP (available 1x per day)'
                  }
                >
                  {alreadyCheckedInToday || justCheckedIn ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Daily Check-In Done ✓ (1/1 Used)</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3 text-pink-300 shrink-0" />
                      <span>Quick Practice Check-In (+2m, +20 XP • 1x Daily)</span>
                    </>
                  )}
                </button>
                {alreadyCheckedInToday && (
                  <p className="text-[10px] text-slate-400 text-center mt-1">
                    Daily check-in used. Resets at midnight to prevent streak loopholes.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Streak Freeze Shield */}
          <div className="p-3.5 rounded-2xl glass-card border border-cyan-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300 mb-1">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Freeze Shield</span>
                </div>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold border ${
                  freezeCount > 0
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}>
                  {freezeCount > 0 ? `${freezeCount} Active` : '0 Active'}
                </span>
              </div>

              <p className="text-[11px] text-slate-300 mt-1">
                {freezeCount > 0
                  ? `Protects your ${currentStreak}-day streak automatically if you miss a single day.`
                  : 'You have no active shields. Missed days will reset your streak.'}
              </p>
            </div>

            {/* Purchase Shield button if < 2 */}
            {freezeCount < 2 && onPurchaseFreeze && (
              <button
                onClick={handleBuyFreeze}
                className="mt-2.5 w-full py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all"
              >
                <Zap className="w-3 h-3 text-cyan-300" />
                <span>Get Shield (100 XP)</span>
              </button>
            )}
          </div>
        </div>

        {freezeMessage && (
          <div className="mt-3 p-2.5 rounded-xl bg-cyan-500/15 border border-cyan-400/40 text-xs text-cyan-200 text-center font-medium animate-in fade-in">
            {freezeMessage}
          </div>
        )}

        {/* Streak Milestones with Real XP Claiming */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Streak Milestones & XP Rewards</span>
            <span className="text-[10px] text-pink-300 font-mono">
              {claimedMilestones.size} / {milestones.length} Claimed
            </span>
          </div>
          
          <div className="space-y-1.5">
            {milestones.map((m, i) => {
              const isEligible = currentStreak >= m.days;
              const isClaimed = claimedMilestones.has(m.days);

              return (
                <div
                  key={i}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between transition-all ${
                    isClaimed
                      ? 'bg-amber-500/10 border-amber-400/30 text-amber-200/80'
                      : isEligible
                      ? 'bg-gradient-to-r from-amber-500/25 via-pink-500/20 to-amber-500/25 border-amber-400/60 text-white shadow-[0_0_15px_rgba(245,158,11,0.2)] ring-1 ring-amber-400/30'
                      : 'bg-white/[0.03] border-white/10 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{m.icon}</span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{m.label}</span>
                        {isEligible && !isClaimed && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        )}
                      </div>
                      <div className="text-[10px] text-amber-300 font-medium">{m.xpText}</div>
                    </div>
                  </div>

                  <div>
                    {isClaimed ? (
                      <span className="px-2.5 py-1 rounded-lg bg-white/10 text-slate-400 text-[10px] font-bold">
                        Claimed ✓
                      </span>
                    ) : isEligible ? (
                      <button
                        onClick={() => handleClaim(m.days, m.xp)}
                        className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-pink-500 hover:from-amber-300 hover:to-pink-400 text-slate-950 font-black text-[11px] shadow-[0_0_12px_rgba(245,158,11,0.5)] transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Claim Reward!</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {m.days - currentStreak} days left
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button Footer */}
        <div className="mt-5 pt-4 border-t border-pink-500/20 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenPractice?.();
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-xs font-bold shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Practice Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
