import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useWeekSchedule,
  useGenerateSchedule,
} from "@/lib/hooks/use-schedules";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useUpdateShift, useDeleteShift } from "@/lib/hooks/use-shifts";
import { useAnalyzeSchedule } from "@/lib/hooks/use-analysis";
import { useShiftTemplates } from "@/lib/hooks/use-templates";
import { ScheduleToolbar } from "@/components/schedules/ScheduleToolbar";
import { WeeklyGrid } from "@/components/schedules/WeeklyGrid";
import { ShiftModal } from "@/components/schedules/ShiftModal";
import { AnalysisModal } from "@/components/schedules/AnalysisModal";
import { ShareModal } from "@/components/schedules/ShareModal";
import { CoverageGaps } from "@/components/schedules/CoverageGaps";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import {
  getMondayOfWeek,
  getWeekDays,
  getWeekRangeLabel,
  toDateStr,
  fromDateStr,
} from "@/lib/utils/dates";
import {
  computeCoverageGaps,
  computeRequiredHours,
} from "@/lib/utils/coverage";
import { usePageMeta } from "@/components/layout/page-meta";
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

  const { schedule, isLoading, isFetching, error, refetch } = useWeekSchedule(
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
  const openShifts = coverageGaps.reduce((sum, g) => sum + Math.max(0, g.gap), 0);

  const [shiftModal, setShiftModal] = useState<ShiftModalState | null>(null);
  const [deleteShiftId, setDeleteShiftId] = useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [generateConfirmOpen, setGenerateConfirmOpen] = useState(false);
  const [roleFilter, setRoleFilter] = useState("all");
  const [view, setView] = useState<"week" | "day">("week");

  const isCurrentWeek = weekStart === getCurrentMondayStr();
  const weekLabel = getWeekRangeLabel(monday);

  usePageMeta({
    title: "Weekly schedule",
    breadcrumbs: ["Schedule", weekLabel],
  });

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
    if (schedule) {
      setGenerateConfirmOpen(true);
    } else {
      generateSchedule.mutate({
        restaurant_id: restaurant.id,
        week_start: weekStart,
      });
    }
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

  const filteredEmployees =
    roleFilter === "all"
      ? employees
      : employees.filter((e) => e.role === roleFilter);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <ScheduleToolbar
        monday={monday}
        schedule={schedule}
        laborCost={laborCost}
        openShifts={openShifts}
        roleFilter={roleFilter}
        onRoleFilterChange={setRoleFilter}
        view={view}
        onViewChange={setView}
        isCurrentWeek={isCurrentWeek}
        isGenerating={generateSchedule.isPending}
        isAnalyzing={analyzeSchedule.isPending}
        onPrev={prevWeek}
        onNext={nextWeek}
        onToday={goToday}
        onShare={() => setShareOpen(true)}
        onAnalyze={handleAnalyze}
        onGenerate={handleGenerate}
      />

      {!isLoading &&
        !isFetching &&
        !error &&
        schedule &&
        templates.length > 0 && (
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
          employees={filteredEmployees}
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

      {generateConfirmOpen && (
        <ConfirmModal
          title="Regenerate schedule?"
          description="This will replace the existing schedule for this week. Any manual edits will be lost."
          confirmLabel="Regenerate"
          isPending={generateSchedule.isPending}
          onConfirm={() => {
            generateSchedule.mutate({
              restaurant_id: restaurant!.id,
              week_start: weekStart,
            });
            setGenerateConfirmOpen(false);
          }}
          onCancel={() => setGenerateConfirmOpen(false)}
        />
      )}

      {analysisOpen && (
        <AnalysisModal
          data={analyzeSchedule.data}
          isPending={analyzeSchedule.isPending}
          isError={analyzeSchedule.isError}
          error={analyzeSchedule.error}
          onRetry={handleAnalyzeRetry}
          onClose={() => setAnalysisOpen(false)}
        />
      )}

      {shareOpen && schedule && (
        <ShareModal
          scheduleId={schedule.id}
          weekLabel={weekLabel}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  );
}
