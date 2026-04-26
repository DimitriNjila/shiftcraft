import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export interface Restaurant {
  id: string;
  name: string;
  team_size: string | null;
  onboarding_completed: boolean;
}

export function useRestaurant() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['restaurant', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('restaurants')
        .select('id, name, team_size, onboarding_completed')
        .eq('owner_id', user!.id)
        .single();

      if (error) throw error;
      return data as Restaurant;
    },
    enabled: !!user,
  });
}
