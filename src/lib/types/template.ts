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

/**
 * The import-confirm endpoint takes `rows` (not `templates`) and appends
 * to whatever templates already exist. Different key from the save
 * endpoint — this shape MUST match the backend contract exactly.
 */
export interface ImportShiftTemplatesRequest {
  restaurant_id: string;
  rows: ShiftTemplateEntry[];
}

/** Row returned by the image parse endpoint. Superset of ParsedShiftRow —
 *  the backend adds confidence + is_valid so we can surface uncertainty. */
export interface ImageParseRow {
  row_number: number;
  name: string | null;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  role: string | null;
  count: number | null;
  confidence: 'high' | 'low' | null;
  errors: string[];
  warnings: string[];
  is_valid: boolean;
}

export interface ImageParseResponse {
  column_mapping: Record<string, string>;
  rows: ImageParseRow[];
  valid_count: number;
  error_count: number;
}
