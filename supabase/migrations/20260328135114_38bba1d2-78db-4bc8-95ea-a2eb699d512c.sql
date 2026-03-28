
-- Create enums
CREATE TYPE public.grenade_type AS ENUM ('smoke', 'flash', 'he', 'molotov', 'decoy');
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE public.team_type AS ENUM ('ct', 't', 'both');
CREATE TYPE public.throw_type AS ENUM ('standing', 'jump_throw', 'running_left', 'running_right', 'running_forward', 'crouching', 'walk_throw');
CREATE TYPE public.media_type AS ENUM ('video', 'screenshots');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create maps table
CREATE TABLE public.maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create grenade_throws table
CREATE TABLE public.grenade_throws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  map_id UUID NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  grenade_type public.grenade_type NOT NULL,
  difficulty public.difficulty_level NOT NULL DEFAULT 'medium',
  team public.team_type NOT NULL DEFAULT 'both',
  throw_types public.throw_type[] NOT NULL DEFAULT '{}',
  throw_point_x NUMERIC NOT NULL,
  throw_point_y NUMERIC NOT NULL,
  landing_point_x NUMERIC NOT NULL,
  landing_point_y NUMERIC NOT NULL,
  media_type public.media_type NOT NULL DEFAULT 'video',
  video_url TEXT,
  thumbnail_url TEXT,
  setup_image_url TEXT,
  aim_image_url TEXT,
  result_image_url TEXT,
  aim_timestamp NUMERIC,
  position_timestamp NUMERIC,
  is_public BOOLEAN NOT NULL DEFAULT false,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_favorites table
CREATE TABLE public.user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  throw_id UUID NOT NULL REFERENCES public.grenade_throws(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, throw_id)
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grenade_throws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Maps policies (public read)
CREATE POLICY "Maps are viewable by everyone" ON public.maps FOR SELECT USING (true);

-- Grenade throws policies
CREATE POLICY "Public throws are viewable by everyone" ON public.grenade_throws FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create throws" ON public.grenade_throws FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own throws" ON public.grenade_throws FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own throws" ON public.grenade_throws FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- User favorites policies
CREATE POLICY "Users can view own favorites" ON public.user_favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add favorites" ON public.user_favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove own favorites" ON public.user_favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
