import { ChevronLeft, ChevronRight, Sparkles, Send, Zap } from "lucide-react";
import { getWeekRangeLabel, getWeekNumber } from "@/lib/utils/dates";
import type { Schedule } from "@/lib/types/schedule";

const ROLES: Array<{ id: string; label: string }> = [
  { id: "all", label: "All roles" },
  { id: "Server", label: "Server" },
  { id: "Cook", label: "Cook" },
  { id: "Host", label: "Host" },
  { id: "Manager", label: "Manager" },
];

export interface ScheduleToolbarProps {
  monday: Date;
  schedule: Schedule | undefined;
  laborCost: number;
  openShifts?: number;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  view: "week" | "day";
  onViewChange: (view: "week" | "day") => void;
  isCurrentWeek: boolean;
  isGenerating: boolean;
  isAnalyzing: boolean;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onShare: () => void;
  onAnalyze: () => void;
  onGenerate: () => void;
}

export function ScheduleToolbar({
  monday,
  schedule,
  laborCost,
  openShifts = 0,
  roleFilter,
  onRoleFilterChange,
  view,
  onViewChange,
  isCurrentWeek,
  isGenerating,
  isAnalyzing,
  onPrev,
  onNext,
  onToday,
  onShare,
  onAnalyze,
  onGenerate,
}: ScheduleToolbarProps) {
  const label = getWeekRangeLabel(monday);
  const weekNum = getWeekNumber(monday);
  const year = monday.getFullYear();
  const totalHours = schedule?.total_hours ?? 0;
  const hasSchedule = !!schedule;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        flexWrap: "wrap",
        rowGap: 10,
        gap: 12,
        padding: "12px 16px",
        background: "var(--surface-container)",
        borderRadius: "var(--r-xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
      }}
    >
      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <button
          type="button"
          onClick={onPrev}
          className="btn btn-icon btn-ghost"
          title="Previous week"
          aria-label="Previous week"
        >
          <ChevronLeft size={16} />
        </button>
        <div
          style={{
            padding: "4px 8px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <div className="title-sm" style={{ whiteSpace: "nowrap" }}>
            {label}
          </div>
          <div className="label-sm" style={{ whiteSpace: "nowrap" }}>
            Week {weekNum} · {year}
          </div>
        </div>
        <button
          type="button"
          onClick={onNext}
          className="btn btn-icon btn-ghost"
          title="Next week"
          aria-label="Next week"
        >
          <ChevronRight size={16} />
        </button>
        {!isCurrentWeek && (
          <button
            type="button"
            onClick={onToday}
            className="btn btn-ghost"
            style={{ fontSize: 12, marginLeft: 4 }}
          >
            Today
          </button>
        )}
      </div>

      <div
        style={{
          width: 1,
          height: 28,
          background: "var(--surface-high)",
        }}
      />

      {/* View toggle */}
      <div
        style={{
          display: "flex",
          background: "var(--surface-high)",
          borderRadius: 8,
          padding: 2,
        }}
      >
        {(["week", "day"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onViewChange(v)}
            style={{
              padding: "5px 12px",
              borderRadius: 6,
              background:
                view === v ? "var(--surface-lowest)" : "transparent",
              color:
                view === v ? "var(--on-surface)" : "var(--on-surface-muted)",
              fontSize: 12,
              fontWeight: 600,
              textTransform: "capitalize",
              boxShadow: view === v ? "0 1px 2px rgba(0,0,0,0.05)" : "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {v}
          </button>
        ))}
      </div>

      {/* Role filter */}
      <select
        value={roleFilter}
        onChange={(e) => onRoleFilterChange(e.target.value)}
        className="input"
        aria-label="Filter by role"
        style={{
          width: "auto",
          padding: "6px 10px",
          fontSize: 12,
          fontWeight: 500,
          background: "var(--surface-high)",
          borderRadius: 8,
        }}
      >
        {ROLES.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>

      <div style={{ flex: 1 }} />

      {/* Inline stats */}
      {hasSchedule && (
        <div style={{ display: "flex", gap: 16, padding: "0 4px" }}>
          <div>
            <div className="label-sm" style={{ fontSize: 10 }}>
              Labor
            </div>
            <div
              className="title-md mono"
              style={{ whiteSpace: "nowrap" }}
            >
              ${Math.round(laborCost).toLocaleString()}
            </div>
          </div>
          <div>
            <div className="label-sm" style={{ fontSize: 10 }}>
              Hours
            </div>
            <div className="title-md mono">{Math.round(totalHours)}</div>
          </div>
          <div>
            <div className="label-sm" style={{ fontSize: 10 }}>
              Open
            </div>
            <div
              className="title-md mono"
              style={{
                color:
                  openShifts > 0 ? "var(--warning)" : "var(--on-surface)",
              }}
            >
              {openShifts}
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          width: 1,
          height: 28,
          background: "var(--surface-high)",
        }}
      />

      {/* Actions */}
      <button
        type="button"
        onClick={onShare}
        className="btn btn-secondary"
        disabled={!hasSchedule}
      >
        <Send size={14} /> Share
      </button>
      <button
        type="button"
        onClick={onAnalyze}
        className="btn btn-secondary"
        disabled={!hasSchedule || isAnalyzing}
      >
        <Sparkles size={14} /> {isAnalyzing ? "Analysing…" : "AI analysis"}
      </button>
      <button
        type="button"
        onClick={onGenerate}
        className="btn btn-primary"
        disabled={isGenerating}
      >
        <Zap size={14} />{" "}
        {isGenerating ? "Generating…" : "Generate schedule"}
      </button>
    </div>
  );
}
