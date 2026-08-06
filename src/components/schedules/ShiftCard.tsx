import { Trash2 } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { formatShiftTime } from "@/lib/utils/dates";
import type { Shift } from "@/lib/types/schedule";

/** Role → hue for oklch color derivation. Aligned with the design's role palette. */
const ROLE_HUE: Record<string, number> = {
  Server: 155,
  Cook: 30,
  Host: 210,
  Manager: 280,
  Baker: 280,
  Barista: 30,
  Cashier: 210,
  Lead: 155,
};

const DEFAULT_HUE = 240;

// eslint-disable-next-line react-refresh/only-export-components
export function getRoleColors(role: string) {
  const hue = ROLE_HUE[role] ?? DEFAULT_HUE;
  return {
    bg: `oklch(0.88 0.07 ${hue})`,
    text: `oklch(0.28 0.08 ${hue})`,
    stripe: `oklch(0.55 0.14 ${hue})`,
  };
}

interface ShiftCardProps {
  shift: Shift;
  role: string;
  employeeName?: string;
  onEdit: () => void;
  onDelete: () => void;
  dragOverlay?: boolean;
}

export function ShiftCard({
  shift,
  role,
  employeeName,
  onEdit,
  onDelete,
  dragOverlay = false,
}: ShiftCardProps) {
  const { bg, text, stripe } = getRoleColors(role);

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

  const style: React.CSSProperties = {
    background: bg,
    color: text,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.35 : 1,
    borderRadius: 7,
    padding: "6px 8px 6px 10px",
    fontSize: 11,
    cursor: "grab",
    position: "relative",
    overflow: "hidden",
    boxShadow: "inset 0 0 0 1px color-mix(in oklab, currentColor 8%, transparent)",
    flex: 1,
    minHeight: 54,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    userSelect: "none",
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
      style={style}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      aria-label={
        employeeName
          ? `Edit shift for ${employeeName}: ${startLabel} – ${endLabel}`
          : `Edit shift: ${startLabel} – ${endLabel}`
      }
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onEdit();
      }}
      className="group"
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 6,
          bottom: 6,
          width: 3,
          borderRadius: 2,
          background: stripe,
        }}
      />
      <div className="mono" style={{ fontWeight: 600, fontSize: 11.5 }}>
        {startLabel} – {endLabel}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          marginTop: 2,
        }}
      >
        <span
          style={{
            fontSize: 10,
            fontFamily: "var(--font-label)",
            fontWeight: 500,
            opacity: 0.85,
          }}
        >
          {hours}
        </span>
      </div>
      <button
        type="button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        aria-label="Delete shift"
        style={{
          position: "absolute",
          top: 4,
          right: 4,
          background: "none",
          border: "none",
          padding: 2,
          color: text,
          cursor: "pointer",
          opacity: 0,
          transition: "opacity 0.12s",
        }}
        className="group-hover:opacity-100 lg:opacity-0"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
