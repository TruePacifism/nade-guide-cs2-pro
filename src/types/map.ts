import { Database } from "@/integrations/supabase/types";

// Типы из Supabase
export type GrenadeType = Database["public"]["Enums"]["grenade_type"];
export type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];
export type TeamType = Database["public"]["Enums"]["team_type"];
export type ThrowType = Database["public"]["Enums"]["throw_type"];
export type MediaType = Database["public"]["Enums"]["media_type"];

export enum ThrowTypes {
  standing = "С места",
  jump_throw = "Jump Throw",
  running_left = "Влево",
  running_right = "Вправо",
  running_forward = "Вперед",
  crouching = "В присяде",
  walk_throw = "Шагом",
}
// Интерфейс для раскидки гранаты
export interface GrenadeThrow {
  id: string;
  map_id: string;
  user_id?: string;
  name: string;
  description?: string;
  grenade_type: GrenadeType;
  difficulty: DifficultyLevel;
  team: TeamType;
  throw_types: ThrowType[];

  // Координаты
  throw_point_x: number;
  throw_point_y: number;
  landing_point_x: number;
  landing_point_y: number;

  // Медиа
  media_type: MediaType;
  video_url?: string;
  thumbnail_url?: string;
  setup_image_url?: string;
  aim_image_url?: string;
  result_image_url?: string;

  is_public: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Интерфейс для карты
export interface Map {
  id: string;
  name: string;
  display_name: string;
  image_url: string;
  thumbnail_url: string;
  is_active: boolean;
  created_at: string;
  throws?: GrenadeThrow[];
}

// Интерфейс для профиля пользователя
export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Интерфейс для избранных раскидок
export interface UserFavorite {
  id: string;
  user_id: string;
  throw_id: string;
  created_at: string;
}

// Интерфейс для создания новой раскидки
export interface CreateGrenadeThrowData {
  map_id: string;
  name: string;
  description?: string;
  grenade_type: GrenadeType;
  difficulty: DifficultyLevel;
  team: TeamType;
  throw_types: ThrowType[];
  throw_point_x: number;
  throw_point_y: number;
  landing_point_x: number;
  landing_point_y: number;
  media_type: MediaType;
  video_url?: string;
  thumbnail_url?: string;
  setup_image_url?: string;
  aim_image_url?: string;
  result_image_url?: string;
}
