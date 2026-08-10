import { Link } from "react-router-dom";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { Shift } from "@/lib/types/schedule";
import { formatShiftTime } from "@/lib/utils/dates";

function hourFromTime(t: string): number {
  const [h, m] = t.split(":");
  return parseInt(h, 10) + parseInt(m ?? "0", 10) / 60;
}

export function OnTheFloor({
  shifts,
  dateLabel,
  emptyMessage = "No shifts scheduled for today.",
}: {
  shifts: Shift[];
  dateLabel: string;
  emptyMessage?: string;
}) {
  const now = new Date().getHours() + new Date().getMinutes() / 60;

  return (
    <div className="section" style={{ padding: "22px 22px 12px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div>
          <div className="headline-md">On the floor</div>
          <div
            className="body-sm"
            style={{ color: "var(--on-surface-muted)", marginTop: 3 }}
          >
            {dateLabel}
          </div>
        </div>
        <Link
          to="/schedules"
          className="btn btn-ghost"
          style={{
            padding: "4px 8px",
            textDecoration: "none",
          }}
        >
          Full schedule <ChevronRight size={14} />
        </Link>
      </div>

      {shifts.length === 0 ? (
        <div
          style={{
            padding: "24px 12px 20px",
            textAlign: "center",
            color: "var(--on-surface-muted)",
          }}
          className="body-sm"
        >
          {emptyMessage}
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.4fr 1fr 1fr 1fr 36px",
              gap: 12,
              padding: "8px 12px",
              boxShadow: "inset 0 -1px var(--hairline)",
            }}
          >
            {["Staff", "Shift", "Status", "Role", ""].map((h, i) => (
              <div key={i} className="label-sm" style={{ fontSize: 9.5 }}>
                {h}
              </div>
            ))}
          </div>
          <div>
            {shifts.map((s) => {
              const start = hourFromTime(s.start_time);
              const end = hourFromTime(s.end_time);
              const isLive = now >= start && now < end;
              const name = s.employee?.name ?? "Unknown";
              return (
                <div
                  key={s.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.4fr 1fr 1fr 1fr 36px",
                    gap: 12,
                    alignItems: "center",
                    padding: "9px 12px",
                    boxShadow: "inset 0 -1px var(--hairline)",
                    transition: "background 0.12s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "var(--surface-container)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <Avatar name={name} size={30} />
                    <div className="title-sm" style={{ fontSize: 13 }}>
                      {name}
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 12.5 }}>
                    {formatShiftTime(s.start_time)} –{" "}
                    {formatShiftTime(s.end_time)}
                  </div>
                  <div>
                    {isLive ? (
                      <span
                        className="chip"
                        style={{
                          background:
                            "color-mix(in oklab, var(--accent-fixed) 60%, var(--surface-high))",
                          fontWeight: 600,
                        }}
                      >
                        <span
                          className="chip-dot"
                          style={{ background: "var(--accent)" }}
                        />
                        On shift
                      </span>
                    ) : (
                      <span className="chip">
                        <span
                          className="chip-dot"
                          style={{ background: "var(--on-surface-faint)" }}
                        />
                        Upcoming
                      </span>
                    )}
                  </div>
                  <div
                    className="body-sm"
                    style={{ color: "var(--on-surface-muted)" }}
                  >
                    {s.employee?.role ?? "—"}
                  </div>
                  <button
                    className="btn btn-icon btn-ghost"
                    aria-label={`${name} actions`}
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
