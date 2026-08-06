import { useEffect, useState } from "react";
import { X, Check, Minus, Plus, Trash2 } from "lucide-react";
import { toHHMM, toHHMMSS, formatShiftTime } from "@/lib/utils/dates";
import { makeGroupId, type TemplateGroup } from "@/lib/utils/templates";
import { roleHue } from "@/lib/utils/roles";
import type { Role } from "@/lib/types/template";

const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];
const DAY_LABELS: Array<{ n: number; label: string }> = [
  { n: 1, label: "Mon" },
  { n: 2, label: "Tue" },
  { n: 3, label: "Wed" },
  { n: 4, label: "Thu" },
  { n: 5, label: "Fri" },
  { n: 6, label: "Sat" },
  { n: 7, label: "Sun" },
];

export interface TemplateModalProps {
  /** Undefined for a new template. */
  group?: TemplateGroup;
  onSave: (g: TemplateGroup) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

export function TemplateModal({
  group,
  onSave,
  onDelete,
  onClose,
}: TemplateModalProps) {
  const isNew = !group;
  const [days, setDays] = useState<number[]>(group?.days ?? [1, 2, 3, 4, 5]);
  const [start, setStart] = useState(group?.start_time ?? "09:00:00");
  const [end, setEnd] = useState(group?.end_time ?? "17:00:00");
  const [role, setRole] = useState<Role>(group?.role ?? "Server");
  const [count, setCount] = useState<number>(group?.count ?? 1);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const canSave = days.length > 0 && start && end && start < end;

  const toggleDay = (n: number) =>
    setDays((prev) =>
      prev.includes(n) ? prev.filter((d) => d !== n) : [...prev, n],
    );

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      id: group?.id ?? makeGroupId(),
      days: [...days].sort((a, b) => a - b),
      start_time: start,
      end_time: end,
      role,
      count,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ width: 480 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div className="label-md">
              {isNew ? "New template" : "Edit template"}
            </div>
            <div className="headline-md" style={{ marginTop: 4 }}>
              {isNew
                ? "Add a recurring shift"
                : `${role} · ${formatShiftTime(start)}–${formatShiftTime(end)}`}
            </div>
          </div>
          <button
            className="btn btn-icon btn-ghost"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            marginTop: 20,
          }}
        >
          {/* Days */}
          <div>
            <div className="label-md" style={{ marginBottom: 6 }}>
              Days
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 4,
              }}
            >
              {DAY_LABELS.map((d) => {
                const on = days.includes(d.n);
                return (
                  <button
                    key={d.n}
                    type="button"
                    onClick={() => toggleDay(d.n)}
                    aria-pressed={on}
                    style={{
                      padding: "9px 0",
                      borderRadius: 9,
                      fontSize: 11.5,
                      fontWeight: 600,
                      fontFamily: "var(--font-label)",
                      background: on
                        ? "var(--surface-lowest)"
                        : "var(--surface-highest)",
                      color: on
                        ? "var(--on-surface)"
                        : "var(--on-surface-faint)",
                      boxShadow: on
                        ? "inset 0 0 0 2px var(--accent-fixed)"
                        : "none",
                      transition: "all 0.14s",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Start / end */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
            }}
          >
            <div>
              <label
                className="label-md"
                htmlFor="tpl-start"
                style={{ display: "block", marginBottom: 6 }}
              >
                Starts
              </label>
              <input
                id="tpl-start"
                type="time"
                className="input mono"
                value={toHHMM(start)}
                onChange={(e) => setStart(toHHMMSS(e.target.value))}
                style={{ fontSize: 13 }}
              />
            </div>
            <div>
              <label
                className="label-md"
                htmlFor="tpl-end"
                style={{ display: "block", marginBottom: 6 }}
              >
                Ends
              </label>
              <input
                id="tpl-end"
                type="time"
                className="input mono"
                value={toHHMM(end)}
                onChange={(e) => setEnd(toHHMMSS(e.target.value))}
                style={{ fontSize: 13 }}
              />
            </div>
          </div>

          {/* Role + count */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              gap: 10,
              alignItems: "end",
            }}
          >
            <div>
              <div className="label-md" style={{ marginBottom: 6 }}>
                Role
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                {ROLES.map((r) => {
                  const hue = roleHue(r);
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      style={{
                        flex: 1,
                        padding: "9px 4px",
                        borderRadius: 9,
                        fontSize: 11.5,
                        fontWeight: 600,
                        background: active
                          ? `oklch(0.9 0.05 ${hue})`
                          : "var(--surface-highest)",
                        color: active
                          ? `oklch(0.3 0.08 ${hue})`
                          : "var(--on-surface-muted)",
                        boxShadow: active
                          ? `inset 0 0 0 2px oklch(0.6 0.12 ${hue})`
                          : "none",
                        transition: "all 0.14s",
                        whiteSpace: "nowrap",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="label-md" style={{ marginBottom: 6 }}>
                Needed
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  background: "var(--surface-highest)",
                  borderRadius: 9,
                  padding: 3,
                }}
              >
                <button
                  type="button"
                  onClick={() => setCount((c) => Math.max(1, c - 1))}
                  className="btn btn-icon btn-ghost"
                  style={{ width: 30, height: 30 }}
                  aria-label="Decrease"
                >
                  <Minus size={13} />
                </button>
                <span
                  className="mono"
                  style={{
                    width: 26,
                    textAlign: "center",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {count}
                </span>
                <button
                  type="button"
                  onClick={() => setCount((c) => Math.min(9, c + 1))}
                  className="btn btn-icon btn-ghost"
                  style={{ width: 30, height: 30 }}
                  aria-label="Increase"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 24,
          }}
        >
          {!isNew && onDelete && (
            <button
              type="button"
              className="btn btn-ghost"
              style={{ color: "var(--warning)" }}
              onClick={() => onDelete(group!.id)}
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <div style={{ flex: 1 }} />
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={!canSave}
          >
            <Check size={14} />{" "}
            {isNew ? "Create template" : "Save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
