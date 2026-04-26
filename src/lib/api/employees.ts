import { apiClient } from './client';
import type {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
} from '@/lib/types/employee';

export const employeesApi = {
  list: async (restaurantId: string): Promise<Employee[]> => {
    const { data } = await apiClient.get<Employee[]>('/employees', {
      params: { restaurant_id: restaurantId },
    });
    return data;
  },

  create: async (employee: CreateEmployeeRequest): Promise<Employee> => {
    const { data } = await apiClient.post<Employee>('/employees', employee);
    return data;
  },

  update: async (id: string, updates: UpdateEmployeeRequest): Promise<Employee> => {
    const { data } = await apiClient.patch<Employee>(`/employees/${id}`, updates);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/employees/${id}`);
  },
};
