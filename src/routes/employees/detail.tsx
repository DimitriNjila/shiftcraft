import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  Mail,
  Phone,
  Clock,
  Send,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useEmployees,
  useUpdateEmployee,
} from "@/lib/hooks/use-employees";
import { useAvailability } from "@/lib/hooks/use-availability";
import { useSchedules, useScheduleDetail } from "@/lib/hooks/use-schedules";
import { Avatar } from "@/components/ui/Avatar";
import { EmployeeModal } from "@/components/employees/EmployeeModal";
import { TimeOffPanel } from "@/components/employees/TimeOffPanel";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { usePageMeta } from "@/components/layout/page-meta";
import {
  formatShiftTime,
  getMondayOfWeek,
  toDateStr,
} from "@/lib/utils/dates";
import type { Employee } from "@/lib/types/employee";
import type { Shift } from "@/lib/types/schedule";

type Tab = "overview" | "schedule" | "availability" | "timeoff" | "documents";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "Schedule" },
  { id: "availability", label: "Availability" },
  { id: "timeoff", label: "Time off" },
  { id: "documents", label: "Documents" },
];

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: restaurant } = useRestaurant();
  const { data: employees, isLoading } = useEmployees(restaurant?.id);
  const updateEmployee = useUpdateEmployee();

  const [tab, setTab] = useState<Tab>("overview");
  const [editOpen, setEditOpen] = useState(false);

  const employee = useMemo(
    () => employees?.find((e) => e.id === id),
    [employees, id],
  );

  usePageMeta({
    title: employee?.name ?? "Staff",
    breadcrumbs: ["Staff", employee?.name ?? "Profile"],
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  if (!employee) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <button
          onClick={() => navigate("/employees")}
          className="btn btn-ghost"
          style={{ alignSelf: "flex-start", padding: "4px 8px", marginLeft: -8 }}
        >
          <ChevronLeft size={14} /> All staff
        </button>
        <div
          className="section"
          style={{ padding: 48, textAlign: "center" }}
        >
          <div className="label-md">Not found</div>
          <div className="headline-md" style={{ marginTop: 4 }}>
            This staff member no longer exists
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <button
        onClick={() => navigate("/employees")}
        className="btn btn-ghost"
        style={{ alignSelf: "flex-start", padding: "4px 8px", marginLeft: -8 }}
      >
        <ChevronLeft size={14} /> All staff
      </button>

      {/* Header card */}
      <div
        style={{
          background: "var(--surface-container)",
          borderRadius: "var(--r-2xl)",
          boxShadow: "inset 0 0 0 1px var(--hairline)",
          padding: 32,
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
        }}
      >
        <Avatar name={employee.name} size={88} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="label-md">{employee.role}</div>
          <div className="display-md" style={{ marginTop: 6 }}>
            {employee.name}
          </div>
          <div
            style={{
              display: "flex",
              gap: 24,
              marginTop: 18,
              flexWrap: "wrap",
              color: "var(--on-surface-muted)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Mail size={14} />
              <span className="body-sm">—</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Phone size={14} />
              <span className="body-sm">—</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={14} />
              <span className="body-sm">
                Hired{" "}
                {new Date(employee.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className="btn btn-secondary" disabled>
            <Send size={14} /> Message
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setEditOpen(true)}
          >
            <Edit2 size={14} /> Edit
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 2,
          padding: 4,
          background: "var(--surface-container)",
          borderRadius: 12,
          width: "fit-content",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              background:
                tab === t.id ? "var(--surface-lowest)" : "transparent",
              color:
                tab === t.id
                  ? "var(--on-surface)"
                  : "var(--on-surface-muted)",
              fontSize: 12.5,
              fontWeight: 600,
              boxShadow:
                tab === t.id ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab employee={employee} />}
      {tab === "schedule" && <ScheduleTab employee={employee} />}
      {tab === "availability" && <AvailabilityTab employee={employee} />}
      {tab === "timeoff" && <TimeOffPanel employee={employee} />}
      {tab === "documents" && <ComingSoon label="Documents" />}

      {editOpen && restaurant?.id && (
        <EmployeeModal
          employee={employee}
          restaurantId={restaurant.id}
          isPending={updateEmployee.isPending}
          onSubmit={({ name, role, salary, maxHoursPerWeek }) => {
            updateEmployee.mutate(
              {
                id: employee.id,
                updates: {
                  name,
                  role,
                  salary,
                  max_hours_per_week: maxHoursPerWeek,
                },
              },
              { onSuccess: () => setEditOpen(false) },
            );
          }}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

/* ─── Overview tab ─── */

function OverviewTab({ employee }: { employee: Employee }) {
  const { data: restaurant } = useRestaurant();
  const monday = useMemo(() => getMondayOfWeek(new Date()), []);
  const weekStart = toDateStr(monday);
  const { data: schedules } = useSchedules(restaurant?.id);
  const thisWeekSchedule = useMemo(
    () => schedules?.find((s) => s.week_start === weekStart),
    [schedules, weekStart],
  );
  const { data: scheduleDetail } = useScheduleDetail(thisWeekSchedule?.id);

  const myShifts = useMemo(
    () =>
      (scheduleDetail?.shifts ?? [])
        .filter((s) => s.employee_id === employee.id)
        .sort((a, b) => a.shift_date.localeCompare(b.shift_date)),
    [scheduleDetail, employee.id],
  );

  const hoursThisWeek = myShifts.reduce(
    (sum, s) => sum + (s.duration_hours ?? 0),
    0,
  );
  const earningsMtd = Math.round(hoursThisWeek * employee.salary * 3.2);

  return (
    <div
      className="mobile-stack"
      style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}
    >
      {/* Left — stats + upcoming shifts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 12,
          }}
        >
          <StatBlock
            label="Hours this week"
            value={`${hoursThisWeek}h`}
            sub={`of ${employee.max_hours_per_week}h cap`}
          />
          <StatBlock
            label="Earnings MTD"
            value={`$${earningsMtd.toLocaleString()}`}
            sub="gross"
          />
          <StatBlock label="Attendance" value="—" sub="last 90 days" />
        </div>

        <div className="section">
          <div className="label-md">Upcoming shifts</div>
          <div className="headline-md" style={{ marginTop: 4, marginBottom: 14 }}>
            This week
          </div>
          {myShifts.length === 0 ? (
            <div
              style={{
                padding: 20,
                textAlign: "center",
                color: "var(--on-surface-muted)",
              }}
              className="body-sm"
            >
              No shifts scheduled this week
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {myShifts.map((s) => (
                <UpcomingShiftRow key={s.id} shift={s} role={employee.role} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — employment + emergency contact */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div className="section">
          <div className="label-md">Employment</div>
          <div style={{ marginTop: 14 }}>
            {[
              ["Role", employee.role],
              ["Pay rate", `$${employee.salary}/hr`],
              ["Weekly cap", `${employee.max_hours_per_week}h`],
              ["Employment type", "Part-time"],
              [
                "Start date",
                new Date(employee.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  year: "numeric",
                }),
              ],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 0",
                  boxShadow: "inset 0 -1px var(--hairline)",
                }}
              >
                <span className="body-sm" style={{ color: "var(--on-surface-muted)" }}>
                  {k}
                </span>
                <span className="title-sm" style={{ fontSize: 13 }}>
                  {v}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="section">
          <div className="label-md">Emergency contact</div>
          <div
            style={{
              marginTop: 14,
              color: "var(--on-surface-muted)",
              fontSize: 12.5,
            }}
          >
            No emergency contact on file.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      style={{
        background: "var(--surface-lowest)",
        padding: 16,
        borderRadius: "var(--r-lg)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
      }}
    >
      <div className="label-md" style={{ fontSize: 10 }}>
        {label}
      </div>
      <div className="title-lg mono" style={{ marginTop: 4 }}>
        {value}
      </div>
      <div
        className="body-sm"
        style={{ color: "var(--on-surface-muted)", fontSize: 11 }}
      >
        {sub}
      </div>
    </div>
  );
}

function UpcomingShiftRow({ shift, role }: { shift: Shift; role: string }) {
  const date = new Date(shift.shift_date + "T00:00:00");
  const dow = DAYS[(date.getDay() + 6) % 7];
  const dayNum = date.getDate();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "60px 120px 1fr auto",
        alignItems: "center",
        padding: "12px 14px",
        borderRadius: 10,
        background: "var(--surface-lowest)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        gap: 14,
      }}
    >
      <div>
        <div className="label-md" style={{ fontSize: 9 }}>
          {dow}
        </div>
        <div className="title-sm mono" style={{ fontSize: 14 }}>
          {dayNum}
        </div>
      </div>
      <div className="mono" style={{ fontSize: 12 }}>
        {formatShiftTime(shift.start_time)} – {formatShiftTime(shift.end_time)}
      </div>
      <div>
        <span className="chip">{role}</span>
      </div>
      <div className="label-sm">{shift.duration_hours}h</div>
    </div>
  );
}

/* ─── Schedule tab ─── */

function ScheduleTab({ employee }: { employee: Employee }) {
  return <OverviewTab employee={employee} />;
}

/* ─── Availability tab ─── */

function AvailabilityTab({ employee }: { employee: Employee }) {
  const { data: windows } = useAvailability(employee.id);
  const blocks = [
    { id: 0, label: "Early", range: "4a–8a", start: 4, end: 8 },
    { id: 1, label: "Morning", range: "8a–12p", start: 8, end: 12 },
    { id: 2, label: "Afternoon", range: "12p–5p", start: 12, end: 17 },
    { id: 3, label: "Evening", range: "5p–10p", start: 17, end: 22 },
  ];

  // A block is "available" if any window on that day OVERLAPS the block —
  // not only when the window fully contains it. An employee who's free
  // 9a–5p should still light up the Morning (8–12) and Afternoon (12–17)
  // blocks even though the window doesn't start at 8. Use decimal hours
  // so half-hour edges (e.g. 12:30) are respected.
  const toDecimalHours = (t: string) => {
    const [h, m] = t.split(":").map(Number);
    return (h ?? 0) + (m ?? 0) / 60;
  };
  const isAvailable = (dayIso: number, blockStart: number, blockEnd: number) => {
    return (windows ?? []).some((w) => {
      if (w.day_of_week !== dayIso) return false;
      const wStart = toDecimalHours(w.start_time);
      const wEnd = toDecimalHours(w.end_time);
      return wStart < blockEnd && wEnd > blockStart;
    });
  };

  return (
    <div className="section">
      <div className="label-md">Availability</div>
      <div className="headline-md" style={{ marginTop: 4, marginBottom: 4 }}>
        Weekly availability
      </div>
      <div
        className="body-sm"
        style={{ color: "var(--on-surface-muted)", marginBottom: 20 }}
      >
        Self-reported by {employee.name.split(/\s+/)[0]}.
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "150px repeat(7, 1fr)",
          gap: 6,
        }}
      >
        <div />
        {DAYS.map((d) => (
          <div
            key={d}
            className="label-md"
            style={{ textAlign: "center" }}
          >
            {d}
          </div>
        ))}
        {blocks.map((b) => (
          <>
            <div
              key={b.id + "-label"}
              className="body-sm"
              style={{
                padding: "10px 4px",
                color: "var(--on-surface-muted)",
              }}
            >
              {b.label} ({b.range})
            </div>
            {DAYS.map((_, i) => {
              const iso = i + 1; // Mon=1
              const on = isAvailable(iso, b.start, b.end);
              return (
                <div
                  key={`${b.id}-${i}`}
                  style={{
                    background: on
                      ? "color-mix(in oklab, var(--accent-fixed) 60%, var(--surface-high))"
                      : "var(--surface-high)",
                    borderRadius: 8,
                    height: 44,
                    display: "grid",
                    placeItems: "center",
                    color: on
                      ? "var(--on-surface)"
                      : "var(--on-surface-faint)",
                  }}
                >
                  {on ? <Check size={14} /> : <X size={12} />}
                </div>
              );
            })}
          </>
        ))}
      </div>
    </div>
  );
}

/* ─── Coming-soon placeholder ─── */

function ComingSoon({ label }: { label: string }) {
  return (
    <div
      className="section"
      style={{ padding: 48, textAlign: "center" }}
    >
      <div className="label-md">Coming soon</div>
      <div className="headline-md" style={{ marginTop: 4 }}>
        {label} tab
      </div>
    </div>
  );
}
