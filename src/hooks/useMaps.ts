
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Map } from '@/types/map';

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
      
      return data.map(map => ({
        ...map,
        throws: map.grenade_throws || []
      })) as Map[];
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
      
      return {
        ...data,
        throws: data.grenade_throws || []
      } as Map;
    }
  });
};
