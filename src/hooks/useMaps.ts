
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Map } from '@/types/map';
import { attachSignedMediaUrls } from '@/lib/storage';

export const useMaps = () => {
  return useQuery({
    queryKey: ['maps'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maps')
        .select(`
          *,
          grenade_throws (*)
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      const maps = data ?? [];
      const signedMaps = await Promise.all(
        maps.map(async (map) => {
          const throws = map.grenade_throws || [];
          const signedThrows = await Promise.all(
            throws.map((throwItem: any) => attachSignedMediaUrls(throwItem)),
          );
          return {
            ...map,
            throws: signedThrows,
          };
        }),
      );

      return signedMaps as Map[];
    }
  });
};

export const useMap = (mapId: string) => {
  return useQuery({
    queryKey: ['map', mapId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maps')
        .select(`
          *,
          grenade_throws (*)
        `)
        .eq('id', mapId)
        .single();
      
      if (error) throw error;
      
      const throws = data.grenade_throws || [];
      const signedThrows = await Promise.all(
        throws.map((throwItem: any) => attachSignedMediaUrls(throwItem)),
      );

      return {
        ...data,
        throws: signedThrows,
      } as Map;
    }
  });
};
