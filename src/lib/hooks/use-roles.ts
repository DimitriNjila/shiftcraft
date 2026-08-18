import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { rolesApi } from '@/lib/api/roles';
import { DEFAULT_ROLES } from '@/lib/types/roles';

export function useRoles(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['roles', restaurantId],
    queryFn: () => rolesApi.get(restaurantId!),
    enabled: !!restaurantId,
    staleTime: 1000 * 60 * 5,
  });
}

/** Roles list with a sensible default so callers never render an empty dropdown. */
export function useRoleOptions(restaurantId: string | undefined): string[] {
  const { data } = useRoles(restaurantId);
  return data?.roles?.length ? data.roles : [...DEFAULT_ROLES];
}

export function useSaveRoles(restaurantId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roles: string[]) => rolesApi.put(restaurantId!, roles),
    onSuccess: (data) => {
      queryClient.setQueryData(['roles', restaurantId], data);
      toast.success('Roles saved');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to save roles');
    },
  });
}
