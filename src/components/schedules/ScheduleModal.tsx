import { type FormEvent, useState } from 'react';
import { X, CalendarDays } from 'lucide-react';
import type { CreateScheduleRequest } from '@/lib/types/schedule';

function toMonday(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date.toISOString().split('T')[0];
}

function formatDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

interface ScheduleModalProps {
  restaurantId: string;
  isPending: boolean;
  onSubmit: (payload: CreateScheduleRequest) => void;
  onClose: () => void;
}

export function ScheduleModal({ restaurantId, isPending, onSubmit, onClose }: ScheduleModalProps) {
  const [weekDate, setWeekDate] = useState('');

  const monday = weekDate ? toMonday(weekDate) : null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!monday) return;
    onSubmit({ week_start: monday, restaurant_id: restaurantId });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel max-w-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 id="schedule-modal-title" className="title-lg">New Schedule</h2>
          <button className="btn-icon btn-ghost" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="weekDate" className="field-label">
              Pick any day in the target week
            </label>
            <div className="relative">
              <CalendarDays
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint pointer-events-none"
              />
              <input
                id="weekDate"
                type="date"
                value={weekDate}
                onChange={(e) => setWeekDate(e.target.value)}
                className="input-field pl-9"
                required
                autoFocus
              />
            </div>
            {monday && (
              <p className="body-sm text-on-surface-muted mt-1.5">
                Week of Mon {formatDate(monday)}
              </p>
            )}
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
              disabled={isPending || !weekDate}
            >
              {isPending ? 'Creating…' : 'Create schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
