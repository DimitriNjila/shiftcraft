import { Edit2, Trash2 } from "lucide-react";
import type { Employee } from "@/lib/types/employee";

/* ──────────────────────────────────────────────────────────────
   Role colours
   ────────────────────────────────────────────────────────────── */
const ROLE_STYLE: Record<
  string,
  { avatarBg: string; avatarText: string; chipBg: string; chipText: string }
> = {
  Manager: {
    avatarBg: "bg-primary-fixed",
    avatarText: "text-primary",
    chipBg: "bg-primary-fixed",
    chipText: "text-primary",
  },
  Server: {
    avatarBg: "bg-secondary-container",
    avatarText: "text-on-secondary-container",
    chipBg: "bg-secondary-container",
    chipText: "text-on-secondary-container",
  },
  Cook: {
    avatarBg: "bg-warning-container",
    avatarText: "text-warning",
    chipBg: "bg-warning-container",
    chipText: "text-warning",
  },
  Host: {
    avatarBg: "bg-tertiary-fixed",
    avatarText: "text-[#8b1d18]",
    chipBg: "bg-tertiary-fixed",
    chipText: "text-[#8b1d18]",
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2)
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

/* ──────────────────────────────────────────────────────────────
   Skeleton
   ────────────────────────────────────────────────────────────── */
export function EmployeeCardSkeleton() {
  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="skeleton w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="skeleton h-3.5 w-32 rounded" />
          <div className="skeleton h-2.5 w-20 rounded" />
        </div>
      </div>
      <div className="flex items-center justify-between pt-1">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="flex gap-1.5">
          <div className="skeleton w-8 h-8 rounded-[10px]" />
          <div className="skeleton w-8 h-8 rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Card
   ────────────────────────────────────────────────────────────── */
export interface EmployeeCardProps {
  employee: Employee;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
}

export function EmployeeCard({
  employee,
  onEdit,
  onDelete,
}: EmployeeCardProps) {
  const style = ROLE_STYLE[employee.role] ?? ROLE_STYLE.Server;
  const initials = getInitials(employee.name);

  return (
    <div className="card flex flex-col gap-4">
      {/* Top row: avatar + name */}
      <div className="flex items-center gap-3">
        <div
          className={`avatar w-10 h-10 rounded-full text-[13px] font-semibold shrink-0 ${style.avatarBg} ${style.avatarText}`}
        >
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <p className="title-sm truncate">{employee.name}</p>
          <p className="body-sm text-on-surface-muted">{employee.role}</p>
          <p className="body-sm text-on-surface-muted">
            Rate: ${employee.salary}
          </p>
        </div>
      </div>

      {/* Bottom row: status + actions */}
      <div className="flex items-center justify-between">
        <span
          className={`badge ${employee.is_active ? "badge-success" : "badge-inactive"}`}
        >
          {employee.is_active ? "Active" : "Inactive"}
        </span>

        <div className="flex gap-1.5">
          <button
            onClick={() => onEdit(employee)}
            className="btn-icon btn-ghost"
            aria-label={`Edit ${employee.name}`}
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={() => onDelete(employee)}
            className="btn-icon btn-danger"
            aria-label={`Delete ${employee.name}`}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
