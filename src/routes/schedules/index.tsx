import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRestaurant } from '@/lib/hooks/use-restaurant';
import { useWeekSchedule } from '@/lib/hooks/use-schedules';
import { useEmployees } from '@/lib/hooks/use-employees';
import { useDeleteShift } from '@/lib/hooks/use-shifts';
import { WeekNav } from '@/components/schedules/WeekNav';
import { WeeklyGrid } from '@/components/schedules/WeeklyGrid';
import { ShiftModal } from '@/components/schedules/ShiftModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import {
  getMondayOfWeek,
  getWeekDays,
  toDateStr,
  fromDateStr,
} from '@/lib/utils/dates';
import type { Shift } from '@/lib/types/schedule';

interface ShiftModalState {
  defaultEmployeeId?: string;
  defaultDate?: string;
  shift?: Shift;
}

function getCurrentMondayStr(): string {
  return toDateStr(getMondayOfWeek(new Date()));
}

export default function SchedulesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: restaurant } = useRestaurant();

  const weekParam = searchParams.get('week');
  const monday = weekParam ? getMondayOfWeek(fromDateStr(weekParam)) : getMondayOfWeek(new Date());
  const weekStart = toDateStr(monday);
  const weekDays = getWeekDays(monday);

  const { schedule, isLoading, error, refetch } = useWeekSchedule(restaurant?.id, weekStart);
  const { data: employees = [] } = useEmployees(restaurant?.id);
  const deleteShift = useDeleteShift(schedule?.id ?? '');

  const [shiftModal, setShiftModal] = useState<ShiftModalState | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null);

  const isCurrentWeek = weekStart === getCurrentMondayStr();

  function goToWeek(date: Date) {
    setSearchParams({ week: toDateStr(date) });
  }

  function prevWeek() {
    const d = new Date(monday);
    d.setDate(d.getDate() - 7);
    goToWeek(d);
  }

  function nextWeek() {
    const d = new Date(monday);
    d.setDate(d.getDate() + 7);
    goToWeek(d);
  }

  function goToday() {
    setSearchParams({});
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Planning</span>
          <h1 className="headline-lg mt-1.5">Weekly schedule</h1>
        </div>
      </div>

      <WeekNav
        monday={monday}
        schedule={schedule}
        onPrev={prevWeek}
        onNext={nextWeek}
        onToday={goToday}
        isCurrentWeek={isCurrentWeek}
      />

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={28} />
        </div>
      )}

      {error && (
        <ErrorMessage message="Failed to load schedule" onRetry={() => refetch()} />
      )}

      {!isLoading && !error && schedule && (
        <WeeklyGrid
          schedule={schedule}
          employees={employees}
          weekDays={weekDays}
          onAddShift={(employeeId, dateStr) =>
            setShiftModal({ defaultEmployeeId: employeeId, defaultDate: dateStr })
          }
          onEditShift={(shift) => setShiftModal({ shift })}
          onDeleteShift={(id) => setDeleteShiftId(id)}
        />
      )}

      {shiftModal && schedule && (
        <ShiftModal
          scheduleId={schedule.id}
          employees={employees}
          defaultEmployeeId={shiftModal.defaultEmployeeId}
          defaultDate={shiftModal.defaultDate}
          shift={shiftModal.shift}
          onClose={() => setShiftModal(null)}
        />
      )}

      {deleteShiftId && (
        <ConfirmModal
          title="Remove shift"
          description="This shift will be permanently removed from the schedule."
          confirmLabel="Remove shift"
          isPending={deleteShift.isPending}
          onConfirm={() =>
            deleteShift.mutate(deleteShiftId, { onSettled: () => setDeleteShiftId(null) })
          }
          onCancel={() => setDeleteShiftId(null)}
        />
      )}
    </>
  );
}
