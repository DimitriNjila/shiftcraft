import { shiftHours, toDateStr } from './dates';
import type { ShiftTemplateEntry } from '@/lib/types/template';
import type { Schedule } from '@/lib/types/schedule';
import type { Employee } from '@/lib/types/employee';

export interface CoverageGap {
  dayName: string;
  dateStr: string;
  role: string;
  start_time: string;
  end_time: string;
  needed: number;
  filled: number;
  gap: number;
}

/**
 * For each template entry, count how many matching shifts exist in the schedule.
 * A shift matches if: same date (derived from day_of_week + week start), same
 * start/end time, and the assigned employee has the required role.
 */
export function computeCoverageGaps(
  templates: ShiftTemplateEntry[],
  schedule: Schedule,
  weekDays: Date[], // weekDays[0] = Monday … weekDays[6] = Sunday
  employees: Employee[],
): CoverageGap[] {
  const shifts = schedule.shifts ?? [];
  const roleById = new Map(employees.map((e) => [e.id, e.role]));

  const gaps: CoverageGap[] = [];

  for (const template of templates) {
    const day = weekDays[template.day_of_week - 1];
    if (!day) continue;

    const dateStr = toDateStr(day);

    const filled = shifts.filter((s) => {
      if (s.shift_date !== dateStr) return false;
      if (s.start_time !== template.start_time) return false;
      if (s.end_time !== template.end_time) return false;
      const role = roleById.get(s.employee_id) ?? s.employee?.role;
      return role === template.role;
    }).length;

    if (filled < template.count) {
      gaps.push({
        dayName: day.toLocaleDateString('en-US', { weekday: 'short' }),
        dateStr,
        role: template.role,
        start_time: template.start_time,
        end_time: template.end_time,
        needed: template.count,
        filled,
        gap: template.count - filled,
      });
    }
  }

  return gaps;
}

/**
 * Total hours demanded by all template entries across the week.
 * Each entry contributes count × shift_duration.
 */
export function computeRequiredHours(templates: ShiftTemplateEntry[]): number {
  return templates.reduce((sum, t) => {
    const h = shiftHours(t.start_time.slice(0, 5), t.end_time.slice(0, 5));
    return sum + t.count * h;
  }, 0);
}
