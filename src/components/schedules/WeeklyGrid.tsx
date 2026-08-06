import { memo, useMemo, useState, useCallback } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toDateStr, isToday } from "@/lib/utils/dates";
import { ShiftCard, getRoleColors } from "./ShiftCard";
import { Avatar } from "@/components/ui/Avatar";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Schedule, Shift } from "@/lib/types/schedule";
import type { Employee } from "@/lib/types/employee";

// ── Day header ────────────────────────────────────────────────

const DAY_LABEL: Record<number, string> = {
  0: "Sun",
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
};

function DayHeader({ day }: { day: Date }) {
  const today = isToday(day);
  const shortDay = DAY_LABEL[day.getDay()];
  const dateNum = day.getDate();
  return (
    <div style={{ padding: "0 6px" }}>
      <div className="label-md" style={{ fontSize: 10 }}>
        {shortDay}
      </div>
      <div
        className="title-sm"
        style={{
          fontSize: 13,
          marginTop: 2,
          color: today ? "var(--accent)" : "var(--on-surface)",
        }}
      >
        {shortDay} {dateNum}
        {today && (
          <span
            style={{
              marginLeft: 6,
              fontSize: 9,
              padding: "1px 6px",
              background: "var(--accent-fixed)",
              color: "var(--on-surface)",
              borderRadius: 4,
              fontFamily: "var(--font-label)",
              fontWeight: 600,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Today
          </span>
        )}
      </div>
    </div>
  );
}

// ── Employee row header ───────────────────────────────────────

function EmployeeCell({
  employee,
  weekShifts,
}: {
  employee: Employee;
  weekShifts: Shift[];
}) {
  const totalHours = weekShifts.reduce(
    (sum, s) => sum + (s.duration_hours ?? 0),
    0,
  );
  const overtime = totalHours > 38;
  const cost = totalHours * employee.salary;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px 8px 0",
      }}
    >
      <Avatar name={employee.name} size={36} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          className="title-sm"
          style={{
            fontSize: 13,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {employee.name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 1,
          }}
        >
          <span className="label-sm" style={{ fontSize: 10 }}>
            {employee.role}
          </span>
        </div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div
          className="mono"
          style={{
            fontSize: 12,
            color: overtime ? "var(--warning)" : "var(--on-surface)",
            fontWeight: 600,
          }}
        >
          {totalHours % 1 === 0 ? `${totalHours}h` : `${totalHours.toFixed(1)}h`}
        </div>
        <div className="label-sm" style={{ fontSize: 9 }}>
          ${Math.round(cost)}
        </div>
      </div>
    </div>
  );
}

// ── Droppable shift cell ──────────────────────────────────────

interface ShiftCellProps {
  employee: Employee;
  dateStr: string;
  shifts: Shift[];
  today: boolean;
  isDragging: boolean;
  onAddShift: (employeeId: string, dateStr: string) => void;
  onEdit: (shift: Shift) => void;
  onDelete: (shiftId: string) => void;
}

const ShiftCell = memo(function ShiftCell({
  employee,
  dateStr,
  shifts,
  isDragging,
  onAddShift,
  onEdit,
  onDelete,
}: ShiftCellProps) {
  const droppableData = useMemo(
    () => ({ employeeId: employee.id, dateStr }),
    [employee.id, dateStr],
  );
  const { setNodeRef, isOver } = useDroppable({
    id: `${employee.id}:${dateStr}`,
    data: droppableData,
  });

  return (
    <div
      ref={setNodeRef}
      style={{
        margin: "4px 3px",
        padding: 3,
        borderRadius: 10,
        background: isOver
          ? "color-mix(in oklab, var(--accent-fixed) 40%, var(--surface-lowest))"
          : "var(--surface-lowest)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        minHeight: 68,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        transition: "background 0.12s, box-shadow 0.12s",
        position: "relative",
      }}
      className="group"
    >
      {shifts.map((shift) => (
        <ShiftCard
          key={shift.id}
          shift={shift}
          role={employee.role}
          employeeName={employee.name}
          onEdit={() => onEdit(shift)}
          onDelete={() => onDelete(shift.id)}
        />
      ))}
      {shifts.length === 0 && !isDragging && (
        <button
          type="button"
          onClick={() => onAddShift(employee.id, dateStr)}
          aria-label={`Add shift for ${employee.name}`}
          style={{
            position: "absolute",
            inset: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            opacity: 0,
            transition: "opacity 0.12s",
            borderRadius: 8,
          }}
          className="group-hover:opacity-100"
        >
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
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
});

// ── Weekly grid ───────────────────────────────────────────────

interface WeeklyGridProps {
  schedule: Schedule;
  employees: Employee[];
  weekDays: Date[];
  onAddShift: (employeeId: string, dateStr: string) => void;
  onEditShift: (shift: Shift) => void;
  onDeleteShift: (shiftId: string) => void;
  onMoveShift: (shiftId: string, employeeId: string, date: string) => void;
}

export function WeeklyGrid({
  schedule,
  employees,
  weekDays,
  onAddShift,
  onEditShift,
  onDeleteShift,
  onMoveShift,
}: WeeklyGridProps) {
  const shifts = schedule.shifts ?? [];
  const activeEmployees = employees.filter((e) => e.is_active);

  const [activeShift, setActiveShift] = useState<Shift | null>(null);

  const stableOnAddShift = useCallback(onAddShift, [onAddShift]);
  const stableOnEditShift = useCallback(onEditShift, [onEditShift]);
  const stableOnDeleteShift = useCallback(onDeleteShift, [onDeleteShift]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    const shift = shifts.find((s) => s.id === active.id);
    setActiveShift(shift ?? null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveShift(null);
    if (!over) return;
    const { employeeId, dateStr } = over.data.current as {
      employeeId: string;
      dateStr: string;
    };
    const drag = active.data.current as { employeeId: string; date: string };
    if (drag.employeeId === employeeId && drag.date === dateStr) return;
    onMoveShift(active.id as string, employeeId, dateStr);
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        title="No staff yet"
        description="Add staff from the Staff page before scheduling shifts."
      />
    );
  }

  const overlayEmployee = activeShift
    ? activeEmployees.find((e) => e.id === activeShift.employee_id)
    : null;

  const dailyTotals = weekDays.map((day) => {
    const dateStr = toDateStr(day);
    const dayShifts = shifts.filter((s) => s.shift_date === dateStr);
    const hours = dayShifts.reduce(
      (sum, s) => sum + (s.duration_hours ?? 0),
      0,
    );
    return { count: dayShifts.length, hours };
  });

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveShift(null)}
    >
      <div
        style={{
          background: "var(--surface-container)",
          borderRadius: "var(--r-2xl)",
          boxShadow: "inset 0 0 0 1px var(--hairline)",
          padding: 4,
          overflow: "auto",
          minHeight: 0,
        }}
      >
        <div style={{ minWidth: 900 }}>
          {/* Day header row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "220px repeat(7, 1fr)",
              position: "sticky",
              top: 0,
              zIndex: 2,
              background: "var(--surface-container)",
              padding: "12px 16px 10px 16px",
            }}
          >
            <div />
            {weekDays.map((day) => (
              <DayHeader key={toDateStr(day)} day={day} />
            ))}
          </div>

          {/* Employee rows */}
          <div style={{ padding: "4px 16px 16px" }}>
            {activeEmployees.map((emp) => {
              const empShifts = shifts.filter(
                (s) => s.employee_id === emp.id,
              );
              return (
                <div
                  key={emp.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "220px repeat(7, 1fr)",
                    alignItems: "stretch",
                    minHeight: 76,
                    marginBottom: 4,
                  }}
                >
                  <EmployeeCell employee={emp} weekShifts={empShifts} />
                  {weekDays.map((day) => {
                    const dateStr = toDateStr(day);
                    const dayShifts = empShifts.filter(
                      (s) => s.shift_date === dateStr,
                    );
                    return (
                      <ShiftCell
                        key={dateStr}
                        employee={emp}
                        dateStr={dateStr}
                        shifts={dayShifts}
                        today={isToday(day)}
                        isDragging={!!activeShift}
                        onAddShift={stableOnAddShift}
                        onEdit={stableOnEditShift}
                        onDelete={stableOnDeleteShift}
                      />
                    );
                  })}
                </div>
              );
            })}

            {/* Daily totals */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "220px repeat(7, 1fr)",
                marginTop: 12,
                padding: "12px 0",
              }}
            >
              <div style={{ padding: "0 10px" }}>
                <div className="label-md">Daily totals</div>
              </div>
              {dailyTotals.map((t, i) => (
                <div key={i} style={{ padding: "0 9px" }}>
                  <div className="title-md mono" style={{ fontSize: 14 }}>
                    {t.hours % 1 === 0
                      ? `${t.hours}h`
                      : `${t.hours.toFixed(1)}h`}
                  </div>
                  <div className="label-sm" style={{ fontSize: 10 }}>
                    {t.count} shift{t.count !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeShift && (
          <ShiftCard
            shift={activeShift}
            role={overlayEmployee?.role ?? "Server"}
            employeeName={overlayEmployee?.name}
            onEdit={() => {}}
            onDelete={() => {}}
            dragOverlay
          />
        )}
      </DragOverlay>
    </DndContext>
  );
}
