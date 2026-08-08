import type { Employee } from "@/lib/types/employee";
import type { ShiftTemplateEntry, Role } from "@/lib/types/template";
import type { ParsedShiftRow } from "./schedule-import";

/**
 * Row shape shown to the manager during the preview step. Carries enough
 * to render inline warnings, let them re-map name → employee or role, and
 * gets flattened into `ShiftTemplateEntry` on confirm.
 */
export interface PreviewRow {
  /** Stable client-side key for React. */
  key: string;
  name: string | null;
  employeeId: string | null;
  role: Role | null;
  day_of_week: number | null;
  start_time: string | null;
  end_time: string | null;
  /** Set for image imports so the UI can flag uncertain rows. */
  confidence?: "high" | "low" | null;
  errors: string[];
  warnings: string[];
  is_valid: boolean;
}

const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];

function isRole(x: string): x is Role {
  return (ROLES as string[]).includes(x);
}

/**
 * Case-insensitive name → employee lookup with a simple normalization
 * (strip accents, collapse whitespace). Returns undefined if no match.
 */
function buildNameIndex(employees: Employee[]) {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, " ")
      .trim();
  const byFull = new Map<string, Employee>();
  const byFirst = new Map<string, Employee[]>();
  for (const e of employees) {
    const n = norm(e.name);
    byFull.set(n, e);
    const first = n.split(" ")[0];
    const bucket = byFirst.get(first) ?? [];
    bucket.push(e);
    byFirst.set(first, bucket);
  }
  return {
    resolve(raw: string | null): Employee | undefined {
      if (!raw) return undefined;
      const key = norm(raw);
      if (byFull.has(key)) return byFull.get(key);
      // First-name-only lookup — only trust it when a single employee matches.
      const first = key.split(" ")[0];
      const candidates = byFirst.get(first);
      if (candidates && candidates.length === 1) return candidates[0];
      return undefined;
    },
  };
}

let _seq = 0;
const nextKey = () => `pr-${++_seq}`;

/**
 * Turn raw parsed schedule rows into preview rows with roles resolved
 * from the employee roster. Each row's `is_valid` reflects whether all
 * required fields are present and match a known employee.
 */
export function buildPreviewRows(
  parsed: ParsedShiftRow[],
  employees: Employee[],
): PreviewRow[] {
  const idx = buildNameIndex(employees);
  return parsed.map((p) => {
    const errors = [...p.errors];
    const warnings = [...p.warnings];
    const employee = idx.resolve(p.name);

    // Prefer a role explicitly labeled in the source (rare — vision model
    // saw a badge). Otherwise fall back to the employee's role on file.
    let role: Role | null = null;
    if (p.role && isRole(p.role)) {
      role = p.role;
      if (employee && isRole(employee.role) && employee.role !== p.role) {
        warnings.push(
          `Image says ${p.role} but ${employee.name} is a ${employee.role} — check`,
        );
      }
    } else if (employee) {
      role = isRole(employee.role) ? (employee.role as Role) : null;
      if (!role) {
        warnings.push(
          `${employee.name}'s role (${employee.role}) isn't a standard role`,
        );
      }
    } else if (p.name) {
      errors.push(`No matching employee for "${p.name}"`);
    } else {
      errors.push("No name detected");
    }

    if (!p.day_of_week) errors.push("Missing day");
    if (!p.start_time || !p.end_time) errors.push("Missing time");

    return {
      key: nextKey(),
      name: p.name,
      employeeId: employee?.id ?? null,
      role,
      day_of_week: p.day_of_week,
      start_time: p.start_time,
      end_time: p.end_time,
      confidence: p.confidence ?? null,
      errors,
      warnings,
      is_valid: errors.length === 0 && !!role,
    };
  });
}

/**
 * Merge per-shift preview rows into `ShiftTemplateEntry` items by
 * grouping on (day, start, end, role) and counting occurrences. Rows with
 * unresolved role/day/time are skipped upstream — only valid rows come in.
 */
export function groupIntoTemplates(
  rows: PreviewRow[],
): ShiftTemplateEntry[] {
  const map = new Map<string, ShiftTemplateEntry>();
  for (const r of rows) {
    if (!r.is_valid || !r.role || !r.day_of_week || !r.start_time || !r.end_time) {
      continue;
    }
    const key = `${r.day_of_week}|${r.start_time}|${r.end_time}|${r.role}`;
    const existing = map.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(key, {
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
        role: r.role,
        count: 1,
      });
    }
  }
  return Array.from(map.values());
}
