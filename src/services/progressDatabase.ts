import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile, SavedWord, MockTestResult, ProficiencyLevel } from '../types';

export interface AuthResponse {
  success: boolean;
  profile?: UserProfile;
  error?: string;
  message?: string;
}

/**
 * Send 6-digit OTP verification code to email
 */
export async function sendVerificationOtp(email: string, purpose: 'signup' | 'signin' = 'signup'): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to send verification code.' };
    }

    return {
      success: true,
      message: data.message,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error sending verification code.' };
  }
}

/**
 * Verify OTP and Complete Profile Registration
 */
export async function verifyOtpAndSignUp(params: {
  email: string;
  otp: string;
  name: string;
  password: string;
  avatar?: string;
  targetLanguage?: string;
  proficiencyLevel?: ProficiencyLevel;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/verify-otp-and-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Verification failed.' };
    }

    if (data.profile) {
      try {
        localStorage.setItem('lingolive_user_profile', JSON.stringify(data.profile));
      } catch (e) {}
    }

    return { success: true, profile: data.profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during verification.' };
  }
}

/**
 * Register a new user profile with Name, Email, Password
 */
export async function signUpUser(params: {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  targetLanguage?: string;
  proficiencyLevel?: ProficiencyLevel;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Failed to create profile.' };
    }

    if (data.profile) {
      try {
        localStorage.setItem('lingolive_user_profile', JSON.stringify(data.profile));
      } catch (e) {}
    }

    return { success: true, profile: data.profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during sign up.' };
  }
}

/**
 * Sign into existing user profile with Email and Password
 */
export async function signInUser(params: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  try {
    const res = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return { success: false, error: data.error || 'Invalid credentials.' };
    }

    if (data.profile) {
      try {
        localStorage.setItem('lingolive_user_profile', JSON.stringify(data.profile));
      } catch (e) {}
    }

    return { success: true, profile: data.profile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Network error during sign in.' };
  }
}

/**
 * Save user profile to Supabase database (with local storage & server-side caching)
 */
export async function saveUserProfileToDb(profile: UserProfile): Promise<boolean> {
  if (!profile || !profile.id) return false;

  // 1. Always update localStorage cache
  try {
    localStorage.setItem('lingolive_user_profile', JSON.stringify(profile));
  } catch (e) {
    console.error('Local cache save failed:', e);
  }

  // 2. Persist to server-side database
  try {
    fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile),
    }).catch((e) => console.warn('Server profile sync non-blocking notice:', e));
  } catch (e) {
    console.warn('Failed triggering server profile sync:', e);
  }

  // 3. Persist directly to Supabase if configured
  if (!isSupabaseConfigured() || !supabase) {
    return true;
  }

  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert(
        {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          avatar: profile.avatar,
          target_language: profile.targetLanguage,
          proficiency_level: profile.proficiencyLevel,
          unlocked_levels: profile.unlockedLevels || ['A0 - Absolute Beginner (Zero Knowledge)'],
          passed_promotion_exams: profile.passedPromotionExams || [],
          level_practice_counts: profile.levelPracticeCounts || {},
          xp: profile.xp,
          streak_days: profile.streakDays,
          last_active_date: profile.lastActiveDate,
          last_check_in_date: profile.lastCheckInDate,
          active_dates: profile.activeDates || [],
          daily_study_minutes: profile.dailyStudyMinutes || {},
          total_study_minutes: profile.totalStudyMinutes || 0,
          streak_freeze_count: profile.streakFreezeCount || 1,
          streak_freeze_used_dates: profile.streakFreezeUsedDates || [],
          claimed_milestones: profile.claimedMilestones || [],
          league: profile.league,
          achievements: profile.achievements || [],
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

    if (error) {
      // If table is not created yet in Supabase SQL editor, the app gracefully falls back to localStorage and server DB
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Load user profile from Supabase Database by userId or email
 */
export async function loadUserProfileFromDb(userIdOrEmail?: string): Promise<UserProfile | null> {
  if (!userIdOrEmail) {
    return loadLocalProfile();
  }

  // 1. Try Supabase if configured
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('user_profiles').select('*');
      if (userIdOrEmail.includes('@')) {
        query = query.eq('email', userIdOrEmail.toLowerCase().trim());
      } else {
        query = query.eq('id', userIdOrEmail);
      }

      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          avatar: data.avatar,
          targetLanguage: data.target_language,
          proficiencyLevel: data.proficiency_level as ProficiencyLevel,
          unlockedLevels: data.unlocked_levels,
          passedPromotionExams: data.passed_promotion_exams,
          levelPracticeCounts: data.level_practice_counts,
          xp: data.xp === 835 || data.xp === 680 ? 0 : (data.xp || 0),
          streakDays: data.streak_days,
          lastActiveDate: data.last_active_date,
          activeDates: data.active_dates,
          dailyStudyMinutes: data.daily_study_minutes,
          totalStudyMinutes: data.total_study_minutes,
          streakFreezeCount: data.streak_freeze_count,
          streakFreezeUsedDates: data.streak_freeze_used_dates,
          claimedMilestones: data.claimed_milestones,
          league: data.league || 'Bronze',
          achievements: data.achievements,
        };
      }
    } catch (err) {
      console.warn('Failed to query Supabase profile:', err);
    }
  }

  // 2. Try Server DB API
  try {
    const res = await fetch(`/api/profile/${encodeURIComponent(userIdOrEmail)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.profile) {
        const p = json.profile;
        return {
          ...p,
          xp: p.xp === 835 || p.xp === 680 ? 0 : (p.xp || 0),
          league: p.xp >= 3000 ? 'Diamond' : p.xp >= 1500 ? 'Gold' : p.xp >= 600 ? 'Silver' : 'Bronze',
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch profile from server DB:', err);
  }

  return loadLocalProfile();
}

/**
 * Look up user profile specifically by email
 */
export async function loadUserProfileByEmail(email: string): Promise<UserProfile | null> {
  if (!email || !email.includes('@')) return null;
  return loadUserProfileFromDb(email.toLowerCase().trim());
}

export function loadLocalProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem('lingolive_user_profile');
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      if (parsed && parsed.name && parsed.name !== 'Polyglot Learner') {
        return {
          ...parsed,
          xp: parsed.xp === 835 || parsed.xp === 680 ? 0 : (parsed.xp || 0),
          league: parsed.xp >= 3000 ? 'Diamond' : parsed.xp >= 1500 ? 'Gold' : parsed.xp >= 600 ? 'Silver' : 'Bronze',
        };
      }
    }
  } catch (e) {
    console.error('Failed reading localStorage profile:', e);
  }
  return null;
}

/**
 * Save vocabulary word to Supabase (and local storage)
 */
export async function saveVocabularyToDb(userId: string, word: SavedWord): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('saved_vocabulary').upsert(
      {
        id: word.id,
        user_id: userId,
        word: word.word,
        translation: word.translation,
        phonetic: word.phonetic,
        context_sentence: word.contextSentence,
        mastery_level: word.masteryLevel,
        review_count: word.reviewCount,
        saved_at: new Date(word.savedAt).toISOString(),
      },
      { onConflict: 'id' }
    );

    return !error;
  } catch (err) {
    console.warn('Failed to save vocabulary to Supabase:', err);
    return false;
  }
}

/**
 * Load saved vocabulary words from Supabase
 */
export async function loadVocabularyFromDb(userId: string): Promise<SavedWord[]> {
  if (!isSupabaseConfigured() || !supabase || !userId) return [];

  try {
    const { data, error } = await supabase
      .from('saved_vocabulary')
      .select('*')
      .eq('user_id', userId)
      .order('saved_at', { ascending: false });

    if (!error && data) {
      return data.map((item) => ({
        id: item.id,
        word: item.word,
        translation: item.translation,
        phonetic: item.phonetic,
        contextSentence: item.context_sentence,
        masteryLevel: item.mastery_level || 1,
        reviewCount: item.review_count || 0,
        savedAt: new Date(item.saved_at),
        language: item.language || 'Spanish',
      }));
    }
  } catch (err) {
    console.warn('Failed to load vocabulary from Supabase:', err);
  }
  return [];
}

/**
 * Save exam result to Supabase
 */
export async function saveExamResultToDb(userId: string, result: MockTestResult): Promise<boolean> {
  if (!isSupabaseConfigured() || !supabase) return false;

  try {
    const { error } = await supabase.from('exam_history').insert({
      id: result.id,
      user_id: userId,
      test_title: result.testTitle,
      cefr_level: result.cefrLevel,
      target_language: result.targetLanguage,
      overall_score: result.overallScore,
      listening_score: result.listeningScore,
      reading_score: result.readingScore,
      writing_score: result.writingScore,
      speaking_score: result.speakingScore,
      completed_at: result.completedAt,
    });

    return !error;
  } catch (err) {
    console.warn('Failed to save exam to Supabase:', err);
    return false;
  }
}
