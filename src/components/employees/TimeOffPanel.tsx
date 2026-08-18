import { type FormEvent, useMemo, useState } from "react";
import { CalendarOff, Info, Plus, Trash2 } from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useSchedules } from "@/lib/hooks/use-schedules";
import {
  useTimeOff,
  useAddTimeOff,
  useDeleteTimeOff,
} from "@/lib/hooks/use-time-off";
import { toDateStr } from "@/lib/utils/dates";
import type { Employee } from "@/lib/types/employee";
import type { TimeOff } from "@/lib/types/timeOff";

interface TimeOffPanelProps {
  employee: Employee;
}

/**
 * Owner-facing time-off manager. Distinct from weekly availability — this
 * covers one-off dates (interviews, sickness, holidays). The generator
 * skips these dates on the next run, but existing schedules aren't
 * rewritten, so we surface a "regenerate" hint whenever an added range
 * overlaps a schedule that already exists.
 */
export function TimeOffPanel({ employee }: TimeOffPanelProps) {
  const today = toDateStr(new Date());
  const { data: restaurant } = useRestaurant();
  const { data: schedules } = useSchedules(restaurant?.id);
  const { data: rows = [], isLoading } = useTimeOff(employee.id);
  const addTimeOff = useAddTimeOff(employee.id);
  const deleteTimeOff = useDeleteTimeOff(employee.id);

  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(today);
  const [reason, setReason] = useState("");
  const [multiDay, setMultiDay] = useState(false);

  const scheduledWeekStarts = useMemo(
    () => new Set((schedules ?? []).map((s) => s.week_start)),
    [schedules],
  );

  const overlapsGenerated = (row: {
    start_date: string;
    end_date: string;
  }) => {
    // Any Monday within [start, end] that matches an existing schedule.
    for (const weekStart of scheduledWeekStarts) {
      const wStart = new Date(weekStart + "T00:00:00");
      const wEnd = new Date(wStart);
      wEnd.setDate(wStart.getDate() + 6);
      const s = new Date(row.start_date + "T00:00:00");
      const e = new Date(row.end_date + "T00:00:00");
      if (s <= wEnd && e >= wStart) return weekStart;
    }
    return null;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!start) return;
    const effectiveEnd = multiDay ? end : start;
    if (effectiveEnd < start) {
      // Backend also rejects, but catching here saves a round trip.
      return;
    }
    addTimeOff.mutate(
      {
        start_date: start,
        end_date: effectiveEnd,
        reason: reason.trim() || undefined,
      },
      {
        onSuccess: () => {
          setReason("");
          setStart(today);
          setEnd(today);
          setMultiDay(false);
        },
      },
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Add form */}
      <div className="section">
        <div className="label-md">Add time off</div>
        <div
          className="body-sm"
          style={{
            color: "var(--on-surface-muted)",
            marginTop: 4,
            marginBottom: 14,
          }}
        >
          Mark {employee.name.split(/\s+/)[0]} unavailable for one or more
          dates. This is separate from their weekly availability.
        </div>
        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: multiDay ? "1fr 1fr 1.4fr" : "1fr 1.4fr",
              gap: 10,
              alignItems: "end",
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
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "space-between",
            }}
          >
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
            <button
              type="submit"
              className="btn btn-primary"
              disabled={addTimeOff.isPending}
              style={{ fontSize: 13 }}
            >
              <Plus size={14} />{" "}
              {addTimeOff.isPending ? "Adding…" : "Add time off"}
            </button>
          </div>
        </form>
      </div>

      {/* List */}
      <div className="section">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <div className="label-md">Time off</div>
            <div className="headline-md" style={{ marginTop: 4 }}>
              {rows.length === 0
                ? "Nothing on the books"
                : `${rows.length} entr${rows.length === 1 ? "y" : "ies"}`}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div
            className="skeleton"
            style={{
              height: 80,
              marginTop: 14,
              borderRadius: "var(--r-lg)",
            }}
          />
        ) : rows.length === 0 ? (
          <div
            style={{
              padding: "28px 16px",
              textAlign: "center",
              color: "var(--on-surface-muted)",
              marginTop: 14,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <CalendarOff
              size={22}
              style={{ color: "var(--on-surface-faint)" }}
            />
            <div className="body-sm">
              Add time off above when {employee.name.split(/\s+/)[0]} can't
              work specific dates.
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginTop: 14,
            }}
          >
            {rows.map((row) => (
              <TimeOffRow
                key={row.id}
                row={row}
                overlapsWeek={overlapsGenerated(row)}
                onDelete={() => deleteTimeOff.mutate(row.id)}
                isDeleting={
                  deleteTimeOff.isPending &&
                  deleteTimeOff.variables === row.id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TimeOffRow({
  row,
  overlapsWeek,
  onDelete,
  isDeleting,
}: {
  row: TimeOff;
  overlapsWeek: string | null;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  const start = new Date(row.start_date + "T00:00:00");
  const end = new Date(row.end_date + "T00:00:00");
  const isSingle = row.start_date === row.end_date;
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      style={{
        borderRadius: "var(--r-lg)",
        background: "var(--surface-lowest)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="title-sm" style={{ fontSize: 13 }}>
            {isSingle ? fmt(start) : `${fmt(start)} → ${fmt(end)}`}
          </div>
          {row.reason && (
            <div
              className="body-sm"
              style={{
                fontSize: 12,
                color: "var(--on-surface-muted)",
                marginTop: 2,
              }}
            >
              {row.reason}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onDelete}
          disabled={isDeleting}
          className="btn btn-ghost btn-icon"
          aria-label="Remove time off"
          title="Remove time off"
        >
          <Trash2 size={14} />
        </button>
      </div>
      {overlapsWeek && (
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
            Overlaps the week of {overlapsWeek}. Regenerate that schedule to
            apply this time off to existing assignments.
          </span>
        </div>
      )}
    </div>
  );
}
