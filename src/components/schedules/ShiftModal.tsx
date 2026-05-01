import { type FormEvent, useState } from 'react';
import { X } from 'lucide-react';
import { toHHMM, toHHMMSS, fromDateStr, shiftHours } from '@/lib/utils/dates';
import { useCreateShift } from '@/lib/hooks/use-shifts';
import { useUpdateShift } from '@/lib/hooks/use-shifts';
import type { Shift } from '@/lib/types/schedule';
import type { Employee } from '@/lib/types/employee';

interface ShiftModalProps {
  scheduleId: string;
  employees: Employee[];
  defaultEmployeeId?: string;
  defaultDate?: string;
  shift?: Shift;
  onClose: () => void;
}

export function ShiftModal({
  scheduleId,
  employees,
  defaultEmployeeId,
  defaultDate,
  shift,
  onClose,
}: ShiftModalProps) {
  const isEdit = !!shift;

  const [employeeId, setEmployeeId] = useState(shift?.employee_id ?? defaultEmployeeId ?? '');
  const [date, setDate] = useState(shift?.shift_date ?? defaultDate ?? '');
  const [startTime, setStartTime] = useState(shift ? toHHMM(shift.start_time) : '09:00');
  const [endTime, setEndTime] = useState(shift ? toHHMM(shift.end_time) : '17:00');
  const [notes, setNotes] = useState(shift?.notes ?? '');

  const createShift = useCreateShift(scheduleId);
  const updateShift = useUpdateShift(scheduleId);
  const isPending = createShift.isPending || updateShift.isPending;

  const previewHours = startTime && endTime ? shiftHours(startTime, endTime) : 0;

  const dateLabel = date
    ? fromDateStr(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    : '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!employeeId || !date || !startTime || !endTime) return;

    if (isEdit) {
      updateShift.mutate(
        {
          id: shift.id,
          updates: {
            employee_id: employeeId,
            shift_date: date,
            start_time: toHHMMSS(startTime),
            end_time: toHHMMSS(endTime),
            notes: notes || undefined,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      createShift.mutate(
        {
          schedule_id: scheduleId,
          employee_id: employeeId,
          shift_date: date,
          start_time: toHHMMSS(startTime),
          end_time: toHHMMSS(endTime),
          notes: notes || undefined,
        },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shift-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="shift-modal-title" className="title-lg">
            {isEdit ? 'Edit shift' : 'Add shift'}
          </h2>
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div>
            <label htmlFor="shift-employee" className="field-label">
              Employee
            </label>
            <select
              id="shift-employee"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="input-field"
              required
            >
              <option value="" disabled>
                Select employee
              </option>
              {employees
                .filter((emp) => emp.is_active)
                .map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} — {emp.role}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="shift-date" className="field-label">
              Date
              {dateLabel && (
                <span className="ml-1.5 text-on-surface-muted font-normal">({dateLabel})</span>
              )}
            </label>
            <input
              id="shift-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="shift-start" className="field-label">
                Start
              </label>
              <input
                id="shift-start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
            <div>
              <label htmlFor="shift-end" className="field-label">
                End
              </label>
              <input
                id="shift-end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
                required
              />
            </div>
          </div>

          {previewHours > 0 && (
            <p className="body-sm text-on-surface-muted -mt-1">
              {previewHours % 1 === 0 ? previewHours : previewHours.toFixed(1)}h shift
            </p>
          )}

          <div>
            <label htmlFor="shift-notes" className="field-label">
              Notes <span className="font-normal text-on-surface-faint">(optional)</span>
            </label>
            <input
              id="shift-notes"
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input-field"
              placeholder="e.g. Opening duties"
            />
          </div>

          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1 justify-center py-2.5 text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1 justify-center py-2.5 text-sm"
              disabled={isPending}
            >
              {isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add shift'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
