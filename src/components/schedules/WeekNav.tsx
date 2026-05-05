import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { getWeekRangeLabel, getWeekNumber } from "@/lib/utils/dates";
import type { Schedule } from "@/lib/types/schedule";

interface WeekNavProps {
  monday: Date;
  schedule: Schedule | undefined;
  laborCost: number;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onAnalyze: () => void;
  isCurrentWeek: boolean;
  isAnalyzing: boolean;
}

export function WeekNav({
  monday,
  schedule,
  laborCost,
  onPrev,
  onNext,
  onToday,
  onAnalyze,
  isCurrentWeek,
  isAnalyzing,
}: WeekNavProps) {
  const label = getWeekRangeLabel(monday);
  const weekNum = getWeekNumber(monday);
  const year = monday.getFullYear();

  return (
    <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            className="btn-icon btn-ghost"
            aria-label="Previous week"
          >
            <ChevronLeft size={17} />
          </button>

          <div className="text-center min-w-35">
            <p className="headline-sm">{label}</p>
            <p
              className="label-md text-on-surface-muted"
              style={{ fontSize: 11 }}
            >
              Week {weekNum} · {year}
            </p>
          </div>

          <button
            type="button"
            onClick={onNext}
            className="btn-icon btn-ghost"
            aria-label="Next week"
          >
            <ChevronRight size={17} />
          </button>
        </div>

        {!isCurrentWeek && (
          <button
            type="button"
            onClick={onToday}
            className="btn btn-ghost text-sm"
          >
            Today
          </button>
        )}
      </div>

      <div className="flex items-center gap-4">
        {schedule && (
          <>
            <div className="flex items-center gap-5">
              <Stat label="SHIFTS" value={String(schedule.total_shifts)} />
              <Stat label="HOURS" value={String(schedule.total_hours)} />
              {laborCost > 0 && (
                <Stat label="LABOUR" value={`$${laborCost.toFixed(2)}`} />
              )}
            </div>

            <button
              type="button"
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="btn btn-ghost text-sm gap-1.5"
              aria-label="Analyse schedule with AI"
            >
              <Sparkles size={14} className="text-primary" />
              {isAnalyzing ? "Analysing…" : "Analyse"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-right">
      <p className="label-md text-on-surface-muted" style={{ fontSize: 10 }}>
        {label}
      </p>
      <p className="headline-sm mono">{value}</p>
    </div>
  );
}
