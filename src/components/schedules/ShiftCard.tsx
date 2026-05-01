import { Trash2 } from 'lucide-react';
import { formatShiftTime } from '@/lib/utils/dates';
import type { Shift } from '@/lib/types/schedule';

const ROLE_COLORS: Record<string, { bg: string; text: string }> = {
  Server:  { bg: 'oklch(0.91 0.08 155)', text: 'oklch(0.24 0.14 155)' },
  Cook:    { bg: 'oklch(0.92 0.07 20)',  text: 'oklch(0.30 0.14 20)'  },
  Host:    { bg: 'oklch(0.90 0.07 270)', text: 'oklch(0.26 0.10 270)' },
  Manager: { bg: 'oklch(0.91 0.07 55)',  text: 'oklch(0.30 0.13 55)'  },
};

const DEFAULT_COLORS = { bg: 'oklch(0.92 0.04 240)', text: 'oklch(0.28 0.08 240)' };

export function getRoleColors(role: string) {
  return ROLE_COLORS[role] ?? DEFAULT_COLORS;
}

interface ShiftCardProps {
  shift: Shift;
  role: string;
  onEdit: () => void;
  onDelete: () => void;
}

export function ShiftCard({ shift, role, onEdit, onDelete }: ShiftCardProps) {
  const { bg, text } = getRoleColors(role);
  const startLabel = formatShiftTime(shift.start_time);
  const endLabel = formatShiftTime(shift.end_time);
  const hours = shift.duration_hours % 1 === 0
    ? `${shift.duration_hours}h`
    : `${shift.duration_hours.toFixed(1)}h`;

  return (
    <div
      className="group relative rounded-[8px] px-2.5 py-2 cursor-pointer select-none"
      style={{ background: bg, color: text }}
      onClick={onEdit}
      role="button"
      tabIndex={0}
      aria-label={`Edit shift: ${startLabel} – ${endLabel}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onEdit();
      }}
    >
      <p className="text-[12px] font-semibold font-label leading-tight">
        {startLabel} – {endLabel}
      </p>
      <p className="text-[11px] font-label opacity-75 mt-0.5">{hours}</p>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-0.5"
        style={{ color: text }}
        aria-label="Delete shift"
      >
        <Trash2 size={11} />
      </button>
    </div>
  );
}
