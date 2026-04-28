import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CalendarDays, ArrowUpDown } from 'lucide-react';
import { useRestaurant } from '@/lib/hooks/use-restaurant';
import { useSchedules, useCreateSchedule, useDeleteSchedule } from '@/lib/hooks/use-schedules';
import { ScheduleCard } from '@/components/schedules/ScheduleCard';
import { ScheduleModal } from '@/components/schedules/ScheduleModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { CreateScheduleRequest } from '@/lib/types/schedule';

type SortOrder = 'newest' | 'oldest';

export default function SchedulesPage() {
  const navigate = useNavigate();
  const { data: restaurant } = useRestaurant();
  const { data: schedules, isLoading, error, refetch } = useSchedules(restaurant?.id);
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');

  const sorted = schedules
    ? [...schedules].sort((a, b) => {
        const cmp = a.week_start.localeCompare(b.week_start);
        return sortOrder === 'newest' ? -cmp : cmp;
      })
    : [];

  const handleCreate = (payload: CreateScheduleRequest) => {
    createSchedule.mutate(payload, {
      onSuccess: () => setCreateOpen(false),
    });
  };

  const handleDeleteConfirm = () => {
    if (!deleteId) return;
    deleteSchedule.mutate(deleteId, {
      onSettled: () => setDeleteId(null),
    });
  };

  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Planning</span>
          <h1 className="headline-lg mt-1.5">Schedules</h1>
        </div>

        <div className="flex items-center gap-2">
          {schedules && schedules.length > 1 && (
            <button
              type="button"
              className="btn btn-ghost text-sm"
              onClick={() => setSortOrder((s) => (s === 'newest' ? 'oldest' : 'newest'))}
            >
              <ArrowUpDown size={14} />
              {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary text-sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={15} />
            New schedule
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size={28} />
        </div>
      )}

      {error && (
        <ErrorMessage message="Failed to load schedules" onRetry={() => refetch()} />
      )}

      {!isLoading && !error && sorted.length === 0 && (
        <EmptyState
          title="No schedules yet"
          description="Create your first schedule to start planning shifts for your team."
          icon={<CalendarDays size={22} />}
          action={
            <button
              type="button"
              className="btn btn-primary text-sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={15} />
              New schedule
            </button>
          }
        />
      )}

      {!isLoading && !error && sorted.length > 0 && (
        <div className="flex flex-col gap-3">
          {sorted.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              onView={(id) => navigate(`/schedules/${id}`)}
              onDelete={(id) => setDeleteId(id)}
            />
          ))}
        </div>
      )}

      {createOpen && restaurant && (
        <ScheduleModal
          restaurantId={restaurant.id}
          isPending={createSchedule.isPending}
          onSubmit={handleCreate}
          onClose={() => setCreateOpen(false)}
        />
      )}

      {deleteId && (
        <ConfirmModal
          title="Delete schedule"
          description="This will permanently delete the schedule and all its shifts. This action cannot be undone."
          confirmLabel="Delete schedule"
          isPending={deleteSchedule.isPending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </>
  );
}
