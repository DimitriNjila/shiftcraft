import Papa from "papaparse";
import * as XLSX from "xlsx";

/**
 * A single parsed shift row — the intermediate shape before we resolve
 * names to employees and group by (day, start, end, role) into templates.
 *
 * Any field can be null when the parser wasn't confident. Errors/warnings
 * populate as we walk each row so the preview UI can surface them inline.
 */
export interface ParsedShiftRow {
  row_number: number;
  name: string | null;
  day_of_week: number | null; // 1 = Mon … 7 = Sun (ISO)
  start_time: string | null;  // HH:MM:SS
  end_time: string | null;    // HH:MM:SS
  /** Non-null only when the source explicitly labeled a role (e.g. image
   *  OCR spotted a role badge). Otherwise the preview joins name→employee. */
  role?: string | null;
  /** Present for image parses — surfaces uncertainty to the UI. */
  confidence?: "high" | "low" | null;
  errors: string[];
  warnings: string[];
}

export interface ParseSourceResult {
  rows: ParsedShiftRow[];
  /** Original column headers (for display). Empty for wide-format inputs. */
  columns: string[];
}

/* ─── Format detection + entry point ─────────────────────────── */

/** Read a File as text (CSV) or as a workbook (Excel), then normalize. */
export async function parseScheduleFile(
  file: File,
): Promise<ParseSourceResult> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".csv")) {
    const text = await file.text();
    return parseCsv(text);
  }
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return parseXlsx(await file.arrayBuffer());
  }
  throw new Error("Unsupported file type. Please upload a .csv or .xlsx.");
}

function parseCsv(text: string): ParseSourceResult {
  const parsed = Papa.parse<string[]>(text.trim(), {
    header: false,
    skipEmptyLines: true,
  });
  return normalizeRows(parsed.data);
}

function parseXlsx(buffer: ArrayBuffer): ParseSourceResult {
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheet = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheet];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, {
    header: 1,
    raw: false,
    defval: "",
  });
  return normalizeRows(rows.map((r) => r.map((c) => String(c ?? ""))));
}

/* ─── Format normalization ───────────────────────────────────── */

/**
 * Detect whether the sheet is in "long" format (one row per shift, columns
 * for name/day/start/end) or "wide" format (row per employee, columns for
 * each weekday). Long is simpler and less ambiguous — we try it first.
 */
function normalizeRows(rows: string[][]): ParseSourceResult {
  if (rows.length === 0) return { rows: [], columns: [] };
  const header = rows[0].map((c) => c.trim().toLowerCase());

  const dayCols = detectWideDayColumns(header);
  if (dayCols.length >= 3) {
    return { rows: parseWide(rows, header, dayCols), columns: rows[0] };
  }
  return { rows: parseLong(rows, header), columns: rows[0] };
}

/* ─── Wide format ─────────────────────────────────────────────
 * Header pattern: "name", "monday", "tuesday", …
 * Cell values: "9-5", "9am-5pm", "09:00-17:00", or blank.
 * ─────────────────────────────────────────────────────────────── */

interface WideDayCol {
  index: number;
  dayOfWeek: number;
}

function detectWideDayColumns(header: string[]): WideDayCol[] {
  const found: WideDayCol[] = [];
  header.forEach((h, i) => {
    const dow = matchDayOfWeek(h);
    if (dow !== null) found.push({ index: i, dayOfWeek: dow });
  });
  return found;
}

function parseWide(
  rows: string[][],
  header: string[],
  dayCols: WideDayCol[],
): ParsedShiftRow[] {
  const nameCol = header.findIndex((h) =>
    /(^| )(name|employee|staff|person)($| )/.test(h),
  );
  const out: ParsedShiftRow[] = [];
  let rowNumber = 0;

  for (let r = 1; r < rows.length; r++) {
    const record = rows[r];
    const name =
      nameCol >= 0 ? (record[nameCol] ?? "").trim() : record[0]?.trim() ?? "";
    if (!name) continue;

    for (const { index, dayOfWeek } of dayCols) {
      const raw = (record[index] ?? "").trim();
      if (!raw || raw === "-" || raw === "—" || raw.toLowerCase() === "off") {
        continue;
      }
      rowNumber += 1;
      const parsed = parseTimeRange(raw);
      const errors: string[] = [];
      const warnings: string[] = [];
      if (!parsed) {
        errors.push(`Couldn't read the time "${raw}"`);
      }
      out.push({
        row_number: rowNumber,
        name,
        day_of_week: dayOfWeek,
        start_time: parsed?.start ?? null,
        end_time: parsed?.end ?? null,
        errors,
        warnings,
      });
    }
  }
  return out;
}

/* ─── Long format ─────────────────────────────────────────────
 * Header pattern: "name" | "day"|"date" | "start" | "end"
 * (case insensitive; partial matches accepted).
 * ─────────────────────────────────────────────────────────────── */

function parseLong(rows: string[][], header: string[]): ParsedShiftRow[] {
  const nameCol = header.findIndex((h) =>
    /(name|employee|staff|person)/.test(h),
  );
  const dayCol = header.findIndex((h) => /(day|date|weekday)/.test(h));
  const startCol = header.findIndex((h) =>
    /(start|from|begin|in\b|shift start)/.test(h),
  );
  const endCol = header.findIndex((h) => /(end|to\b|finish|out\b|shift end)/.test(h));

  const out: ParsedShiftRow[] = [];
  for (let r = 1; r < rows.length; r++) {
    const record = rows[r];
    const errors: string[] = [];
    const warnings: string[] = [];

    const name = nameCol >= 0 ? (record[nameCol] ?? "").trim() : null;
    if (!name) continue;

    const dayRaw = dayCol >= 0 ? (record[dayCol] ?? "").trim() : "";
    const day_of_week = matchDayOfWeek(dayRaw.toLowerCase());
    if (day_of_week === null && dayRaw) {
      errors.push(`Couldn't read the day "${dayRaw}"`);
    } else if (!dayRaw) {
      errors.push(`Missing day`);
    }

    let start: string | null = null;
    let end: string | null = null;
    if (startCol >= 0 && endCol >= 0) {
      start = normalizeTime(record[startCol] ?? "");
      end = normalizeTime(record[endCol] ?? "");
      if (!start) errors.push(`Couldn't read the start time`);
      if (!end) errors.push(`Couldn't read the end time`);
    } else {
      // Fall back to a "time range" column (e.g., "9-5")
      const rangeCol = header.findIndex((h) => /(time|shift|hours)/.test(h));
      if (rangeCol >= 0) {
        const range = parseTimeRange((record[rangeCol] ?? "").trim());
        start = range?.start ?? null;
        end = range?.end ?? null;
        if (!start || !end) errors.push(`Couldn't read the time range`);
      } else {
        errors.push(`No start/end columns detected`);
      }
    }

    out.push({
      row_number: r,
      name,
      day_of_week,
      start_time: start,
      end_time: end,
      errors,
      warnings,
    });
  }
  return out;
}

/* ─── Parsers ─────────────────────────────────────────────── */

const DAY_MAP: Record<string, number> = {
  mon: 1, monday: 1, m: 1, "1": 1,
  tue: 2, tues: 2, tuesday: 2, t: 2, "2": 2,
  wed: 3, weds: 3, wednesday: 3, w: 3, "3": 3,
  thu: 4, thur: 4, thurs: 4, thursday: 4, th: 4, "4": 4,
  fri: 5, friday: 5, f: 5, "5": 5,
  sat: 6, saturday: 6, sa: 6, "6": 6,
  sun: 7, sunday: 7, su: 7, "7": 7,
};

function matchDayOfWeek(raw: string): number | null {
  if (!raw) return null;
  const cleaned = raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned in DAY_MAP) return DAY_MAP[cleaned];
  // Try prefix match for full day names embedded in longer strings
  for (const key of Object.keys(DAY_MAP)) {
    if (cleaned.startsWith(key) && key.length >= 3) return DAY_MAP[key];
  }
  return null;
}

/**
 * Normalize a single time string to HH:MM:SS. Accepts:
 *  9, 9am, 9:00, 09:00, 9:30pm, 17:00, etc.
 */
export function normalizeTime(raw: string): string | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase().replace(/\s+/g, "");
  // e.g. "9", "9am", "9pm", "9:30", "9:30pm", "17", "17:30"
  const m = /^(\d{1,2})(?::(\d{2}))?(am|pm|a|p)?$/.exec(s);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3]?.[0];
  if (meridiem === "p" && hour < 12) hour += 12;
  if (meridiem === "a" && hour === 12) hour = 0;
  if (hour < 0 || hour > 24) return null;
  if (minute < 0 || minute > 59) return null;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
}

/** Parse "9-5", "9am-5pm", "09:00-17:00", "9 to 5" into a start/end pair. */
export function parseTimeRange(
  raw: string,
): { start: string; end: string } | null {
  if (!raw) return null;
  const cleaned = raw
    .toLowerCase()
    .replace(/\s+to\s+/g, "-")
    .replace(/\s+–\s+/g, "-")
    .replace(/\s+—\s+/g, "-")
    .replace(/–|—/g, "-");
  const parts = cleaned.split("-").map((p) => p.trim());
  if (parts.length !== 2) return null;

  // If neither side has a meridiem but the second is smaller than the first,
  // assume the second is PM (e.g. "9-5" → 09:00 → 17:00).
  const hasMeridiem =
    /(am|pm|a$|p$)/.test(parts[0]) || /(am|pm|a$|p$)/.test(parts[1]);
  let a = normalizeTime(parts[0]);
  let b = normalizeTime(parts[1]);
  if (!a || !b) return null;

  if (!hasMeridiem) {
    const aH = parseInt(a.slice(0, 2), 10);
    const bH = parseInt(b.slice(0, 2), 10);
    if (bH < aH && bH < 12) {
      b = `${String(bH + 12).padStart(2, "0")}${b.slice(2)}`;
    }
  }
  return { start: a, end: b };
}
