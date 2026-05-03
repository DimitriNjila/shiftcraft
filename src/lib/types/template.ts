export type Role = 'Server' | 'Cook' | 'Host' | 'Manager';

export interface ShiftTemplateEntry {
  day_of_week: number; // 1 = Monday … 7 = Sunday
  start_time: string;  // HH:MM:SS
  end_time: string;
  role: Role;
  count: number;
}

export interface ShiftTemplateRecord {
  id: string;
  restaurant_id: string;
  templates: ShiftTemplateEntry[];
  updated_at: string;
}

export interface SaveShiftTemplatesRequest {
  restaurant_id: string;
  templates: ShiftTemplateEntry[];
}
