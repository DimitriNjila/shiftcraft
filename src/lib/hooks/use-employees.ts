import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import { employeesApi } from '@/lib/api/employees';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/lib/types/employee';

export function useEmployees(restaurantId: string | undefined) {
  return useQuery({
    queryKey: ['employees', restaurantId],
    queryFn: () => employeesApi.list(restaurantId!),
    enabled: !!restaurantId,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employee: CreateEmployeeRequest) => employeesApi.create(employee),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['employees', variables.restaurant_id] });
      toast.success('Employee added');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to add employee');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: UpdateEmployeeRequest }) =>
      employeesApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Employee updated');
    },
    onError: (error: AxiosError<{ detail?: string }>) => {
      toast.error(error.response?.data?.detail ?? 'Failed to update employee');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeesApi.delete(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['employees'] });

      // Snapshot all employee query data so we can roll back
      const previousData = queryClient.getQueriesData<Employee[]>({ queryKey: ['employees'] });

      queryClient.setQueriesData<Employee[]>(
        { queryKey: ['employees'] },
        (old) => old?.filter((e) => e.id !== id),
      );

      return { previousData };
    },
    onSuccess: () => {
      toast.success('Employee removed');
    },
    onError: (error: AxiosError<{ detail?: string }>, _, context) => {
      // Roll back optimistic update
      context?.previousData.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(error.response?.data?.detail ?? 'Failed to remove employee');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
    },
  });
}
