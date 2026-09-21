import { UserProfile } from '../types';

export const STORAGE_USER_PROFILE = 'lingolive_user_profile';

/**
 * Format a local date object to 'YYYY-MM-DD' string
 */
export const formatDateKey = (d: Date = new Date()): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date string offset by days
 */
export const getPastDateKey = (daysAgo: number, baseDate: Date = new Date()): string => {
  const d = new Date(baseDate);
  d.setDate(d.getDate() - daysAgo);
  return formatDateKey(d);
};

export interface WeekCalendarDay {
  dateStr: string;
  dayName: string; // 'Mon', 'Tue', etc.
  dayNumber: number; // 1 - 31
  monthName: string;
  isToday: boolean;
  isPast: boolean;
  isFuture: boolean;
  hasPracticed: boolean;
  hasFreeze: boolean;
  studyMinutes: number;
  status: 'completed' | 'freeze' | 'pending' | 'missed' | 'upcoming';
}

export interface StreakCalculationResult {
  currentStreak: number;
  longestStreak: number;
  practicedToday: boolean;
  practicedYesterday: boolean;
  freezeActiveToday: boolean;
  freezeCount: number;
  freezeUsedDates: string[];
}

/**
 * Accurately calculate consecutive days streak from calendar dates
 */
export const calculateStreak = (
  profile: Partial<UserProfile> | null,
  referenceDate: Date = new Date()
): StreakCalculationResult => {
  if (!profile) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      practicedToday: false,
      practicedYesterday: false,
      freezeActiveToday: false,
      freezeCount: 1,
      freezeUsedDates: [],
    };
  }

  const todayKey = formatDateKey(referenceDate);
  const yesterdayKey = getPastDateKey(1, referenceDate);

  const activeDates = new Set<string>(profile.activeDates || []);
  const freezeDates = new Set<string>(profile.streakFreezeUsedDates || []);
  let availableFreezes = profile.streakFreezeCount ?? 1;

  const practicedToday = activeDates.has(todayKey);
  const practicedYesterday = activeDates.has(yesterdayKey);
  const freezeUsedYesterday = freezeDates.has(yesterdayKey);

  // If user hasn't practiced today, but practiced yesterday or used freeze yesterday:
  // Streak is alive and waiting for today's practice.
  // If user also didn't practice yesterday:
  // Can streak freeze protect yesterday?
  if (!practicedToday && !practicedYesterday && !freezeUsedYesterday) {
    const twoDaysAgoKey = getPastDateKey(2, referenceDate);
    const practicedTwoDaysAgo = activeDates.has(twoDaysAgoKey);

    if (practicedTwoDaysAgo && availableFreezes > 0) {
      // Auto-apply freeze to protect yesterday
      availableFreezes--;
      freezeDates.add(yesterdayKey);
    }
  }

  // Count consecutive days backwards
  // Starting anchor: today if practiced today, else yesterday
  let anchorOffset = practicedToday ? 0 : 1;
  let streak = 0;

  // If not practiced today and yesterday was neither practiced nor protected by freeze, streak is 0
  const yesterdayProtected = practicedYesterday || freezeDates.has(yesterdayKey);
  if (!practicedToday && !yesterdayProtected) {
    streak = 0;
  } else {
    // Count consecutive active or freeze days
    for (let i = anchorOffset; i < 365; i++) {
      const dateKey = getPastDateKey(i, referenceDate);
      if (activeDates.has(dateKey) || freezeDates.has(dateKey)) {
        streak++;
      } else if (availableFreezes > 0 && i > 0 && activeDates.has(getPastDateKey(i + 1, referenceDate))) {
        // A single gap that can be covered by an unused freeze
        availableFreezes--;
        freezeDates.add(dateKey);
        streak++;
      } else {
        break;
      }
    }
  }

  const longestStreak = Math.max(profile.longestStreak || 0, streak);

  return {
    currentStreak: streak,
    longestStreak,
    practicedToday,
    practicedYesterday,
    freezeActiveToday: freezeDates.has(todayKey),
    freezeCount: availableFreezes,
    freezeUsedDates: Array.from(freezeDates),
  };
};

export const computeLeague = (xp: number): 'Bronze' | 'Silver' | 'Gold' | 'Diamond' => {
  if (xp >= 3000) return 'Diamond';
  if (xp >= 1500) return 'Gold';
  if (xp >= 600) return 'Silver';
  return 'Bronze';
};

export const createCleanDefaultProfile = (existing?: Partial<UserProfile> | null): UserProfile => {
  const xp = typeof existing?.xp === 'number' && existing.xp !== 835 && existing.xp !== 680 && existing.xp !== 50 ? existing.xp : 0;
  return {
    id: existing?.id || `user-${Date.now()}`,
    name: existing?.name || 'Polyglot Learner',
    email: existing?.email || 'learner@lingolive.ai',
    avatar: existing?.avatar || '🦊',
    targetLanguage: existing?.targetLanguage || 'Spanish',
    proficiencyLevel: existing?.proficiencyLevel || 'A0 - Absolute Beginner (Zero Knowledge)',
    unlockedLevels: existing?.unlockedLevels || ['A0 - Absolute Beginner (Zero Knowledge)'],
    passedPromotionExams: existing?.passedPromotionExams || [],
    levelPracticeCounts: existing?.levelPracticeCounts || {},
    xp,
    streakDays: 0,
    longestStreak: 0,
    lastActiveDate: new Date().toISOString(),
    activeDates: [],
    dailyStudyMinutes: {},
    totalStudyMinutes: 0,
    skillStats: existing?.skillStats || {
      speakingCount: 0,
      speakingMinutes: 0,
      listeningCount: 0,
      listeningMinutes: 0,
      readingCount: 0,
      readingMinutes: 0,
      writingCount: 0,
      writingMinutes: 0,
    },
    streakFreezeCount: 1,
    streakFreezeUsedDates: [],
    claimedMilestones: [],
    dailyGoalMinutes: 15,
    league: computeLeague(xp),
    achievements: ['Welcome to LingoLive'],
  };
};

/**
 * Initialize or migrate a user profile to guarantee starting from 0 XP and accurate streak.
 * Purges legacy seeds (835 XP, 680 XP, 4 days streak, etc.).
 */
export const migrateOrInitializeProfile = (existing: UserProfile | null): UserProfile => {
  const PURGE_KEY = 'lingolive_streak_zero_reset_v13';
  const XP_ZERO_START_KEY = 'lingolive_xp_start_zero_v5';

  // If there's no existing profile, initialize fresh with 0 XP and 0 streak
  if (!existing) {
    try {
      localStorage.setItem(PURGE_KEY, 'true');
      localStorage.setItem(XP_ZERO_START_KEY, 'true');
    } catch {}
    const fresh = createCleanDefaultProfile();
    try {
      localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(fresh));
    } catch {}
    return fresh;
  }

  // Detect if existing profile needs clean zero-XP baseline migration
  const needsXPZeroStart = !localStorage.getItem(XP_ZERO_START_KEY) || existing.xp === 835 || existing.xp === 680 || existing.xp === 50;

  // Detect if existing profile contains the legacy mock streak template data
  const hasLegacyDummySeed =
    !localStorage.getItem(PURGE_KEY) ||
    existing.streakDays === 4 ||
    existing.totalStudyMinutes === 20 ||
    existing.totalStudyMinutes === 65 ||
    (existing.activeDates && existing.activeDates.length === 4 && existing.totalStudyMinutes === 20);

  if (hasLegacyDummySeed || needsXPZeroStart) {
    try {
      localStorage.setItem(PURGE_KEY, 'true');
      localStorage.setItem(XP_ZERO_START_KEY, 'true');
    } catch {}
    const rawXP = needsXPZeroStart ? 0 : (typeof existing.xp === 'number' ? existing.xp : 0);
    const cleansed: UserProfile = {
      ...existing,
      streakDays: hasLegacyDummySeed ? 0 : (existing.streakDays || 0),
      longestStreak: hasLegacyDummySeed ? 0 : (existing.longestStreak || 0),
      activeDates: hasLegacyDummySeed ? [] : (existing.activeDates || []),
      dailyStudyMinutes: hasLegacyDummySeed ? {} : (existing.dailyStudyMinutes || {}),
      totalStudyMinutes: hasLegacyDummySeed ? 0 : (existing.totalStudyMinutes || 0),
      skillStats: existing.skillStats || {
        speakingCount: 0,
        speakingMinutes: 0,
        listeningCount: 0,
        listeningMinutes: 0,
        readingCount: 0,
        readingMinutes: 0,
        writingCount: 0,
        writingMinutes: 0,
      },
      streakFreezeUsedDates: hasLegacyDummySeed ? [] : (existing.streakFreezeUsedDates || []),
      claimedMilestones: hasLegacyDummySeed ? [] : (existing.claimedMilestones || []),
      xp: rawXP,
      league: computeLeague(rawXP),
    };
    try {
      localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(cleansed));
    } catch {}
    return cleansed;
  }

  // For genuine profiles, calculate streak strictly from actual practice
  const dailyStudyMinutes = existing.dailyStudyMinutes || {};
  // Only consider dates where study time was genuinely recorded (> 0)
  const activeDates = (existing.activeDates || []).filter(
    (dKey) => typeof dailyStudyMinutes[dKey] === 'number' && dailyStudyMinutes[dKey] > 0
  );

  const totalStudyMinutes = Object.values(dailyStudyMinutes).reduce(
    (acc, m) => acc + (typeof m === 'number' && m > 0 ? m : 0),
    0
  );

  const calculation = calculateStreak({
    ...existing,
    activeDates,
    streakFreezeCount: existing.streakFreezeCount ?? 1,
    streakFreezeUsedDates: existing.streakFreezeUsedDates || [],
    longestStreak: existing.longestStreak || 0,
  });

  const currentXP = typeof existing.xp === 'number' ? existing.xp : 0;

  const verified: UserProfile = {
    ...existing,
    xp: currentXP,
    league: computeLeague(currentXP),
    streakDays: calculation.currentStreak,
    longestStreak: Math.max(calculation.longestStreak, calculation.currentStreak),
    activeDates,
    dailyStudyMinutes,
    totalStudyMinutes,
    skillStats: existing.skillStats || {
      speakingCount: 0,
      speakingMinutes: 0,
      listeningCount: 0,
      listeningMinutes: 0,
      readingCount: 0,
      readingMinutes: 0,
      writingCount: 0,
      writingMinutes: 0,
    },
    streakFreezeCount: calculation.freezeCount,
    streakFreezeUsedDates: calculation.freezeUsedDates,
    claimedMilestones: existing.claimedMilestones || [],
    dailyGoalMinutes: existing.dailyGoalMinutes || 15,
    unlockedLevels: existing.unlockedLevels || ['A0 - Absolute Beginner (Zero Knowledge)'],
    passedPromotionExams: existing.passedPromotionExams || [],
    levelPracticeCounts: existing.levelPracticeCounts || {},
  };

  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(verified));
  } catch {}

  return verified;
};

export type SkillIncrement =
  | 'speaking'
  | 'listening'
  | 'reading'
  | 'writing'
  | {
      speaking?: number;
      listening?: number;
      reading?: number;
      writing?: number;
    };

/**
 * Record study activity, update streak + XP, and track granular 4-skill activity dynamically
 */
export const recordStudyActivity = (
  profile: UserProfile,
  minutesToAdd: number = 2,
  xpToAdd: number = 10,
  skillIncrement?: SkillIncrement
): {
  updatedProfile: UserProfile;
  streakIncreased: boolean;
  goalMetJustNow: boolean;
} => {
  const todayKey = formatDateKey();
  const currentDailyMinutes = profile.dailyStudyMinutes?.[todayKey] || 0;
  const newDailyMinutes = currentDailyMinutes + minutesToAdd;
  const dailyGoal = profile.dailyGoalMinutes || 15;

  const previouslyMet = currentDailyMinutes >= dailyGoal;
  const goalMetJustNow = !previouslyMet && newDailyMinutes >= dailyGoal;

  // Add today to active dates if not already present
  const activeDatesSet = new Set(profile.activeDates || []);
  const wasAlreadyActiveToday = activeDatesSet.has(todayKey);
  activeDatesSet.add(todayKey);

  const updatedDailyMinutes = {
    ...(profile.dailyStudyMinutes || {}),
    [todayKey]: newDailyMinutes,
  };

  // Update granular 4-skill stats
  const existingSkillStats = profile.skillStats || {
    speakingCount: 0,
    speakingMinutes: 0,
    listeningCount: 0,
    listeningMinutes: 0,
    readingCount: 0,
    readingMinutes: 0,
    writingCount: 0,
    writingMinutes: 0,
  };

  const updatedSkillStats = { ...existingSkillStats };

  if (typeof skillIncrement === 'string') {
    if (skillIncrement === 'speaking') {
      updatedSkillStats.speakingCount = (updatedSkillStats.speakingCount || 0) + 1;
      updatedSkillStats.speakingMinutes = (updatedSkillStats.speakingMinutes || 0) + minutesToAdd;
    } else if (skillIncrement === 'listening') {
      updatedSkillStats.listeningCount = (updatedSkillStats.listeningCount || 0) + 1;
      updatedSkillStats.listeningMinutes = (updatedSkillStats.listeningMinutes || 0) + minutesToAdd;
    } else if (skillIncrement === 'reading') {
      updatedSkillStats.readingCount = (updatedSkillStats.readingCount || 0) + 1;
      updatedSkillStats.readingMinutes = (updatedSkillStats.readingMinutes || 0) + minutesToAdd;
    } else if (skillIncrement === 'writing') {
      updatedSkillStats.writingCount = (updatedSkillStats.writingCount || 0) + 1;
      updatedSkillStats.writingMinutes = (updatedSkillStats.writingMinutes || 0) + minutesToAdd;
    }
  } else if (skillIncrement && typeof skillIncrement === 'object') {
    if (skillIncrement.speaking) {
      updatedSkillStats.speakingCount = (updatedSkillStats.speakingCount || 0) + skillIncrement.speaking;
      updatedSkillStats.speakingMinutes = (updatedSkillStats.speakingMinutes || 0) + minutesToAdd;
    }
    if (skillIncrement.listening) {
      updatedSkillStats.listeningCount = (updatedSkillStats.listeningCount || 0) + skillIncrement.listening;
      updatedSkillStats.listeningMinutes = (updatedSkillStats.listeningMinutes || 0) + (skillIncrement.speaking ? 0 : minutesToAdd);
    }
    if (skillIncrement.reading) {
      updatedSkillStats.readingCount = (updatedSkillStats.readingCount || 0) + skillIncrement.reading;
    }
    if (skillIncrement.writing) {
      updatedSkillStats.writingCount = (updatedSkillStats.writingCount || 0) + skillIncrement.writing;
      updatedSkillStats.writingMinutes = (updatedSkillStats.writingMinutes || 0) + (skillIncrement.speaking ? 0 : minutesToAdd);
    }
  }

  // Re-calculate streak
  const tempProfile: Partial<UserProfile> = {
    ...profile,
    activeDates: Array.from(activeDatesSet),
  };
  const calculation = calculateStreak(tempProfile);

  const streakIncreased = !wasAlreadyActiveToday && calculation.currentStreak > profile.streakDays;
  const newXP = Math.max(0, (profile.xp || 0) + xpToAdd);

  const updatedProfile: UserProfile = {
    ...profile,
    xp: newXP,
    league: computeLeague(newXP),
    streakDays: calculation.currentStreak,
    longestStreak: calculation.longestStreak,
    lastActiveDate: new Date().toISOString(),
    activeDates: Array.from(activeDatesSet),
    dailyStudyMinutes: updatedDailyMinutes,
    totalStudyMinutes: (profile.totalStudyMinutes || 0) + minutesToAdd,
    skillStats: updatedSkillStats,
    streakFreezeCount: calculation.freezeCount,
    streakFreezeUsedDates: calculation.freezeUsedDates,
  };

  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updatedProfile));
  } catch {}

  return {
    updatedProfile,
    streakIncreased,
    goalMetJustNow,
  };
};

/**
 * Generates the 7 days of the current calendar week (Monday to Sunday)
 */
export const getWeekCalendarDays = (
  profile: UserProfile | null,
  referenceDate: Date = new Date()
): WeekCalendarDay[] => {
  const todayKey = formatDateKey(referenceDate);
  const activeDates = new Set(profile?.activeDates || []);
  const freezeDates = new Set(profile?.streakFreezeUsedDates || []);
  const dailyMinutes = profile?.dailyStudyMinutes || {};

  // Find Monday of the current week
  // Sunday is 0 in JS, so adjust so Monday is index 0
  const dayOfWeek = referenceDate.getDay(); // 0 is Sunday, 1 is Monday...
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

  const monday = new Date(referenceDate);
  monday.setDate(monday.getDate() + distanceToMonday);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const days: WeekCalendarDay[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);

    const dateStr = formatDateKey(d);
    const isToday = dateStr === todayKey;
    const isPast = dateStr < todayKey;
    const isFuture = dateStr > todayKey;
    const hasPracticed = activeDates.has(dateStr);
    const hasFreeze = freezeDates.has(dateStr);
    const minutes = dailyMinutes[dateStr] || 0;

    let status: WeekCalendarDay['status'] = 'upcoming';
    if (hasPracticed) {
      status = 'completed';
    } else if (hasFreeze) {
      status = 'freeze';
    } else if (isToday) {
      status = 'pending';
    } else if (isPast) {
      status = 'missed';
    }

    days.push({
      dateStr,
      dayName: dayLabels[i],
      dayNumber: d.getDate(),
      monthName: monthNames[d.getMonth()],
      isToday,
      isPast,
      isFuture,
      hasPracticed,
      hasFreeze,
      studyMinutes: minutes,
      status,
    });
  }

  return days;
};

/**
 * Claim a milestone XP reward
 */
export const claimMilestoneReward = (
  profile: UserProfile,
  milestoneDays: number,
  xpReward: number
): UserProfile => {
  const currentClaimed = new Set(profile.claimedMilestones || []);
  if (currentClaimed.has(milestoneDays)) return profile;

  currentClaimed.add(milestoneDays);
  const newXP = Math.max(0, (profile.xp || 0) + xpReward);
  const updated: UserProfile = {
    ...profile,
    xp: newXP,
    league: computeLeague(newXP),
    claimedMilestones: Array.from(currentClaimed),
  };

  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updated));
  } catch {}

  return updated;
};

/**
 * Purchase a streak freeze with XP
 */
export const purchaseStreakFreeze = (
  profile: UserProfile,
  xpCost: number = 100
): { success: boolean; updatedProfile: UserProfile; message: string } => {
  const currentCount = profile.streakFreezeCount ?? 0;
  if (currentCount >= 2) {
    return {
      success: false,
      updatedProfile: profile,
      message: 'You already have the maximum number of shields (2).',
    };
  }

  if (profile.xp < xpCost) {
    return {
      success: false,
      updatedProfile: profile,
      message: `Not enough XP. You need ${xpCost} XP to acquire a shield.`,
    };
  }

  const newXP = Math.max(0, (profile.xp || 0) - xpCost);
  const updated: UserProfile = {
    ...profile,
    xp: newXP,
    league: computeLeague(newXP),
    streakFreezeCount: currentCount + 1,
  };

  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updated));
  } catch {}

  return {
    success: true,
    updatedProfile: updated,
    message: 'Streak Freeze Shield acquired! You are protected against missed days.',
  };
};

/**
 * Checks if the user has already performed their once-per-day quick check-in today
 */
export const hasCheckedInToday = (profile: Partial<UserProfile> | null): boolean => {
  if (!profile) return false;
  const todayKey = formatDateKey();
  return profile.lastCheckInDate === todayKey;
};

/**
 * Performs a single daily quick check-in (restricted strictly to once per calendar day)
 */
export const performQuickCheckIn = (
  profile: UserProfile
): {
  success: boolean;
  message: string;
  updatedProfile?: UserProfile;
  alreadyCheckedInToday?: boolean;
} => {
  const todayKey = formatDateKey();
  if (profile.lastCheckInDate === todayKey) {
    return {
      success: false,
      message: 'You have already completed your daily check-in today! Resets tomorrow at midnight.',
      alreadyCheckedInToday: true,
      updatedProfile: profile,
    };
  }

  const { updatedProfile } = recordStudyActivity(profile, 2, 20, {
    speaking: 1,
    listening: 1,
    reading: 1,
    writing: 1,
  });

  const finalProfile: UserProfile = {
    ...updatedProfile,
    lastCheckInDate: todayKey,
  };

  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(finalProfile));
  } catch {}

  return {
    success: true,
    message: 'Checked in for today! (+2m study time, +20 XP)',
    updatedProfile: finalProfile,
    alreadyCheckedInToday: false,
  };
};

/**
 * Resets user XP to 0 and returns to Bronze Tier
 */
export const resetUserXP = (profile: UserProfile): UserProfile => {
  const updated: UserProfile = {
    ...profile,
    xp: 0,
    league: 'Bronze',
  };
  try {
    localStorage.setItem(STORAGE_USER_PROFILE, JSON.stringify(updated));
  } catch {}
  return updated;
};
