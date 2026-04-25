export interface ShiftTemplate {
  id: string;
  restaurant_id: string;
  name: string;
  day_of_week: number; // 1=Monday ... 7=Sunday
  start_time: string;
  end_time: string;
  role: string;
  count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateShiftTemplateRequest {
  name: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  role: string;
  count: number;
  restaurant_id: string;
}

export interface UpdateShiftTemplateRequest {
  name?: string;
  day_of_week?: number;
  start_time?: string;
  end_time?: string;
  role?: string;
  count?: number;
  is_active?: boolean;
}
