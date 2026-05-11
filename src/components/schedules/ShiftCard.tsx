import { Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatShiftTime } from "@/lib/utils/dates";
import type { Shift } from "@/lib/types/schedule";

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Server: { bg: "oklch(0.91 0.08 155)", text: "oklch(0.24 0.14 155)" },
  Cook: { bg: "oklch(0.92 0.07 20)", text: "oklch(0.30 0.14 20)" },
  Host: { bg: "oklch(0.90 0.07 270)", text: "oklch(0.26 0.10 270)" },
  Manager: { bg: "oklch(0.91 0.07 55)", text: "oklch(0.30 0.13 55)" },
};

const DEFAULT_COLORS = {
  bg: "oklch(0.92 0.04 240)",
  text: "oklch(0.28 0.08 240)",
};

// eslint-disable-next-line react-refresh/only-export-components
export function getRoleColors(role: string) {
  return ROLE_COLORS[role] ?? DEFAULT_COLORS;
}

interface ShiftCardProps {
  shift: Shift;
  role: string;
  onEdit: () => void;
  onDelete: () => void;
  dragOverlay?: boolean;
}

export function ShiftCard({
  shift,
  role,
  onEdit,
  onDelete,
  dragOverlay = false,
}: ShiftCardProps) {
  const { bg, text } = getRoleColors(role);

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: shift.id,
      data: {
        shiftId: shift.id,
        employeeId: shift.employee_id,
        date: shift.shift_date,
      },
      disabled: dragOverlay,
    });

  const startLabel = formatShiftTime(shift.start_time);
  const endLabel = formatShiftTime(shift.end_time);
  const hours =
    shift.duration_hours % 1 === 0
      ? `${shift.duration_hours}h`
      : `${shift.duration_hours.toFixed(1)}h`;

  const baseStyle: React.CSSProperties = {
    background: bg,
    color: text,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.3 : 1,
    ...(dragOverlay && {
      transform: "scale(1.03)",
      boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
    }),
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={baseStyle}
      className="group relative rounded-md px-3 py-2.5 cursor-grab active:cursor-grabbing select-none"
      onClick={onEdit}
      role="button"
      tabIndex={0}
      aria-label={`Edit shift: ${startLabel} – ${endLabel}`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onEdit();
      }}
    >
      <p className="text-[13px] font-bold font-label leading-tight">
        {startLabel} – {endLabel}
      </p>
      <p className="text-[11px] font-label opacity-70 mt-1">{hours}</p>

      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1.5 right-1.5 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity rounded-md p-0.5 cursor-pointer"
        style={{ color: text }}
        aria-label="Delete shift"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
