export interface RestaurantSettings {
  id?: string;
  restaurant_id: string;
  name: string;
  timezone: string;
  address?: string;
  phone?: string;
  setup_started: boolean;
}
