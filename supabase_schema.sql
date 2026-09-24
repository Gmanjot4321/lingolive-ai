-- ==============================================================================
-- LingoLive AI: Supabase Database Schema
-- ==============================================================================

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  avatar TEXT,
  target_language TEXT DEFAULT 'Spanish',
  proficiency_level TEXT DEFAULT 'A0 - Absolute Beginner (Zero Knowledge)',
  unlocked_levels JSONB DEFAULT '["A0 - Absolute Beginner (Zero Knowledge)"]'::jsonb,
  passed_promotion_exams JSONB DEFAULT '[]'::jsonb,
  level_practice_counts JSONB DEFAULT '{}'::jsonb,
  xp INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 1,
  last_active_date TEXT,
  last_check_in_date TEXT,
  active_dates JSONB DEFAULT '[]'::jsonb,
  daily_study_minutes JSONB DEFAULT '{}'::jsonb,
  total_study_minutes INTEGER DEFAULT 0,
  streak_freeze_count INTEGER DEFAULT 1,
  streak_freeze_used_dates JSONB DEFAULT '[]'::jsonb,
  claimed_milestones JSONB DEFAULT '[]'::jsonb,
  league TEXT DEFAULT 'Bronze',
  achievements JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);


GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_profiles TO service_role;


-- 2. Create saved_vocabulary table
CREATE TABLE IF NOT EXISTS public.saved_vocabulary (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  word TEXT NOT NULL,
  translation TEXT NOT NULL,
  phonetic TEXT,
  context_sentence TEXT,
  mastery_level INTEGER DEFAULT 1,
  review_count INTEGER DEFAULT 0,
  language TEXT DEFAULT 'Spanish',
  saved_at TIMESTAMPTZ DEFAULT NOW()
);

-- Explicit Grants for saved_vocabulary
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_vocabulary TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_vocabulary TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_vocabulary TO service_role;


-- 3. Create exam_history table
CREATE TABLE IF NOT EXISTS public.exam_history (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  cefr_level TEXT NOT NULL,
  target_language TEXT NOT NULL,
  overall_score NUMERIC DEFAULT 0,
  listening_score NUMERIC DEFAULT 0,
  reading_score NUMERIC DEFAULT 0,
  writing_score NUMERIC DEFAULT 0,
  speaking_score NUMERIC DEFAULT 0,
  completed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Explicit Grants for exam_history
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_history TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_history TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_history TO service_role;


-- Create performance indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles (email);
CREATE INDEX IF NOT EXISTS idx_saved_vocab_user ON public.saved_vocabulary (user_id);
CREATE INDEX IF NOT EXISTS idx_exam_history_user ON public.exam_history (user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_history ENABLE ROW LEVEL SECURITY;

-- Allow public read/write access for application clients
DROP POLICY IF EXISTS "Allow public read-write for user_profiles" ON public.user_profiles;
CREATE POLICY "Allow public read-write for user_profiles"
  ON public.user_profiles
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for saved_vocabulary" ON public.saved_vocabulary;
CREATE POLICY "Allow public read-write for saved_vocabulary"
  ON public.saved_vocabulary
  FOR ALL
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-write for exam_history" ON public.exam_history;
CREATE POLICY "Allow public read-write for exam_history"
  ON public.exam_history
  FOR ALL
  USING (true)
  WITH CHECK (true);
