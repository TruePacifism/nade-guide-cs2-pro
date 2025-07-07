
-- Создаем enum для типов гранат
CREATE TYPE grenade_type AS ENUM ('smoke', 'flash', 'he', 'molotov', 'decoy');

-- Создаем enum для сложности
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');

-- Создаем enum для команд
CREATE TYPE team_type AS ENUM ('ct', 't', 'both');

-- Создаем enum для типов броска
CREATE TYPE throw_type AS ENUM ('standing', 'jump_throw', 'running_left', 'running_right', 'running_forward', 'crouching', 'walk_throw');

-- Создаем enum для типов медиа
CREATE TYPE media_type AS ENUM ('video', 'screenshots');

-- Создаем таблицу профилей пользователей
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Создаем таблицу карт
CREATE TABLE public.maps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу раскидок гранат
CREATE TABLE public.grenade_throws (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  map_id UUID NOT NULL REFERENCES public.maps(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE, -- NULL для базовых раскидок
  name TEXT NOT NULL,
  description TEXT,
  grenade_type grenade_type NOT NULL,
  difficulty difficulty_level NOT NULL DEFAULT 'medium',
  team team_type NOT NULL DEFAULT 'both',
  throw_types throw_type[] NOT NULL DEFAULT '{}', -- Массив типов броска
  
  -- Координаты точек
  throw_point_x DECIMAL(5,2) NOT NULL CHECK (throw_point_x >= 0 AND throw_point_x <= 100),
  throw_point_y DECIMAL(5,2) NOT NULL CHECK (throw_point_y >= 0 AND throw_point_y <= 100),
  landing_point_x DECIMAL(5,2) NOT NULL CHECK (landing_point_x >= 0 AND landing_point_x <= 100),
  landing_point_y DECIMAL(5,2) NOT NULL CHECK (landing_point_y >= 0 AND landing_point_y <= 100),
  
  -- Медиа контент
  media_type media_type NOT NULL DEFAULT 'video',
  video_url TEXT, -- Для видео раскидок
  thumbnail_url TEXT,
  
  -- Для скриншотов
  setup_image_url TEXT, -- Скрин где встать
  aim_image_url TEXT,   -- Скрин куда нацелиться  
  result_image_url TEXT, -- Скрин результата
  
  is_public BOOLEAN NOT NULL DEFAULT false, -- Базовые раскидки публичные
  is_verified BOOLEAN NOT NULL DEFAULT false, -- Проверенные администратором
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Создаем таблицу избранных раскидок пользователей
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  throw_id UUID NOT NULL REFERENCES public.grenade_throws(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, throw_id)
);

-- Включаем RLS на всех таблицах
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grenade_throws ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Политики для profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Политики для maps (публичные для чтения)
CREATE POLICY "Anyone can view active maps" ON public.maps FOR SELECT USING (is_active = true);

-- Политики для grenade_throws
CREATE POLICY "Anyone can view public throws" ON public.grenade_throws 
  FOR SELECT USING (is_public = true OR user_id IS NULL);

CREATE POLICY "Users can view own throws" ON public.grenade_throws 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own throws" ON public.grenade_throws 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own throws" ON public.grenade_throws 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own throws" ON public.grenade_throws 
  FOR DELETE USING (auth.uid() = user_id);

-- Политики для user_favorites
CREATE POLICY "Users can view own favorites" ON public.user_favorites 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own favorites" ON public.user_favorites 
  FOR ALL USING (auth.uid() = user_id);

-- Триггер для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Триггер для обновления updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_grenade_throws_updated_at BEFORE UPDATE ON public.grenade_throws
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Вставляем базовые карты
INSERT INTO public.maps (name, display_name, image_url, thumbnail_url) VALUES
('dust2', 'Dust II', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('mirage', 'Mirage', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80'),
('inferno', 'Inferno', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80');

-- Создаем storage bucket для медиа файлов
INSERT INTO storage.buckets (id, name, public) VALUES ('grenade-media', 'grenade-media', true);

-- Политики для storage
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'grenade-media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'grenade-media' AND auth.role() = 'authenticated'
);
CREATE POLICY "Users can update own media" ON storage.objects FOR UPDATE USING (
  bucket_id = 'grenade-media' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own media" ON storage.objects FOR DELETE USING (
  bucket_id = 'grenade-media' AND auth.uid()::text = (storage.foldername(name))[1]
);
