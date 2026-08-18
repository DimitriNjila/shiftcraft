import { apiClient } from './client';
import type { RestaurantRoles } from '@/lib/types/roles';

export const rolesApi = {
  get: async (restaurantId: string): Promise<RestaurantRoles> => {
    const { data } = await apiClient.get<RestaurantRoles>(
      `/restaurants/${restaurantId}/roles`,
    );
    return data;
  },

  put: async (
    restaurantId: string,
    roles: string[],
  ): Promise<RestaurantRoles> => {
    const { data } = await apiClient.put<RestaurantRoles>(
      `/restaurants/${restaurantId}/roles`,
      { roles },
    );
    return data;
  },
};
