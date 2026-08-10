import type { Role, ShiftTemplateEntry } from "@/lib/types/template";

/** Multi-day template — a group of ShiftTemplateEntry rows that share
 *  role/start/end/count and only differ on `day_of_week`. */
export interface TemplateGroup {
  /** Client-side stable id for React keys. */
  id: string;
  /** ISO day numbers, 1 = Monday … 7 = Sunday. */
  days: number[];
  start_time: string;
  end_time: string;
  role: Role;
  count: number;
}

let _seq = 0;
export function makeGroupId(): string {
  return `tg-${++_seq}`;
}

/** Group flat per-day entries into multi-day templates. */
export function groupEntries(entries: ShiftTemplateEntry[]): TemplateGroup[] {
  const map = new Map<string, TemplateGroup>();
  for (const e of entries) {
    const key = `${e.role}|${e.start_time}|${e.end_time}|${e.count}`;
    const existing = map.get(key);
    if (existing) {
      existing.days.push(e.day_of_week);
    } else {
      map.set(key, {
        id: makeGroupId(),
        days: [e.day_of_week],
        start_time: e.start_time,
        end_time: e.end_time,
        role: e.role,
        count: e.count,
      });
    }
  }
  const out = Array.from(map.values());
  out.forEach((g) => g.days.sort((a, b) => a - b));
  return out;
}

/** Expand grouped templates back to flat per-day entries. */
export function ungroupTemplates(groups: TemplateGroup[]): ShiftTemplateEntry[] {
  const out: ShiftTemplateEntry[] = [];
  for (const g of groups) {
    for (const d of g.days) {
      out.push({
        day_of_week: d,
        start_time: g.start_time,
        end_time: g.end_time,
        role: g.role,
        count: g.count,
      });
    }
  }
  return out;
}

const DAY_ABBR_ISO: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

/** Human day-range label — "Every day", "Mon – Fri", "Sat, Sun", … */
export function dayRangeLabel(days: number[]): string {
  if (days.length === 7) return "Every day";
  const sorted = [...days].sort((a, b) => a - b);
  const contiguous = sorted.every((d, i) => i === 0 || d === sorted[i - 1] + 1);
  if (contiguous && sorted.length > 1) {
    return `${DAY_ABBR_ISO[sorted[0]]} – ${DAY_ABBR_ISO[sorted[sorted.length - 1]]}`;
  }
  return sorted.map((d) => DAY_ABBR_ISO[d]).join(", ");
}

/** Auto-name a template from its role + time. */
export function autoName(g: Pick<TemplateGroup, "role" | "start_time">): string {
  const hh = parseInt(g.start_time.split(":")[0], 10);
  const period =
    hh < 11 ? "Opening" : hh < 15 ? "Mid" : hh < 19 ? "Afternoon" : "Close";
  return `${period} ${g.role.toLowerCase()}`;
}
