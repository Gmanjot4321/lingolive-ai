import React, { useEffect, useRef, useState } from 'react';
import {
  Flame,
  Sparkles,
  Trophy,
  Zap,
  CheckCircle2,
  Calendar,
  Shield,
  ArrowRight,
  Share2,
  Volume2,
  X,
  Star,
  Award,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { UserProfile, LanguageOption } from '../types';
import { formatDateKey, getWeekCalendarDays } from '../utils/streakManager';

interface StreakCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  currentLanguage?: LanguageOption;
  onOpenStreakModal?: () => void;
  streakDays?: number;
  dailyGoalMinutes?: number;
  studyMinutesToday?: number;
  bonusXp?: number;
}

/**
 * Play an uplifting celebratory arpeggio chime using the Web Audio API
 */
function playCelebrationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const startTime = ctx.currentTime + 0.05;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime + idx * 0.1);

      gain.gain.setValueAtTime(0, startTime + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, startTime + idx * 0.1 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + idx * 0.1 + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime + idx * 0.1);
      osc.stop(startTime + idx * 0.1 + 0.7);
    });
  } catch (e) {
    // Audio may be blocked by autoplay policies
  }
}

/**
 * Launch multi-wave celebration confetti
 */
function triggerCelebrationConfetti() {
  try {
    // Wave 1: Center blast
    confetti({
      particleCount: 70,
      spread: 100,
      origin: { y: 0.55, x: 0.5 },
      colors: ['#f59e0b', '#ec4899', '#8b5cf6', '#10b981', '#38bdf8'],
      ticks: 250,
      gravity: 0.9,
    });

    // Wave 2: Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 70,
        origin: { x: 0.15, y: 0.75 },
        colors: ['#fbbf24', '#f43f5e', '#a855f7'],
      });
    }, 200);

    // Wave 3: Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 70,
        origin: { x: 0.85, y: 0.75 },
        colors: ['#38bdf8', '#fbbf24', '#ec4899'],
      });
    }, 380);
  } catch (e) {
    console.warn('Confetti launch error:', e);
  }
}

export const StreakCelebrationModal: React.FC<StreakCelebrationModalProps> = ({
  isOpen,
  onClose,
  user,
  currentLanguage,
  onOpenStreakModal,
  streakDays = 1,
  dailyGoalMinutes = 15,
  studyMinutesToday = 15,
  bonusXp = 25,
}) => {
  const [animatedStreak, setAnimatedStreak] = useState<number>(Math.max(1, streakDays));
  const hasTriggeredRef = useRef(false);

  const effectiveStreak = Math.max(1, user?.streakDays || streakDays);
  const effectiveGoal = user?.dailyGoalMinutes || dailyGoalMinutes || 15;
  const todayKey = formatDateKey();
  const effectiveStudyToday = user?.dailyStudyMinutes?.[todayKey] || studyMinutesToday || effectiveGoal;

  const weekDays = getWeekCalendarDays(user);

  useEffect(() => {
    if (isOpen) {
      hasTriggeredRef.current = true;
      playCelebrationChime();
      triggerCelebrationConfetti();

      // Number count-up animation
      setAnimatedStreak(Math.max(1, effectiveStreak - 1));
      const timer = setTimeout(() => {
        setAnimatedStreak(effectiveStreak);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [isOpen, effectiveStreak]);

  if (!isOpen) return null;

  // Language specific praise
  const getLanguagePraise = () => {
    const lang = (currentLanguage?.name || user?.targetLanguage || 'Spanish').toLowerCase();
    if (lang.includes('spanish')) return '¡Excelente trabajo! Has cumplido tu meta de hoy.';
    if (lang.includes('french')) return 'Bravo ! Vous avez atteint votre objectif quotidien.';
    if (lang.includes('german')) return 'Hervorragend! Dein Tagesziel ist erreicht.';
    if (lang.includes('italian')) return 'Fantastico! Hai raggiunto il tuo obiettivo giornaliero.';
    if (lang.includes('japanese')) return '素晴らしい！今日の目標を達成しました。';
    if (lang.includes('mandarin') || lang.includes('chinese')) return '太棒了！你已经完成了今天的每日目标。';
    if (lang.includes('korean')) return '대단해요! 오늘의 일일 목표를 달성했습니다.';
    return 'Outstanding commitment! You crushed your daily fluency goal today.';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
        {/* Glow backdrop aura */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-br from-amber-500/30 via-pink-500/25 to-purple-600/30 blur-3xl rounded-full animate-pulse" />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 300 }}
          className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-amber-500/30 shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-white my-auto p-6 sm:p-7"
        >
          {/* Ambient Sunburst Rays behind the flame */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 pointer-events-none opacity-40">
            <div className="w-full h-full bg-gradient-radial from-amber-400/40 via-pink-500/20 to-transparent rounded-full animate-spin" style={{ animationDuration: '24s' }} />
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer z-20"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Top Pill: Goal Achieved */}
          <div className="flex justify-center mb-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-400/40 text-amber-300 text-xs font-black tracking-wider uppercase shadow-inner"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Daily Goal Completed!</span>
            </motion.div>
          </div>

          {/* Center Fiery Flame Avatar & Streak Count */}
          <div className="relative flex flex-col items-center justify-center my-3 text-center">
            {/* Pulsing Flame Ring */}
            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-pink-500 p-1 shadow-[0_0_40px_rgba(245,158,11,0.5)] flex items-center justify-center mb-4"
            >
              <div className="w-full h-full rounded-[22px] bg-slate-950/90 backdrop-blur-sm flex flex-col items-center justify-center relative overflow-hidden">
                {/* Floating embers */}
                <div className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent pointer-events-none" />
                
                <Flame className="w-14 h-14 sm:w-16 sm:h-16 text-amber-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.8)] fill-amber-400/20" />
                
                {/* Streak Number Badge Overlay */}
                <div className="absolute -bottom-2 bg-gradient-to-r from-amber-500 to-rose-500 px-3 py-0.5 rounded-full text-white font-black text-xs shadow-md border border-white/20 flex items-center gap-1">
                  <span>DAY</span>
                  <span className="text-sm font-extrabold">{effectiveStreak}</span>
                </div>
              </div>
            </motion.div>

            {/* Streak Headline */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-1"
            >
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                <span>{effectiveStreak} Day Streak!</span>
                <span className="text-2xl">🔥</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xs font-medium">
                {getLanguagePraise()}
              </p>
            </motion.div>
          </div>

          {/* Goal & Bonus Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="grid grid-cols-2 gap-2.5 my-4.5"
          >
            {/* Goal Metric */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Goal Met</p>
                <p className="text-xs font-extrabold text-white truncate">
                  {effectiveStudyToday} / {effectiveGoal} mins
                </p>
              </div>
            </div>

            {/* Bonus XP Metric */}
            <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Streak Reward</p>
                <p className="text-xs font-extrabold text-amber-300 truncate">
                  +{bonusXp} XP Boost
                </p>
              </div>
            </div>
          </motion.div>

          {/* 7-Day Mini Calendar Ribbon */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="p-3 rounded-2xl bg-white/[0.03] border border-white/8 mb-5"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300">
                <Calendar className="w-3.5 h-3.5 text-pink-400" />
                <span>This Week's Activity</span>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Locked in today
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {weekDays.map((day) => {
                const isPracticed = day.hasPracticed || day.isToday;
                return (
                  <div
                    key={day.dateStr}
                    className={`flex flex-col items-center justify-center py-2 rounded-xl text-center transition-all ${
                      day.isToday
                        ? 'bg-gradient-to-b from-amber-500/30 to-pink-500/30 border border-amber-400/50 shadow-sm'
                        : isPracticed
                        ? 'bg-emerald-500/15 border border-emerald-500/25 text-emerald-300'
                        : 'bg-white/[0.02] border border-white/5 text-slate-500'
                    }`}
                  >
                    <span className="text-[9px] font-bold mb-1 opacity-80">{day.dayName}</span>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black">
                      {isPracticed ? (
                        <Flame className={`w-3.5 h-3.5 ${day.isToday ? 'text-amber-400 fill-amber-400' : 'text-emerald-400 fill-emerald-400'}`} />
                      ) : (
                        <span className="text-slate-600">{day.dayNumber}</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="space-y-2"
          >
            {/* Primary Action Button */}
            <button
              onClick={() => {
                triggerCelebrationConfetti();
                setTimeout(() => {
                  onClose();
                }, 400);
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-pink-600 hover:from-amber-400 hover:to-pink-500 text-white font-black text-sm shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Claim Streak Bonus & Continue</span>
            </button>

            {/* Secondary Action: View Streak Milestones */}
            {onOpenStreakModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStreakModal();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>View Streak Milestones & Shield</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            )}
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
