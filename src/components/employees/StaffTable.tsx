import { ChevronRight, CalendarDays, Edit2, Trash2 } from "lucide-react";
import type { Employee } from "@/lib/types/employee";
import { Avatar } from "@/components/ui/Avatar";
import { roleHue } from "@/lib/utils/roles";

export interface StaffTableProps {
  employees: Employee[];
  onSelect: (e: Employee) => void;
  onEdit: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  onAvailability: (e: Employee) => void;
}

const COLS = "2fr 1.2fr 1fr 1fr 1fr 1fr";

export function StaffTable({
  employees,
  onSelect,
  onEdit,
  onDelete,
  onAvailability,
}: StaffTableProps) {
  return (
    <div
      style={{
        background: "var(--surface-container)",
        borderRadius: "var(--r-2xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        padding: "6px 14px 14px",
        overflowX: "auto",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: COLS,
          padding: "16px 14px 10px",
          gap: 16,
        }}
      >
        {["Staff", "Role", "Max hrs / wk", "Rate", "Status", "Actions"].map(
          (h, i) => (
            <div
              key={i}
              className="label-md"
              style={{
                textAlign: i >= 2 && i <= 3 ? "right" : "left",
              }}
            >
              {h}
            </div>
          ),
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {employees.map((s) => {
          const hue = roleHue(s.role);
          return (
            <div
              key={s.id}
              onClick={() => onSelect(s)}
              style={{
                display: "grid",
                gridTemplateColumns: COLS,
                alignItems: "center",
                padding: "12px 14px",
                borderRadius: 12,
                gap: 16,
                cursor: "pointer",
                background: "var(--surface-lowest)",
                boxShadow: "inset 0 0 0 1px var(--hairline)",
                transition: "background 0.12s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--surface-high)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "var(--surface-lowest)")
              }
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                <Avatar name={s.name} size={36} />
                <div style={{ minWidth: 0 }}>
                  <div
                    className="title-sm"
                    style={{
                      fontSize: 13.5,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {s.name}
                  </div>
                  <div
                    className="label-sm"
                    style={{ fontSize: 10 }}
                  >
                    {s.role}
                  </div>
                </div>
              </div>
              <div>
                <span
                  className="chip"
                  style={{
                    background: `oklch(0.88 0.04 ${hue})`,
                    color: `oklch(0.3 0.08 ${hue})`,
                  }}
                >
                  {s.role}
                </span>
              </div>
              <div className="mono" style={{ textAlign: "right", fontSize: 13 }}>
                {s.max_hours_per_week ?? 40}h
              </div>
              <div className="mono" style={{ textAlign: "right", fontSize: 13 }}>
                ${s.salary}
              </div>
              <div>
                {s.is_active ? (
                  <span
                    className="chip"
                    style={{
                      background:
                        "color-mix(in oklab, var(--accent-fixed) 50%, var(--surface-high))",
                    }}
                  >
                    <span
                      className="chip-dot"
                      style={{ background: "var(--accent)" }}
                    />
                    Active
                  </span>
                ) : (
                  <span
                    className="chip"
                    style={{
                      background: "var(--tertiary-fixed)",
                      color: "var(--on-surface)",
                    }}
                  >
                    <span
                      className="chip-dot"
                      style={{ background: "var(--warning)" }}
                    />
                    Inactive
                  </span>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 4,
                  justifyContent: "flex-end",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onAvailability(s)}
                  className="btn btn-icon btn-ghost"
                  aria-label={`Manage availability for ${s.name}`}
                  title="Manage availability"
                >
                  <CalendarDays size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(s)}
                  className="btn btn-icon btn-ghost"
                  aria-label={`Edit ${s.name}`}
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(s)}
                  className="btn btn-icon btn-ghost"
                  style={{ color: "var(--warning)" }}
                  aria-label={`Delete ${s.name}`}
                >
                  <Trash2 size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => onSelect(s)}
                  className="btn btn-icon btn-ghost"
                  aria-label={`Open ${s.name}`}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
