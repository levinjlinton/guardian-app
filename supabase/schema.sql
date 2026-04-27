-- ============================================================
-- GUARDIAN — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Profiles (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive', -- 'active' | 'inactive' | 'canceled'
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  deadline TIMESTAMPTZ,
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  hours NUMERIC DEFAULT 1,
  tags TEXT[] DEFAULT '{}',
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedule blocks
CREATE TABLE IF NOT EXISTS public.schedule_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('work', 'break', 'personal', 'study')),
  day_index INTEGER NOT NULL CHECK (day_index >= 0 AND day_index <= 6),
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  week_key TEXT NOT NULL,   -- ISO date string of the week's Monday e.g. '2025-01-06'
  auto_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blocked sites (per user)
CREATE TABLE IF NOT EXISTS public.blocked_sites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🌐',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, url)
);

-- User settings
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  blocking_enabled BOOLEAN DEFAULT FALSE,
  theme TEXT DEFAULT 'dark',
  notif_deadlines BOOLEAN DEFAULT TRUE,
  notif_timer BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: users can only read/update their own
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects
CREATE POLICY "projects_select" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "projects_insert" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "projects_update" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "projects_delete" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Schedule blocks
CREATE POLICY "blocks_select" ON public.schedule_blocks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "blocks_insert" ON public.schedule_blocks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "blocks_update" ON public.schedule_blocks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "blocks_delete" ON public.schedule_blocks FOR DELETE USING (auth.uid() = user_id);

-- Blocked sites
CREATE POLICY "sites_select" ON public.blocked_sites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sites_insert" ON public.blocked_sites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sites_delete" ON public.blocked_sites FOR DELETE USING (auth.uid() = user_id);

-- Settings
CREATE POLICY "settings_select" ON public.user_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "settings_insert" ON public.user_settings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "settings_update" ON public.user_settings FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on new user signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );

  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO public.blocked_sites (user_id, url, name, icon) VALUES
    (NEW.id, 'instagram.com', 'Instagram', '📸'),
    (NEW.id, 'twitter.com', 'X / Twitter', '🐦'),
    (NEW.id, 'tiktok.com', 'TikTok', '🎵'),
    (NEW.id, 'youtube.com', 'YouTube', '▶️');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: auto-update updated_at timestamps
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
