import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Users, CalendarDays, Clock, DollarSign, ArrowRight } from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useSchedules, useScheduleDetail } from "@/lib/hooks/use-schedules";
import {
  getMondayOfWeek,
  toDateStr,
  fromDateStr,
  formatShiftTime,
  getWeekRangeLabel,
} from "@/lib/utils/dates";
import type { Employee } from "@/lib/types/employee";

// ── Helpers ───────────────────────────────────────────────────

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Server:  { bg: "var(--color-primary-fixed)",        text: "var(--color-primary)" },
  Cook:    { bg: "var(--color-warning-container)",     text: "var(--color-warning)" },
  Host:    { bg: "var(--color-secondary-container)",   text: "var(--color-on-secondary-container)" },
  Manager: { bg: "var(--color-tertiary-fixed)",        text: "#8b1d18" },
};

function fmtHours(h: number | null | undefined) {
  if (h == null || isNaN(h)) return "—";
  return h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;
}

function fmtCurrency(n: number) {
  return n >= 1000
    ? `$${(n / 1000).toFixed(1)}k`
    : `$${Math.round(n)}`;
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  loading?: boolean;
}) {
  return (
    <div className="card flex flex-col gap-3">
      <div className="w-8 h-8 rounded-lg grid place-items-center bg-surface-container shrink-0">
        <Icon size={15} className="text-on-surface-muted" />
      </div>
      <div>
        {loading ? (
          <div className="skeleton h-7 w-16 rounded-md mb-1" />
        ) : (
          <p className="headline-md mono">{value}</p>
        )}
        <p className="label-md mt-0.5">{label}</p>
        {sub && !loading && (
          <p className="body-sm text-on-surface-faint mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

function RoleBar({ employees }: { employees: Employee[] }) {
  const roles = ["Server", "Cook", "Host", "Manager"] as const;
  const active = employees.filter((e) => e.is_active);
  const total = active.length;

  if (total === 0) return <p className="body-sm text-on-surface-faint">No active employees</p>;

  const counts = roles.map((role) => ({
    role,
    count: active.filter((e) => e.role === role).length,
  })).filter((r) => r.count > 0);

  return (
    <div className="flex flex-col gap-3">
      {/* stacked bar */}
      <div className="flex rounded-full overflow-hidden h-2.5 gap-px">
        {counts.map(({ role, count }) => (
          <div
            key={role}
            style={{
              width: `${(count / total) * 100}%`,
              background: ROLE_COLORS[role]?.bg ?? "var(--color-surface-high)",
            }}
          />
        ))}
      </div>

      {/* legend */}
      <div className="flex flex-col gap-2">
        {counts.map(({ role, count }) => (
          <div key={role} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: ROLE_COLORS[role]?.bg ?? "var(--color-surface-high)" }}
              />
              <span className="body-sm">{role}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="label-md text-on-surface-faint">
                {Math.round((count / total) * 100)}%
              </span>
              <span className="label-md font-semibold text-on-surface w-4 text-right">
                {count}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const { data: restaurant } = useRestaurant();
  const { data: employees, isLoading: empLoading } = useEmployees(restaurant?.id);
  const { data: schedules, isLoading: schLoading } = useSchedules(restaurant?.id);

  const thisMonday = useMemo(() => toDateStr(getMondayOfWeek(new Date())), []);
  const today = useMemo(() => toDateStr(new Date()), []);

  // Find the current week's schedule from the list (don't auto-create on dashboard)
  const thisWeekSchedule = useMemo(
    () => schedules?.find((s) => s.week_start === thisMonday),
    [schedules, thisMonday],
  );

  const { data: scheduleDetail, isLoading: detailLoading } = useScheduleDetail(
    thisWeekSchedule?.id,
  );

  // Derived metrics
  const activeEmployees = useMemo(
    () => employees?.filter((e) => e.is_active) ?? [],
    [employees],
  );

  const thisWeekShifts = thisWeekSchedule?.total_shifts ?? 0;
  const thisWeekHours  = thisWeekSchedule?.total_hours  ?? 0;

  const estWeeklyCost = useMemo(() => {
    if (!scheduleDetail?.shifts || !employees) return null;
    return scheduleDetail.shifts.reduce((sum, shift) => {
      const emp = employees.find((e) => e.id === shift.employee_id);
      return sum + (emp?.salary ?? 0) * (shift.duration_hours ?? 0);
    }, 0);
  }, [scheduleDetail, employees]);

  const todayShifts = useMemo(
    () => (scheduleDetail?.shifts ?? [])
      .filter((s) => s.shift_date === today)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
    [scheduleDetail, today],
  );

  const recentSchedules = useMemo(
    () => (schedules ?? [])
      .slice()
      .sort((a, b) => b.week_start.localeCompare(a.week_start))
      .slice(0, 5),
    [schedules],
  );

  const loading = empLoading || schLoading;
  const weekLabel = getWeekRangeLabel(fromDateStr(thisMonday));

  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Overview</span>
          <h1 className="headline-lg mt-1.5">Dashboard</h1>
        </div>
        <Link to="/schedules" className="btn btn-secondary py-2 text-sm">
          View schedules
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* ── Stat row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Users}
          label="Active employees"
          value={String(activeEmployees.length)}
          sub={`${employees?.length ?? 0} total`}
          loading={loading}
        />
        <StatCard
          icon={CalendarDays}
          label="Shifts this week"
          value={thisWeekSchedule ? String(thisWeekShifts) : "—"}
          sub={thisWeekSchedule ? weekLabel : "No schedule yet"}
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Hours scheduled"
          value={thisWeekSchedule ? fmtHours(thisWeekHours) : "—"}
          sub={thisWeekSchedule ? `avg ${activeEmployees.length ? fmtHours(Math.round(thisWeekHours / activeEmployees.length * 10) / 10) : "—"} / person` : undefined}
          loading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="Est. weekly cost"
          value={estWeeklyCost != null ? fmtCurrency(estWeeklyCost) : "—"}
          sub={detailLoading ? "calculating…" : estWeeklyCost != null ? "based on hourly rates" : "no schedule yet"}
          loading={loading}
        />
      </div>

      {/* ── Middle row ── */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's shifts */}
        <div className="card lg:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="title-md">Today's shifts</h2>
            <span className="label-md">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

          {detailLoading || (schLoading && !scheduleDetail) ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : todayShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
              <p className="body-sm text-on-surface-muted">
                {thisWeekSchedule
                  ? "No shifts scheduled for today"
                  : "No schedule for this week yet"}
              </p>
              {!thisWeekSchedule && (
                <Link to="/schedules" className="btn btn-secondary py-1.5 text-sm mt-1">
                  Generate schedule
                </Link>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {todayShifts.map((shift) => {
                const colors = ROLE_COLORS[shift.employee?.role ?? ""] ?? {
                  bg: "var(--color-surface-high)",
                  text: "var(--color-on-surface-muted)",
                };
                return (
                  <div
                    key={shift.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-low"
                  >
                    <div
                      className="w-7 h-7 rounded-lg grid place-items-center shrink-0 text-[10px] font-bold font-display"
                      style={{ background: colors.bg, color: colors.text }}
                    >
                      {(shift.employee?.name ?? "?").charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="body-sm font-semibold truncate">
                        {shift.employee?.name ?? "Unknown"}
                      </p>
                      <p className="label-md truncate">{shift.employee?.role}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="body-sm mono text-on-surface">
                        {formatShiftTime(shift.start_time)} – {formatShiftTime(shift.end_time)}
                      </p>
                      <p className="label-md text-on-surface-faint">
                        {fmtHours(shift.duration_hours ?? 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Team composition */}
        <div className="card flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="title-md">Team</h2>
            <Link to="/employees" className="label-md text-primary hover:underline">
              Manage
            </Link>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="headline-md mono">{activeEmployees.length}</span>
            <span className="body-sm text-on-surface-muted">active</span>
          </div>

          {empLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="skeleton h-5 rounded" />)}
            </div>
          ) : (
            <RoleBar employees={employees ?? []} />
          )}
        </div>
      </div>

      {/* ── Recent schedules ── */}
      <div className="mt-4 card flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="title-md">Recent schedules</h2>
          <Link to="/schedules" className="label-md text-primary hover:underline">
            All schedules
          </Link>
        </div>

        {schLoading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="skeleton h-10 rounded-xl" />)}
          </div>
        ) : recentSchedules.length === 0 ? (
          <div className="py-6 text-center">
            <p className="body-sm text-on-surface-muted mb-3">No schedules created yet</p>
            <Link to="/schedules" className="btn btn-primary py-2 text-sm">
              Create first schedule
            </Link>
          </div>
        ) : (
          <div className="flex flex-col">
            {recentSchedules.map((s, i) => {
              const monday = fromDateStr(s.week_start);
              const isThisWeek = s.week_start === thisMonday;
              return (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 py-3 ${i < recentSchedules.length - 1 ? "border-b border-surface-highest" : ""}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="body-sm font-semibold">{getWeekRangeLabel(monday)}</p>
                      {isThisWeek && (
                        <span className="badge badge-success">This week</span>
                      )}
                    </div>
                    <p className="label-md mt-0.5">
                      {s.total_shifts} shift{s.total_shifts !== 1 ? "s" : ""} · {fmtHours(s.total_hours)}
                    </p>
                  </div>
                  <Link
                    to={`/schedules?id=${s.id}`}
                    className="btn btn-ghost py-1.5 text-sm"
                  >
                    View
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
