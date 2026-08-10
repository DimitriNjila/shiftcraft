import { useMemo } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { Calendar, AlertTriangle } from "lucide-react";
import {
  useDownloadICal,
  usePublicSchedule,
} from "@/lib/hooks/use-share-link";
import { BrandMark } from "@/components/ui/BrandMark";
import { Avatar } from "@/components/ui/Avatar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatShiftTime, fromDateStr, getWeekRangeLabel } from "@/lib/utils/dates";
import { roleHue } from "@/lib/utils/roles";
import type { PublicShift } from "@/lib/types/schedule";

/**
 * Public-facing schedule view rendered at /shared/:token. Rendered OUTSIDE
 * the ProtectedRoute + AppLayout wrappers — no login required.
 *
 * The API doesn't distinguish between unknown / disabled / expired tokens
 * (all return 404), so the error state uses one friendly message.
 */
export default function SharedSchedulePage() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  // ShareModal embeds the schedule_id as `s` so we can pass it to the
  // iCal endpoint. If the URL was shared without it (e.g. a manually
  // trimmed link), the calendar button falls back to disabled.
  const scheduleId = searchParams.get("s") ?? undefined;
  const { data, isLoading, isError } = usePublicSchedule(token);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Header />
      <main
        style={{
          maxWidth: 640,
          margin: "0 auto",
          padding: "32px 20px 64px",
        }}
      >
        {isLoading ? (
          <LoadingState />
        ) : isError || !data ? (
          <ExpiredState />
        ) : (
          <ScheduleView
            shifts={data.shifts}
            weekStart={data.week_start}
            restaurantName={data.restaurant_name}
            token={token}
            scheduleId={scheduleId}
          />
        )}
      </main>
      <PoweredByFooter />
    </div>
  );
}

/* ─── Header ─── */

function Header() {
  return (
    <header
      style={{
        padding: "20px 20px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
      }}
    >
      <BrandMark size={26} />
      <span
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 500,
          fontSize: 17,
        }}
      >
        Mise en place
      </span>
    </header>
  );
}

/* ─── Loading state ─── */

function LoadingState() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 20px",
        color: "var(--on-surface-muted)",
        gap: 16,
      }}
    >
      <LoadingSpinner size={28} />
      <div className="body-sm">Loading schedule…</div>
    </div>
  );
}

/* ─── Expired / invalid state ─── */

function ExpiredState() {
  return (
    <div
      className="card"
      style={{
        marginTop: 40,
        padding: "40px 28px",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: "var(--warning-container)",
          color: "var(--warning)",
          display: "grid",
          placeItems: "center",
        }}
      >
        <AlertTriangle size={22} />
      </div>
      <div className="headline-md">This link isn't available.</div>
      <div
        className="body-md"
        style={{ color: "var(--on-surface-muted)", maxWidth: "44ch" }}
      >
        The shared schedule link may have expired, been revoked, or never
        existed. Ask your manager for a fresh link.
      </div>
      <Link
        to="/"
        className="btn btn-ghost"
        style={{ marginTop: 8, textDecoration: "none" }}
      >
        Back to home
      </Link>
    </div>
  );
}

/* ─── Schedule view ─── */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function ScheduleView({
  shifts,
  weekStart,
  restaurantName,
  token,
  scheduleId,
}: {
  shifts: PublicShift[];
  weekStart: string;
  restaurantName: string;
  token: string | undefined;
  scheduleId: string | undefined;
}) {
  const downloadICal = useDownloadICal();
  // Group by ISO date so we render one section per weekday.
  const byDate = useMemo(() => {
    const map = new Map<string, PublicShift[]>();
    for (const s of shifts) {
      const arr = map.get(s.shift_date) ?? [];
      arr.push(s);
      map.set(s.shift_date, arr);
    }
    // Sort shifts within each day by start_time.
    for (const arr of map.values()) {
      arr.sort((a, b) => a.start_time.localeCompare(b.start_time));
    }
    return map;
  }, [shifts]);

  const weekLabel = useMemo(
    () => getWeekRangeLabel(fromDateStr(weekStart)),
    [weekStart],
  );

  // Iterate Mon-Sun off the week_start date.
  const days = useMemo(() => {
    const start = fromDateStr(weekStart);
    return DAY_LABELS.map((label, i) => {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const iso = d.toISOString().slice(0, 10);
      return { label, iso, date: d };
    });
  }, [weekStart]);

  return (
    <>
      <div style={{ marginBottom: 24, textAlign: "center" }}>
        <div className="label-md">{restaurantName}</div>
        <h1
          className="display-md"
          style={{ margin: "6px 0 4px", fontSize: 28 }}
        >
          Week of {weekLabel}
        </h1>
        <div className="body-sm" style={{ color: "var(--on-surface-muted)" }}>
          {shifts.length} shift{shifts.length === 1 ? "" : "s"} scheduled
        </div>
      </div>

      {shifts.length === 0 ? (
        <div
          className="card"
          style={{ padding: 32, textAlign: "center" }}
        >
          <div className="body-md" style={{ color: "var(--on-surface-muted)" }}>
            No shifts scheduled for this week.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {days.map(({ label, iso, date }) => {
            const dayShifts = byDate.get(iso) ?? [];
            if (dayShifts.length === 0) return null;
            return (
              <section key={iso}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    margin: "0 4px 8px",
                  }}
                >
                  <span
                    className="title-md"
                    style={{ fontSize: 15 }}
                  >
                    {label}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: 11,
                      color: "var(--on-surface-faint)",
                    }}
                  >
                    {date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {dayShifts.map((s, i) => (
                    <ShiftRow key={`${iso}-${i}`} shift={s} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        style={{
          width: "100%",
          justifyContent: "center",
          marginTop: 28,
          padding: "13px 16px",
          fontSize: 14,
        }}
        disabled={!scheduleId || !token || downloadICal.isPending}
        onClick={() => {
          if (!scheduleId || !token) return;
          downloadICal.mutate({
            scheduleId,
            publicToken: token,
            filename: `schedule_${weekStart}.ics`,
          });
        }}
        title={
          !scheduleId
            ? "Calendar export needs a link that includes the schedule id"
            : undefined
        }
      >
        <Calendar size={16} />{" "}
        {downloadICal.isPending
          ? "Preparing calendar…"
          : "Add to my calendar"}
      </button>
      {!scheduleId && (
        <p
          className="body-sm"
          style={{
            color: "var(--on-surface-muted)",
            textAlign: "center",
            marginTop: 8,
            fontSize: 11.5,
          }}
        >
          Calendar export is available from the manager's original link.
        </p>
      )}
    </>
  );
}

function ShiftRow({ shift }: { shift: PublicShift }) {
  const hue = roleHue(shift.role);
  const first = shift.employee_name.split(/\s+/)[0];
  return (
    <div
      style={{
        background: "var(--surface-lowest)",
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        boxShadow:
          "inset 0 0 0 1px var(--hairline), var(--shadow-ambient)",
      }}
    >
      <Avatar name={shift.employee_name} size={38} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="title-sm" style={{ fontSize: 13.5 }}>
          {first}
        </div>
        <div className="label-sm" style={{ fontSize: 10 }}>
          {shift.role}
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          className="mono"
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: `oklch(0.35 0.09 ${hue})`,
          }}
        >
          {formatShiftTime(shift.start_time)} –{" "}
          {formatShiftTime(shift.end_time)}
        </div>
      </div>
    </div>
  );
}

/* ─── Footer ─── */

function PoweredByFooter() {
  return (
    <footer
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "24px 20px 32px",
        color: "var(--on-surface-muted)",
      }}
    >
      <BrandMark size={16} style={{ fontSize: 9 }} />
      <span className="body-sm">
        Scheduling by{" "}
        <strong
          style={{
            color: "var(--accent)",
            fontFamily: "'Newsreader', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 500,
          }}
        >
          Mise en place
        </strong>
      </span>
    </footer>
  );
}
