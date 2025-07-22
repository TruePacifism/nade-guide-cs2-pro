export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)";
  };
  public: {
    Tables: {
      grenade_throws: {
        Row: {
          aim_image_url: string | null;
          created_at: string;
          description: string | null;
          difficulty: Database["public"]["Enums"]["difficulty_level"];
          grenade_type: Database["public"]["Enums"]["grenade_type"];
          id: string;
          is_public: boolean;
          is_verified: boolean;
          landing_point_x: number;
          landing_point_y: number;
          map_id: string;
          media_type: Database["public"]["Enums"]["media_type"];
          name: string;
          result_image_url: string | null;
          setup_image_url: string | null;
          team: Database["public"]["Enums"]["team_type"];
          throw_point_x: number;
          throw_point_y: number;
          throw_types: Database["public"]["Enums"]["throw_type"][];
          thumbnail_url: string | null;
          updated_at: string;
          user_id: string | null;
          video_url: string | null;
        };
        Insert: {
          aim_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          grenade_type: Database["public"]["Enums"]["grenade_type"];
          id?: string;
          is_public?: boolean;
          is_verified?: boolean;
          landing_point_x: number;
          landing_point_y: number;
          map_id: string;
          media_type?: Database["public"]["Enums"]["media_type"];
          name: string;
          result_image_url?: string | null;
          setup_image_url?: string | null;
          team?: Database["public"]["Enums"]["team_type"];
          throw_point_x: number;
          throw_point_y: number;
          throw_types?: Database["public"]["Enums"]["throw_type"][];
          thumbnail_url?: string | null;
          updated_at?: string;
          user_id?: string | null;
          video_url?: string | null;
        };
        Update: {
          aim_image_url?: string | null;
          created_at?: string;
          description?: string | null;
          difficulty?: Database["public"]["Enums"]["difficulty_level"];
          grenade_type?: Database["public"]["Enums"]["grenade_type"];
          id?: string;
          is_public?: boolean;
          is_verified?: boolean;
          landing_point_x?: number;
          landing_point_y?: number;
          map_id?: string;
          media_type?: Database["public"]["Enums"]["media_type"];
          name?: string;
          result_image_url?: string | null;
          setup_image_url?: string | null;
          team?: Database["public"]["Enums"]["team_type"];
          throw_point_x?: number;
          throw_point_y?: number;
          throw_types?: Database["public"]["Enums"]["throw_type"][];
          thumbnail_url?: string | null;
          updated_at?: string;
          user_id?: string | null;
          video_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "grenade_throws_map_id_fkey";
            columns: ["map_id"];
            isOneToOne: false;
            referencedRelation: "maps";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "grenade_throws_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      maps: {
        Row: {
          created_at: string;
          display_name: string;
          id: string;
          image_url: string;
          is_active: boolean;
          name: string;
          thumbnail_url: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          id?: string;
          image_url: string;
          is_active?: boolean;
          name: string;
          thumbnail_url: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          id?: string;
          image_url?: string;
          is_active?: boolean;
          name?: string;
          thumbnail_url?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          id: string;
          updated_at: string;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          id: string;
          updated_at?: string;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          id?: string;
          updated_at?: string;
          username?: string | null;
        };
        Relationships: [];
      };
      user_favorites: {
        Row: {
          created_at: string;
          id: string;
          throw_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          throw_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          throw_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_favorites_throw_id_fkey";
            columns: ["throw_id"];
            isOneToOne: false;
            referencedRelation: "grenade_throws";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      difficulty_level: "easy" | "medium" | "hard";
      grenade_type: "smoke" | "flash" | "he" | "molotov" | "decoy";
      media_type: "video" | "screenshots";
      team_type: "ct" | "t" | "both";
      throw_type:
        | "standing"
        | "jump_throw"
        | "running_left"
        | "running_right"
        | "running_forward"
        | "crouching"
        | "walk_throw";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      difficulty_level: ["easy", "medium", "hard"],
      grenade_type: ["smoke", "flash", "he", "molotov", "decoy"],
      media_type: ["video", "screenshots"],
      team_type: ["ct", "t", "both"],
      throw_type: [
        "standing",
        "jump_throw",
        "running_left",
        "running_right",
        "running_forward",
        "crouching",
        "walk_throw",
      ],
    },
  },
} as const;
