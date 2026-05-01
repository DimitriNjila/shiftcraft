import { Fragment } from 'react';
import { Plus } from 'lucide-react';
import { toDateStr, isToday } from '@/lib/utils/dates';
import { ShiftCard, getRoleColors } from './ShiftCard';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Schedule, Shift } from '@/lib/types/schedule';
import type { Employee } from '@/lib/types/employee';

// ── Avatar ────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  { bg: 'oklch(0.88 0.10 155)', color: 'oklch(0.26 0.16 155)' },
  { bg: 'oklch(0.88 0.10 280)', color: 'oklch(0.26 0.12 280)' },
  { bg: 'oklch(0.88 0.10 20)',  color: 'oklch(0.30 0.16 20)'  },
  { bg: 'oklch(0.88 0.10 55)',  color: 'oklch(0.30 0.16 55)'  },
  { bg: 'oklch(0.88 0.10 210)', color: 'oklch(0.26 0.12 210)' },
  { bg: 'oklch(0.88 0.10 320)', color: 'oklch(0.28 0.14 320)' },
];

function avatarColors(id: string) {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function initials(name: string) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

// ── Day header ────────────────────────────────────────────────

function DayHeader({ day }: { day: Date }) {
  const today = isToday(day);
  return (
    <div
      className={`flex flex-col items-center justify-center py-3 border-b border-surface-highest ${
        today ? 'bg-primary-fixed/20' : ''
      }`}
    >
      <span className="label-md text-on-surface-muted" style={{ fontSize: 11 }}>
        {day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}
      </span>
      <span className={`mono text-[15px] font-semibold mt-0.5 ${today ? 'text-primary' : 'text-on-surface'}`}>
        {day.getDate()}
      </span>
      {today && (
        <span
          className="label-md mt-0.5 text-primary"
          style={{ fontSize: 9 }}
        >
          TODAY
        </span>
      )}
    </div>
  );
}

// ── Employee info cell ────────────────────────────────────────

function EmployeeCell({
  employee,
  weekShifts,
}: {
  employee: Employee;
  weekShifts: Shift[];
}) {
  const colors = avatarColors(employee.id);
  const totalHours = weekShifts.reduce((sum, s) => sum + (s.duration_hours ?? 0), 0);
  const hoursLabel = totalHours % 1 === 0 ? `${totalHours}h` : `${totalHours.toFixed(1)}h`;

  return (
    <div className="flex items-center gap-2.5 px-3 py-3 border-b border-surface-highest bg-surface">
      <div
        className="w-8 h-8 rounded-full shrink-0 grid place-items-center text-[11px] font-bold font-display"
        style={{ background: colors.bg, color: colors.color }}
      >
        {initials(employee.name)}
      </div>
      <div className="min-w-0">
        <p className="body-sm font-semibold truncate leading-tight">{employee.name}</p>
        <p className="label-md text-on-surface-muted truncate" style={{ fontSize: 10 }}>
          {employee.role.toUpperCase()}
        </p>
      </div>
      {totalHours > 0 && (
        <span className="ml-auto label-md text-on-surface-faint shrink-0 mono" style={{ fontSize: 10 }}>
          {hoursLabel}
        </span>
      )}
    </div>
  );
}

// ── Shift cell ────────────────────────────────────────────────

function ShiftCell({
  employee,
  dateStr,
  shifts,
  today,
  onAdd,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  dateStr: string;
  shifts: Shift[];
  today: boolean;
  onAdd: () => void;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
}) {
  return (
    <div
      className={`group relative min-h-[64px] p-1.5 border-b border-l border-surface-highest flex flex-col gap-1 ${
        today ? 'bg-primary-fixed/[0.06]' : ''
      }`}
    >
      {shifts.map((shift) => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          role={employee.role}
          onEdit={() => onEdit(shift)}
          onDelete={() => onDelete(shift.id)}
        />
      ))}

      {shifts.length === 0 && (
        <button
          type="button"
          onClick={onAdd}
          className="absolute inset-0 w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label={`Add shift for ${employee.name}`}
        >
          <div
            className="w-6 h-6 rounded-full grid place-items-center"
            style={{
              background: getRoleColors(employee.role).bg,
              color: getRoleColors(employee.role).text,
            }}
          >
            <Plus size={13} />
          </div>
        </button>
      )}
    </div>
  );
}

// ── Weekly grid ───────────────────────────────────────────────

interface WeeklyGridProps {
  schedule: Schedule;
  employees: Employee[];
  weekDays: Date[];
  onAddShift: (employeeId: string, dateStr: string) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
}

export function WeeklyGrid({
  schedule,
  employees,
  weekDays,
  onAddShift,
  onEditShift,
  onDeleteShift,
}: WeeklyGridProps) {
  const shifts = schedule.shifts ?? [];

  if (employees.length === 0) {
    return (
      <EmptyState
        title="No employees yet"
        description="Add employees from the Team page before scheduling shifts."
      />
    );
  }

  const activeEmployees = employees.filter((e) => e.is_active);

  return (
    <div className="overflow-x-auto rounded-xl border border-surface-highest">
      <div
        className="grid"
        style={{ gridTemplateColumns: '180px repeat(7, minmax(110px, 1fr))' }}
      >
        {/* Corner cell */}
        <div className="border-b border-surface-highest bg-surface" />

        {/* Day headers */}
        {weekDays.map((day) => (
          <DayHeader key={toDateStr(day)} day={day} />
        ))}

        {/* Employee rows */}
        {activeEmployees.map((emp) => {
          const empShifts = shifts.filter((s) => s.employee_id === emp.id);

          return (
            <Fragment key={emp.id}>
              <EmployeeCell employee={emp} weekShifts={empShifts} />

              {weekDays.map((day) => {
                const dateStr = toDateStr(day);
                const dayShifts = empShifts.filter((s) => s.shift_date === dateStr);

                return (
                  <ShiftCell
                    key={dateStr}
                    employee={emp}
                    dateStr={dateStr}
                    shifts={dayShifts}
                    today={isToday(day)}
                    onAdd={() => onAddShift(emp.id, dateStr)}
                    onEdit={onEditShift}
                    onDelete={onDeleteShift}
                  />
                );
              })}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
