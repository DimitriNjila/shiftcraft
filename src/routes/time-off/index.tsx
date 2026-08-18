import { type FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarOff,
  ChevronRight,
  Info,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useSchedules } from "@/lib/hooks/use-schedules";
import {
  useAddTimeOff,
  useDeleteTimeOff,
  useTimeOffForEmployees,
} from "@/lib/hooks/use-time-off";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { usePageMeta } from "@/components/layout/page-meta";
import { toDateStr } from "@/lib/utils/dates";
import type { Employee } from "@/lib/types/employee";
import type { TimeOff } from "@/lib/types/timeOff";

interface FlatRow {
  employee: Employee;
  timeOff: TimeOff;
}

export default function TimeOffPage() {
  const today = toDateStr(new Date());
  const { data: restaurant } = useRestaurant();
  const { data: employees = [], isLoading: employeesLoading } = useEmployees(
    restaurant?.id,
  );
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.is_active),
    [employees],
  );
  const employeeIds = useMemo(
    () => activeEmployees.map((e) => e.id),
    [activeEmployees],
  );
  const { byEmployee, isLoading: timeOffLoading } =
    useTimeOffForEmployees(employeeIds);
  const { data: schedules } = useSchedules(restaurant?.id);

  const [addOpen, setAddOpen] = useState(false);
  const [showPast, setShowPast] = useState(false);

  usePageMeta({
    title: "Time off",
    breadcrumbs: ["Team", "Time off"],
    actions: (
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setAddOpen(true)}
      >
        <Plus size={14} /> Add time off
      </button>
    ),
  });

  const rows: FlatRow[] = useMemo(() => {
    const flat: FlatRow[] = [];
    for (const emp of activeEmployees) {
      for (const t of byEmployee[emp.id] ?? []) {
        if (!showPast && t.end_date < today) continue;
        flat.push({ employee: emp, timeOff: t });
      }
    }
    flat.sort((a, b) => a.timeOff.start_date.localeCompare(b.timeOff.start_date));
    return flat;
  }, [activeEmployees, byEmployee, showPast, today]);

  const groups = useMemo(() => {
    const map = new Map<string, FlatRow[]>();
    for (const row of rows) {
      const key = groupKeyFor(row.timeOff.start_date, today);
      const arr = map.get(key) ?? [];
      arr.push(row);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [rows, today]);

  const scheduledWeekStarts = useMemo(
    () => new Set((schedules ?? []).map((s) => s.week_start)),
    [schedules],
  );

  const loading = employeesLoading || timeOffLoading;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          background: "var(--surface-container)",
          borderRadius: "var(--r-xl)",
          boxShadow: "inset 0 0 0 1px var(--hairline)",
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="title-md">Everyone who's off</div>
          <div
            className="body-sm"
            style={{
              color: "var(--on-surface-muted)",
              fontSize: 12,
              marginTop: 2,
            }}
          >
            One-off dates only. Recurring availability lives on each staff
            member's profile.
          </div>
        </div>
        <label
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12.5,
            color: "var(--on-surface-muted)",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={showPast}
            onChange={(e) => setShowPast(e.target.checked)}
          />
          Show past
        </label>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={26} />
        </div>
      ) : activeEmployees.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={26} className="text-on-surface-faint" />}
          title="No staff yet"
          description="Add team members before you can log time off for them."
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<CalendarOff size={26} className="text-on-surface-faint" />}
          title="Nothing on the books"
          description={
            showPast
              ? "No time off has been logged for anyone."
              : "No upcoming time off. Toggle 'Show past' to see history."
          }
          action={
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setAddOpen(true)}
            >
              <Plus size={14} /> Add time off
            </button>
          }
        />
      ) : (
        groups.map(([label, rows]) => (
          <section
            key={label}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <div
              className="label-md"
              style={{ padding: "0 4px", fontSize: 11 }}
            >
              {label} · {rows.length}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {rows.map((row) => (
                <TimeOffListRow
                  key={row.timeOff.id}
                  row={row}
                  scheduledWeekStarts={scheduledWeekStarts}
                />
              ))}
            </div>
          </section>
        ))
      )}

      {addOpen && (
        <AddTimeOffDialog
          employees={activeEmployees}
          onClose={() => setAddOpen(false)}
        />
      )}
    </div>
  );
}

function TimeOffListRow({
  row,
  scheduledWeekStarts,
}: {
  row: FlatRow;
  scheduledWeekStarts: Set<string>;
}) {
  const { employee, timeOff } = row;
  const deleteTimeOff = useDeleteTimeOff(employee.id);
  const overlap = findOverlappingWeek(timeOff, scheduledWeekStarts);
  const start = new Date(timeOff.start_date + "T00:00:00");
  const end = new Date(timeOff.end_date + "T00:00:00");
  const isSingle = timeOff.start_date === timeOff.end_date;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      style={{
        background: "var(--surface-lowest)",
        borderRadius: "var(--r-lg)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={employee.name} size={32} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link
            to={`/employees/${employee.id}`}
            style={{
              color: "var(--on-surface)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span className="title-sm" style={{ fontSize: 13 }}>
              {employee.name}
            </span>
            <ChevronRight size={13} style={{ color: "var(--on-surface-faint)" }} />
          </Link>
          <div
            className="body-sm"
            style={{
              fontSize: 12,
              color: "var(--on-surface-muted)",
              marginTop: 1,
            }}
          >
            {isSingle ? fmt(start) : `${fmt(start)} → ${fmt(end)}`}
            {timeOff.reason ? ` · ${timeOff.reason}` : ""}
          </div>
        </div>
        <span
          className="chip"
          style={{
            background: "var(--surface-high)",
            fontSize: 11,
          }}
        >
          {employee.role}
        </span>
        <button
          type="button"
          onClick={() => deleteTimeOff.mutate(timeOff.id)}
          disabled={deleteTimeOff.isPending}
          className="btn btn-ghost btn-icon"
          aria-label={`Remove time off for ${employee.name}`}
          title="Remove time off"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {overlap && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 8,
            background: "var(--warning-container, #fef3c7)",
            color: "var(--warning, #b45309)",
            fontSize: 12,
          }}
        >
          <Info size={13} style={{ flexShrink: 0, marginTop: 2 }} />
          <span>
            Overlaps the week of {overlap}. Regenerate that schedule to apply
            this change.
          </span>
        </div>
      )}
    </div>
  );
}

function AddTimeOffDialog({
  employees,
  onClose,
}: {
  employees: Employee[];
  onClose: () => void;
}) {
  const today = toDateStr(new Date());
  const [employeeId, setEmployeeId] = useState<string>(employees[0]?.id ?? "");
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [reason, setReason] = useState("");
  const [multiDay, setMultiDay] = useState(false);
  const addTimeOff = useAddTimeOff(employeeId);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    const effectiveEnd = multiDay ? end : start;
    if (effectiveEnd < start) return;
    addTimeOff.mutate(
      {
        start_date: start,
        end_date: effectiveEnd,
        reason: reason.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="label-md">New</span>
            <h2 className="headline-md mt-0.5">Add time off</h2>
          </div>
          <button
            onClick={onClose}
            className="btn-icon btn-ghost"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label
              htmlFor="to-emp"
              className="label-md"
              style={{ display: "block", marginBottom: 4 }}
            >
              Employee
            </label>
            <select
              id="to-emp"
              className="input"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} · {e.role}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: multiDay ? "1fr 1fr" : "1fr",
              gap: 10,
            }}
          >
            <div>
              <label
                htmlFor="to-start"
                className="label-md"
                style={{ display: "block", marginBottom: 4 }}
              >
                {multiDay ? "Start" : "Date"}
              </label>
              <input
                id="to-start"
                type="date"
                className="input"
                value={start}
                onChange={(e) => {
                  setStart(e.target.value);
                  if (!multiDay || end < e.target.value) setEnd(e.target.value);
                }}
                required
              />
            </div>
            {multiDay && (
              <div>
                <label
                  htmlFor="to-end"
                  className="label-md"
                  style={{ display: "block", marginBottom: 4 }}
                >
                  End
                </label>
                <input
                  id="to-end"
                  type="date"
                  className="input"
                  value={end}
                  min={start}
                  onChange={(e) => setEnd(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12.5,
              color: "var(--on-surface-muted)",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={multiDay}
              onChange={(e) => {
                setMultiDay(e.target.checked);
                if (!e.target.checked) setEnd(start);
              }}
            />
            Multi-day range
          </label>

          <div>
            <label
              htmlFor="to-reason"
              className="label-md"
              style={{ display: "block", marginBottom: 4 }}
            >
              Reason
              <span
                style={{
                  color: "var(--on-surface-faint)",
                  textTransform: "none",
                  letterSpacing: 0,
                  fontWeight: 400,
                }}
              >
                {" "}
                · optional
              </span>
            </label>
            <input
              id="to-reason"
              type="text"
              className="input"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Interview"
              maxLength={200}
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary py-2.5 px-4 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 justify-center py-2.5 text-sm"
              disabled={addTimeOff.isPending || !employeeId}
            >
              {addTimeOff.isPending ? "Adding…" : "Add time off"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function groupKeyFor(dateStr: string, todayStr: string): string {
  if (dateStr < todayStr) return "Past";
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date(todayStr + "T00:00:00");
  const days = Math.round(
    (date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days < 7) return "This week";
  if (days < 14) return "Next week";
  if (days < 30) return "This month";
  return "Later";
}

function findOverlappingWeek(
  timeOff: TimeOff,
  scheduledWeekStarts: Set<string>,
): string | null {
  for (const weekStart of scheduledWeekStarts) {
    const wStart = new Date(weekStart + "T00:00:00");
    const wEnd = new Date(wStart);
    wEnd.setDate(wStart.getDate() + 6);
    const s = new Date(timeOff.start_date + "T00:00:00");
    const e = new Date(timeOff.end_date + "T00:00:00");
    if (s <= wEnd && e >= wStart) return weekStart;
  }
  return null;
}
