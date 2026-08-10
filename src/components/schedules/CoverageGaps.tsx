import { AlertCircle } from "lucide-react";
import { formatShiftTime } from "@/lib/utils/dates";
import { roleHue } from "@/lib/utils/roles";
import type { CoverageGap } from "@/lib/utils/coverage";

interface CoverageGapsProps {
  gaps: CoverageGap[];
  requiredHours: number;
  scheduledHours: number;
}

/**
 * Open-shifts strip. Mirrors the design's horizontal warning-tinted rail:
 * an alert icon + "N open shifts need coverage" title on the left, and a
 * horizontally-scrollable row of open-slot chips (day · time · role) on
 * the right. Hidden entirely when nothing needs covering.
 */
export function CoverageGaps({ gaps }: CoverageGapsProps) {
  const totalUnfilled = gaps.reduce((sum, g) => sum + g.gap, 0);
  if (totalUnfilled === 0) return null;

  return (
    <div
      style={{
        padding: "14px 18px",
        background:
          "color-mix(in oklab, var(--warning-container) 40%, var(--surface-container))",
        borderRadius: "var(--r-xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}
    >
      <AlertCircle size={18} style={{ color: "var(--warning)", flexShrink: 0 }} />
      <div style={{ flexShrink: 0 }}>
        <div className="title-sm" style={{ fontSize: 13 }}>
          {totalUnfilled} open shift{totalUnfilled === 1 ? "" : "s"} need
          coverage
        </div>
        <div className="label-sm" style={{ fontSize: 10 }}>
          Drag onto a staff row, or use Generate schedule
        </div>
      </div>
      <div
        style={{
          width: 1,
          height: 28,
          background: "var(--surface-high)",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 8,
          overflowX: "auto",
          minWidth: 0,
        }}
      >
        {gaps.flatMap((g) => {
          const count = Math.max(1, g.gap);
          return Array.from({ length: count }, (_, i) => (
            <GapChip key={`${g.dateStr}-${g.role}-${g.start_time}-${i}`} gap={g} />
          ));
        })}
      </div>
    </div>
  );
}

function GapChip({ gap }: { gap: CoverageGap }) {
  const hue = roleHue(gap.role);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "var(--surface-lowest)",
        borderRadius: 10,
        cursor: "grab",
        flexShrink: 0,
        boxShadow: "var(--shadow-ambient)",
      }}
    >
      <div className="label-sm" style={{ fontSize: 10 }}>
        {gap.dayName}
      </div>
      <div className="mono" style={{ fontSize: 12 }}>
        {formatShiftTime(gap.start_time)} – {formatShiftTime(gap.end_time)}
      </div>
      <div
        className="chip"
        style={{
          background: `oklch(0.88 0.04 ${hue})`,
          color: `oklch(0.3 0.08 ${hue})`,
          fontSize: 10,
        }}
      >
        {gap.role}
      </div>
    </div>
  );
}
