import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Restaurant {
  id: string;
  name: string;
  team_size: string | null;
  timezone: string | null;
  /** True once the user has saved store details (step 1 of setup).
   *  Not a "setup finished" flag — the SetupChecklist owns that state. */
  setup_started: boolean;
}

export function useRestaurant() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, team_size, timezone, setup_started')
        .eq('owner_id', user!.id)
        .maybeSingle();

      if (error) throw error;
      return data as Restaurant | null;
    },
    enabled: !!user,
    retry: 3,
    staleTime: 1000 * 60 * 5,  // 5 min — restaurant info rarely changes
    gcTime: 1000 * 60 * 30,
  });
}
