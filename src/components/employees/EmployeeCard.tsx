import { CalendarDays, Edit2, EyeOff } from "lucide-react";
import type { Employee } from "@/lib/types/employee";
import { Avatar } from "@/components/ui/Avatar";
import { roleHue } from "@/lib/utils/roles";

/* ──────────────────────────────────────────────────────────────
   Skeleton
   ────────────────────────────────────────────────────────────── */
export function EmployeeCardSkeleton() {
  return (
    <div
      className="card"
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          className="skeleton"
          style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0 }}
        />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="skeleton" style={{ height: 14, width: 128, borderRadius: 4 }} />
          <div className="skeleton" style={{ height: 10, width: 80, borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div className="skeleton" style={{ height: 42, flex: 1, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 42, flex: 1, borderRadius: 8 }} />
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Card (grid view)
   ────────────────────────────────────────────────────────────── */
export interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  /** Opens the disable/delete flow — primary action is disable (reversible),
   *  delete is a secondary link inside the modal. */
  onRemove: (employee: Employee) => void;
  onAvailability: (employee: Employee) => void;
}

export function EmployeeCard({
  employee,
  onEdit,
  onRemove,
  onAvailability,
}: EmployeeCardProps) {
  const hue = roleHue(employee.role);
  return (
    <div
      className="card"
      style={{
        transition: "transform 0.14s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "none")}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar name={employee.name} size={44} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            className="title-sm"
            style={{
              fontSize: 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {employee.name}
          </div>
          <div className="label-sm" style={{ fontSize: 10 }}>
            {employee.role}
          </div>
        </div>
        <span
          className="chip"
          style={{
            background: `oklch(0.88 0.04 ${hue})`,
            color: `oklch(0.3 0.08 ${hue})`,
          }}
        >
          {employee.role}
        </span>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <div style={{ flex: 1 }}>
          <div className="label-sm" style={{ fontSize: 9 }}>
            Max hours
          </div>
          <div className="title-md mono" style={{ fontSize: 15 }}>
            {employee.max_hours_per_week ?? 40}h
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div className="label-sm" style={{ fontSize: 9 }}>
            Rate
          </div>
          <div className="title-md mono" style={{ fontSize: 15 }}>
            ${employee.salary}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 14,
          paddingTop: 12,
          boxShadow: "inset 0 1px var(--hairline)",
        }}
      >
        <span
          className="chip"
          style={{
            background: employee.is_active
              ? "color-mix(in oklab, var(--accent-fixed) 50%, var(--surface-high))"
              : "var(--surface-high)",
            color: employee.is_active
              ? "var(--on-surface)"
              : "var(--on-surface-muted)",
          }}
        >
          <span
            className="chip-dot"
            style={{
              background: employee.is_active
                ? "var(--accent)"
                : "var(--on-surface-faint)",
            }}
          />
          {employee.is_active ? "Active" : "Inactive"}
        </span>

        <div style={{ display: "flex", gap: 4 }}>
          <button
            type="button"
            onClick={() => onAvailability(employee)}
            className="btn btn-icon btn-ghost"
            aria-label={`Manage availability for ${employee.name}`}
            title="Manage availability"
          >
            <CalendarDays size={14} />
          </button>
          <button
            type="button"
            onClick={() => onEdit(employee)}
            className="btn btn-icon btn-ghost"
            aria-label={`Edit ${employee.name}`}
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={() => onRemove(employee)}
            className="btn btn-icon btn-ghost"
            style={{ color: "var(--warning)" }}
            aria-label={`Disable ${employee.name}`}
            title="Disable"
          >
            <EyeOff size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
