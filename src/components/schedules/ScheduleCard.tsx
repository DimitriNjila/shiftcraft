import { Trash2, ChevronRight, Clock, Users } from 'lucide-react';
import type { Schedule } from '@/lib/types/schedule';

function formatWeekRange(weekStart: string): { range: string; year: string } {
  const [y, m, d] = weekStart.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);

  const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return {
    range: `${start.toLocaleDateString('en-US', opts)} – ${end.toLocaleDateString('en-US', opts)}`,
    year: y.toString(),
  };
}

interface ScheduleCardProps {
  schedule: Schedule;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ScheduleCard({ schedule, onView, onDelete }: ScheduleCardProps) {
  const { range, year } = formatWeekRange(schedule.week_start);

  return (
    <div
      className="card group cursor-pointer"
      onClick={() => onView(schedule.id)}
      role="button"
      tabIndex={0}
      aria-label={`View schedule for week of ${range}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onView(schedule.id);
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="label-md text-on-surface-muted">{year}</p>
          <h3 className="headline-sm mt-0.5">{range}</h3>

          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <Users size={13} className="text-on-surface-faint" />
              <span className="body-sm text-on-surface-muted">
                {schedule.total_shifts} {schedule.total_shifts === 1 ? 'shift' : 'shifts'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={13} className="text-on-surface-faint" />
              <span className="body-sm text-on-surface-muted">
                {schedule.total_hours}h total
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(schedule.id);
            }}
            className="btn-icon btn-ghost opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete schedule"
          >
            <Trash2 size={15} />
          </button>
          <ChevronRight size={18} className="text-on-surface-faint" />
        </div>
      </div>
    </div>
  );
}
