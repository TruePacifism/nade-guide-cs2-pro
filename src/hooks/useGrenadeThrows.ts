import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GrenadeThrow, CreateGrenadeThrowData } from "@/types/map";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export const useGrenadeThrows = (mapId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["grenade-throws", mapId],
    queryFn: async () => {
      let query = supabase
        .from("grenade_throws")
        .select("*")
        .order("created_at", { ascending: false });

      if (mapId) {
        query = query.eq("map_id", mapId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GrenadeThrow[];
    },
  });
};

export const useCreateGrenadeThrow = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: CreateGrenadeThrowData) => {
      const currentUser = user;
      if (!currentUser) throw new Error("Must be logged in to create throws");

      const { data: newThrow, error } = await supabase
        .from("grenade_throws")
        .insert([{ ...data, user_id: currentUser.id }])
        .select()
        .single();

      if (error) throw error;
      return newThrow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grenade-throws"] });
      queryClient.invalidateQueries({ queryKey: ["maps"] });
      toast.success("Раскидка успешно создана!");
    },
    onError: (error) => {
      toast.error("Ошибка при создании раскидки: " + error.message);
    },
  });
};

export const useDeleteGrenadeThrow = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (throwId: string) => {
      const { error } = await supabase
        .from("grenade_throws")
        .delete()
        .eq("id", throwId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grenade-throws"] });
      toast.success("Раскидка удалена!");
    },
    onError: (error) => {
      toast.error("Ошибка при удалении: " + error.message);
    },
  });
};

export const useUserCustomGrenades = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["grenade_throws", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("grenade_throws")
        .select(`*`)
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
export const useUserFavorites = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-favorites", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_favorites")
        .select(
          `
          *,
          grenade_throws (*)
        `
        )
        .eq("user_id", user.id);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      throwId,
      isFavorite,
    }: {
      throwId: string;
      isFavorite: boolean;
    }) => {
      if (!user) throw new Error("Must be logged in");

      if (isFavorite) {
        // Удаляем из избранного
        const { error } = await supabase
          .from("user_favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("throw_id", throwId);

        if (error) throw error;
      } else {
        // Добавляем в избранное
        const { error } = await supabase
          .from("user_favorites")
          .insert([{ user_id: user.id, throw_id: throwId }]);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
    },
  });
};
