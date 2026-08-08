import type { Schedule, Shift } from "@/lib/types/schedule";
import type { Employee } from "@/lib/types/employee";
import { formatShiftTime, toDateStr } from "@/lib/utils/dates";
import { roleHue } from "@/lib/utils/roles";
import { oklchToHex } from "@/lib/utils/oklch";

/**
 * The printable sheet gets rasterized by html2canvas for the PDF export,
 * and html2canvas's color parser doesn't understand oklch(). Precompute
 * the role-stripe hex from the hue so the DOM only sees standard colors.
 */
function roleStripeColor(role: string): string {
  return oklchToHex(0.55, 0.13, roleHue(role));
}

interface PrintableScheduleProps {
  schedule: Schedule;
  employees: Employee[];
  weekDays: Date[];
  restaurantName: string;
  weekLabel: string;
  weekNumber: number;
  year: number;
  managerName?: string;
}

const DAY_ABBR: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

/**
 * Paper-form calendar sheet — mirrors the design's PrintPreview layout.
 * Fixed light palette so it prints identically regardless of the app theme.
 * Only assigned shifts appear; open placeholders never make it to paper.
 *
 * Renders inside both the on-screen PrintPreview page and via the print
 * pipeline (`window.print()`), so the downloadable PDF and the preview
 * page are always visually identical.
 */
export function PrintableSchedule({
  schedule,
  employees,
  weekDays,
  restaurantName,
  weekLabel,
  weekNumber,
  year,
  managerName,
}: PrintableScheduleProps) {
  const empById = new Map(employees.map((e) => [e.id, e]));
  const shifts = schedule.shifts ?? [];

  const byDate = new Map<string, Shift[]>();
  for (const s of shifts) {
    if (!s.employee_id) continue;
    const arr = byDate.get(s.shift_date) ?? [];
    arr.push(s);
    byDate.set(s.shift_date, arr);
  }
  for (const arr of byDate.values()) {
    arr.sort((a, b) => a.start_time.localeCompare(b.start_time));
  }

  const rolesUsed = Array.from(
    new Set(shifts.map((s) => empById.get(s.employee_id)?.role).filter(Boolean)),
  ) as string[];

  const now = new Date();
  const publishedOn = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <div className="printable-schedule">
      {/* Header rail */}
      <header className="ps-head">
        <div className="ps-mark" aria-hidden>
          ✳
        </div>
        <div className="ps-title-block">
          <div className="ps-eyebrow">Weekly schedule</div>
          <div className="ps-title">{restaurantName}</div>
        </div>
        <div className="ps-meta">
          <div className="ps-week">{weekLabel}, {year}</div>
          <div className="ps-sub">
            Week {weekNumber} · Published {publishedOn}
          </div>
        </div>
      </header>

      {/* 7-column calendar body */}
      <div className="ps-grid">
        {weekDays.map((day, i) => {
          const dateStr = toDateStr(day);
          const dayShifts = byDate.get(dateStr) ?? [];
          const dayNum = day.getDate();
          const isWeekend = i >= 5;
          return (
            <div
              key={dateStr}
              className={`ps-col print-avoid-break${i > 0 ? " ps-col-bordered" : ""}`}
            >
              <div className="ps-col-head">
                <span
                  className="ps-dow"
                  style={{ color: isWeekend ? "#006b47" : "#5d5958" }}
                >
                  {DAY_ABBR[day.getDay()]}
                </span>
                <span className="ps-day">{dayNum}</span>
              </div>
              <div className="ps-shifts">
                {dayShifts.map((s) => {
                  const emp = empById.get(s.employee_id);
                  const role = emp?.role ?? "";
                  const first = (emp?.name ?? "").split(/\s+/)[0] ?? "";
                  const last = (emp?.name ?? "").split(/\s+/)[1] ?? "";
                  const initial = last ? `${last[0]}.` : "";
                  return (
                    <div key={s.id} className="ps-shift print-avoid-break">
                      <div
                        className="ps-stripe"
                        style={{ background: roleStripeColor(role) }}
                      />
                      <div className="ps-time">
                        {formatShiftTime(s.start_time)}–
                        {formatShiftTime(s.end_time)}
                      </div>
                      <div className="ps-name">
                        {first} {initial}
                      </div>
                      {role && (
                        <div className="ps-role">{role}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer — role legend + signoff */}
      <footer className="ps-foot">
        {rolesUsed.map((role) => (
          <span key={role} className="ps-legend-item">
            <span
              className="ps-legend-swatch"
              style={{ background: roleStripeColor(role) }}
            />
            {role}
          </span>
        ))}
        <div style={{ flex: 1 }} />
        <span className="ps-signoff">
          {managerName ? `Questions? Ask ${managerName} · ` : ""}Generated by{" "}
          <strong className="ps-brand">Mise en place</strong> · mise.app
        </span>
      </footer>
    </div>
  );
}
