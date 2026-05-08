import { AlertTriangle, CheckCircle } from "lucide-react";
import { formatShiftTime } from "@/lib/utils/dates";
import type { CoverageGap } from "@/lib/utils/coverage";

interface CoverageGapsProps {
  gaps: CoverageGap[];
  requiredHours: number;
  scheduledHours: number;
}

export function CoverageGaps({
  gaps,
  requiredHours,
  scheduledHours,
}: CoverageGapsProps) {
  const totalUnfilled = gaps.reduce((sum, g) => sum + g.gap, 0);
  const hoursLabel = (h: number) =>
    h % 1 === 0 ? `${h}h` : `${h.toFixed(1)}h`;

  if (gaps.length === 0 && requiredHours > 0) {
    return (
      <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-primary-fixed/40 bg-primary-fixed/10 px-4 py-3">
        <CheckCircle size={15} className="text-primary shrink-0" />
        <p className="body-sm text-on-surface">
          All {hoursLabel(requiredHours)} of required coverage filled
        </p>
      </div>
    );
  }

  if (gaps.length === 0) return null;

  return (
    <div className="mb-6 rounded-xl border border-warning/30 bg-warning-container/20 px-4 py-3.5">
      <div className="flex items-start gap-3">
        <AlertTriangle size={15} className="text-warning shrink-0 mt-px" />
        <div className="min-w-0 flex-1">
          <p className="body-sm font-semibold text-on-surface">
            {totalUnfilled} slot{totalUnfilled !== 1 ? "s" : ""} still need
            coverage
            <span className="font-normal text-on-surface-muted ml-2">
              {hoursLabel(scheduledHours)} scheduled ·{" "}
              {hoursLabel(requiredHours)} required
            </span>
          </p>

          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {gaps.map((gap) => (
              <GapPill
                key={`${gap.dayName}-${gap.role}-${gap.start_time}`}
                gap={gap}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function GapPill({ gap }: { gap: CoverageGap }) {
  const start = formatShiftTime(gap.start_time);
  const end = formatShiftTime(gap.end_time);

  return (
    <div className="inline-flex items-center gap-1.5 rounded-lg border border-surface-highest bg-surface px-2.5 py-1.5">
      <span className="label-md font-semibold" style={{ fontSize: 11 }}>
        {gap.dayName}
      </span>
      <span className="text-on-surface-faint" style={{ fontSize: 11 }}>
        ·
      </span>
      <span className="label-md text-on-surface-muted" style={{ fontSize: 11 }}>
        {gap.role}
      </span>
      <span className="text-on-surface-faint" style={{ fontSize: 11 }}>
        ·
      </span>
      <span
        className="label-md mono text-on-surface-muted"
        style={{ fontSize: 11 }}
      >
        {start}–{end}
      </span>
      <span
        className="ml-0.5 rounded-full px-1.5 py-0.5 label-md font-bold mono"
        style={{
          fontSize: 10,
          background: "var(--color-warning-container)",
          color: "var(--color-warning)",
        }}
      >
        {gap.filled}/{gap.needed}
      </span>
    </div>
  );
}
