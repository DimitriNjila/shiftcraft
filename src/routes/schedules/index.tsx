import { useState } from "react";
import { Zap } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useWeekSchedule,
  useGenerateSchedule,
} from "@/lib/hooks/use-schedules";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useUpdateShift, useDeleteShift } from "@/lib/hooks/use-shifts";
import { useAnalyzeSchedule } from "@/lib/hooks/use-analysis";
import { WeekNav } from "@/components/schedules/WeekNav";
import { WeeklyGrid } from "@/components/schedules/WeeklyGrid";
import { ShiftModal } from "@/components/schedules/ShiftModal";
import { AnalysisModal } from "@/components/schedules/AnalysisModal";
import { CoverageGaps } from "@/components/schedules/CoverageGaps";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  getMondayOfWeek,
  getWeekDays,
  toDateStr,
  fromDateStr,
} from "@/lib/utils/dates";
import { computeCoverageGaps, computeRequiredHours } from "@/lib/utils/coverage";
import { useShiftTemplates } from "@/lib/hooks/use-templates";
import type { Shift } from "@/lib/types/schedule";

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

  const weekParam = searchParams.get("week");
  const monday = weekParam
    ? getMondayOfWeek(fromDateStr(weekParam))
    : getMondayOfWeek(new Date());
  const weekStart = toDateStr(monday);
  const weekDays = getWeekDays(monday);

  const { schedule, isLoading, error, refetch } = useWeekSchedule(
    restaurant?.id,
    weekStart,
  );
  const { data: employees = [] } = useEmployees(restaurant?.id);
  const { data: templateRecord } = useShiftTemplates(restaurant?.id);
  const updateShift = useUpdateShift(schedule?.id ?? "");
  const deleteShift = useDeleteShift(schedule?.id ?? "");
  const generateSchedule = useGenerateSchedule();
  const analyzeSchedule = useAnalyzeSchedule();

  const templates = templateRecord?.templates ?? [];

  const salaryById = new Map(employees.map((e) => [e.id, e.salary]));
  const laborCost = (schedule?.shifts ?? []).reduce(
    (sum, s) => sum + (salaryById.get(s.employee_id) ?? 0) * s.duration_hours,
    0,
  );

  const coverageGaps =
    schedule && templates.length > 0
      ? computeCoverageGaps(templates, schedule, weekDays, employees)
      : [];
  const requiredHours = computeRequiredHours(templates);
  const scheduledHours = schedule?.total_hours ?? 0;

  const [shiftModal, setShiftModal] = useState<ShiftModalState | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);

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

  function handleGenerate() {
    if (!restaurant?.id) return;
    generateSchedule.mutate({
      restaurant_id: restaurant.id,
      week_start: weekStart,
    });
  }

  function handleAnalyze() {
    if (!schedule?.id) return;
    setAnalysisOpen(true);
    if (!analyzeSchedule.data) {
      analyzeSchedule.mutate(schedule.id);
    }
  }

  function handleAnalyzeRetry() {
    if (!schedule?.id) return;
    analyzeSchedule.reset();
    analyzeSchedule.mutate(schedule.id);
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Planning</span>
          <h1 className="headline-lg mt-1.5">Weekly schedule</h1>
        </div>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generateSchedule.isPending || !restaurant?.id}
          className="btn btn-primary py-2.5 text-sm gap-2"
        >
          <Zap size={15} />
          {generateSchedule.isPending ? "Generating…" : "Generate"}
        </button>
      </div>

      <WeekNav
        monday={monday}
        schedule={schedule}
        laborCost={laborCost}
        onPrev={prevWeek}
        onNext={nextWeek}
        onToday={goToday}
        onAnalyze={handleAnalyze}
        isCurrentWeek={isCurrentWeek}
        isAnalyzing={analyzeSchedule.isPending}
      />

      {!isLoading && !error && schedule && templates.length > 0 && (
        <CoverageGaps
          gaps={coverageGaps}
          requiredHours={requiredHours}
          scheduledHours={scheduledHours}
        />
      )}

      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={28} />
        </div>
      )}

      {error && (
        <ErrorMessage
          message="Failed to load schedule"
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !error && schedule && (
        <WeeklyGrid
          schedule={schedule}
          employees={employees}
          weekDays={weekDays}
          onAddShift={(employeeId, dateStr) =>
            setShiftModal({
              defaultEmployeeId: employeeId,
              defaultDate: dateStr,
            })
          }
          onEditShift={(shift) => setShiftModal({ shift })}
          onDeleteShift={(id) => setDeleteShiftId(id)}
          onMoveShift={(shiftId, employeeId, date) =>
            updateShift.mutate({
              id: shiftId,
              updates: { employee_id: employeeId, shift_date: date },
            })
          }
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
            deleteShift.mutate(deleteShiftId, {
              onSettled: () => setDeleteShiftId(null),
            })
          }
          onCancel={() => setDeleteShiftId(null)}
        />
      )}

      {analysisOpen && (
        <AnalysisModal
          analysis={analyzeSchedule.data?.analysis}
          isPending={analyzeSchedule.isPending}
          isError={analyzeSchedule.isError}
          onRetry={handleAnalyzeRetry}
          onClose={() => setAnalysisOpen(false)}
        />
      )}
    </>
  );
}
