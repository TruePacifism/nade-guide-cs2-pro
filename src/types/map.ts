import { Database } from "@/integrations/supabase/types";

// РўРёРїС‹ РёР· Р±Р°Р·С‹ РґР°РЅРЅС‹С…
export type GrenadeType = Database["public"]["Enums"]["grenade_type"];
export type DifficultyLevel = Database["public"]["Enums"]["difficulty_level"];
export type TeamType = Database["public"]["Enums"]["team_type"];
export type ThrowType = Database["public"]["Enums"]["throw_type"];
export type MediaType = Database["public"]["Enums"]["media_type"];

export enum ThrowTypes {
  standing = "РЎ РјРµСЃС‚Р°",
  jump_throw = "Jump Throw",
  running_left = "Р’Р»РµРІРѕ",
  running_right = "Р’РїСЂР°РІРѕ",
  running_forward = "Р’РїРµСЂРµРґ",
  crouching = "Р’ РїСЂРёСЃСЏРґРµ",
  walk_throw = "РЁР°РіРѕРј",
}
// РРЅС‚РµСЂС„РµР№СЃ РґР»СЏ СЂР°СЃРєРёРґРєРё РіСЂР°РЅР°С‚С‹
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

  // РљРѕРѕСЂРґРёРЅР°С‚С‹
  throw_point_x: number;
  throw_point_y: number;
  landing_point_x: number;
  landing_point_y: number;

  // РњРµРґРёР°
  media_type: MediaType;
  video_url: string | null;
  thumbnail_url?: string;
  setup_image_url?: string;
  aim_image_url?: string;
  result_image_url?: string;

  is_public: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;

  aim_timestamp?: number;
  position_timestamp?: number;
}

// РРЅС‚РµСЂС„РµР№СЃ РґР»СЏ РєР°СЂС‚С‹
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

// РРЅС‚РµСЂС„РµР№СЃ РґР»СЏ РїСЂРѕС„РёР»СЏ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
export interface UserProfile {
  id: string;
  username?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// РРЅС‚РµСЂС„РµР№СЃ РґР»СЏ РёР·Р±СЂР°РЅРЅС‹С… СЂР°СЃРєРёРґРѕРє
export interface UserFavorite {
  id: string;
  user_id: string;
  throw_id: string;
  created_at: string;
}

// РРЅС‚РµСЂС„РµР№СЃ РґР»СЏ СЃРѕР·РґР°РЅРёСЏ РЅРѕРІРѕР№ СЂР°СЃРєРёРґРєРё
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
  video_url: string | null;
  thumbnail_url?: string;
  setup_image_url?: string;
  aim_image_url?: string;
  result_image_url?: string;
}

