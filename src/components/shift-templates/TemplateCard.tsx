import { useState } from "react";
import { ChevronRight, Clock, Trash2 } from "lucide-react";
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
  onDelete,
}: {
  group: TemplateGroup;
  onEdit: () => void;
  onDelete?: (id: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const hue = roleHue(group.role);
  const name = autoName(group);
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onEdit}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onEdit();
        }
      }}
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
      {onDelete && (
        confirming ? (
          <span
            style={{ display: "inline-flex", gap: 4, alignItems: "center" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="btn btn-primary"
              style={{
                fontSize: 11,
                padding: "4px 8px",
                background: "var(--tertiary-fixed-dim, #b91c1c)",
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(group.id);
                setConfirming(false);
              }}
              title="Confirm delete"
            >
              Delete
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              style={{ fontSize: 11, padding: "4px 6px" }}
              onClick={(e) => {
                e.stopPropagation();
                setConfirming(false);
              }}
            >
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="btn btn-ghost btn-icon"
            aria-label="Delete template"
            title="Delete template"
            onClick={(e) => {
              e.stopPropagation();
              setConfirming(true);
            }}
            style={{ color: "var(--on-surface-muted)" }}
          >
            <Trash2 size={14} />
          </button>
        )
      )}
      <ChevronRight size={14} style={{ color: "var(--on-surface-faint)" }} />
    </div>
  );
}
