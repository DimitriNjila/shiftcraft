import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { templatesApi } from '@/lib/api/templates';
import type { SaveShiftTemplatesRequest, ShiftTemplateRecord } from '@/lib/types/template';

export function useShiftTemplates(restaurantId: string | undefined) {
  return useQuery<ShiftTemplateRecord | null>({
    queryKey: ['shift-templates', restaurantId],
    queryFn: async () => {
      try {
        return await templatesApi.get(restaurantId!);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 404) return null;
        throw err;
      }
    },
    enabled: !!restaurantId,
  });
}

export function useSaveShiftTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SaveShiftTemplatesRequest) => templatesApi.save(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['shift-templates', variables.restaurant_id] });
      toast.success('Templates saved');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to save templates');
    },
  });
}
