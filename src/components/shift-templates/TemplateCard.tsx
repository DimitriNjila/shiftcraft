import { ChevronRight, Clock } from "lucide-react";
import { formatShiftTime } from "@/lib/utils/dates";
import {
  autoName,
  dayRangeLabel,
  type TemplateGroup,
} from "@/lib/utils/templates";
import { roleHue } from "@/lib/utils/roles";

export function TemplateCard({
  group,
  onEdit,
}: {
  group: TemplateGroup;
  onEdit: () => void;
}) {
  const hue = roleHue(group.role);
  const name = autoName(group);
  return (
    <button
      type="button"
      onClick={onEdit}
      style={{
        background: "var(--surface-lowest)",
        borderRadius: "var(--r-lg)",
        padding: "16px 18px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        cursor: "pointer",
        transition: "transform 0.14s ease, box-shadow 0.14s ease",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        border: "none",
        width: "100%",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow =
          "inset 0 0 0 1px var(--hairline), var(--shadow-ambient)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "inset 0 0 0 1px var(--hairline)";
      }}
    >
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 11,
          flexShrink: 0,
          background: `oklch(0.92 0.04 ${hue})`,
          color: `oklch(0.35 0.09 ${hue})`,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Clock size={19} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="title-sm" style={{ fontSize: 13.5 }}>
          {name}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginTop: 3,
          }}
        >
          <span
            className="mono"
            style={{
              fontSize: 12,
              color: "var(--on-surface-muted)",
              whiteSpace: "nowrap",
            }}
          >
            {formatShiftTime(group.start_time)} – {formatShiftTime(group.end_time)}
          </span>
          <span
            style={{
              width: 3,
              height: 3,
              borderRadius: "50%",
              background: "var(--on-surface-faint)",
            }}
          />
          <span className="label-sm" style={{ fontSize: 10 }}>
            {dayRangeLabel(group.days)}
          </span>
        </div>
      </div>
      <span
        className="chip"
        style={{
          background: `oklch(0.9 0.04 ${hue})`,
          color: `oklch(0.32 0.08 ${hue})`,
        }}
      >
        {group.role}
        {group.count > 1 ? ` × ${group.count}` : ""}
      </span>
      <ChevronRight size={14} style={{ color: "var(--on-surface-faint)" }} />
    </button>
  );
}
