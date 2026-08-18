export interface RestaurantRoles {
  restaurant_id: string;
  roles: string[];
}

export const DEFAULT_ROLES = ['Server', 'Cook', 'Manager'] as const;
