import type { LucideIcon } from "lucide-react";
import { MoreHorizontal } from "lucide-react";

export interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  /** Percent delta — positive shows ↗ emerald chip, negative shows ↘ coral chip. */
  change?: number;
  loading?: boolean;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  change,
  loading,
}: StatCardProps) {
  return (
    <div
      style={{
        background: "var(--surface-lowest)",
        borderRadius: "var(--r-xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline), var(--shadow-ambient)",
        padding: "16px 18px 14px",
        display: "flex",
        flexDirection: "column",
        minHeight: 126,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
        <div
          style={{
            width: 26,
            height: 26,
            borderRadius: 7,
            background: "var(--surface-high)",
            boxShadow: "inset 0 0 0 1px var(--hairline)",
            display: "grid",
            placeItems: "center",
            color: "var(--on-surface-muted)",
          }}
        >
          <Icon size={14} />
        </div>
        <div className="title-sm" style={{ fontSize: 13, flex: 1 }}>
          {label}
        </div>
        <button
          className="btn btn-icon btn-ghost"
          style={{ width: 24, height: 24 }}
          aria-label={`${label} options`}
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
      {loading ? (
        <div
          className="skeleton"
          style={{ height: 30, width: 80, marginTop: 12, borderRadius: 6 }}
        />
      ) : (
        <div
          className="mono"
          style={{
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          {value}
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "auto",
          paddingTop: 10,
        }}
      >
        <span
          className="body-sm"
          style={{ color: "var(--on-surface-muted)" }}
        >
          {sub}
        </span>
        {change !== undefined && !loading && (
          <span
            className="chip"
            style={{
              background:
                change >= 0
                  ? "color-mix(in oklab, var(--accent-fixed) 50%, var(--surface-high))"
                  : "var(--tertiary-fixed)",
              fontWeight: 600,
            }}
          >
            {change >= 0 ? "↗" : "↘"} {Math.abs(change)}%
          </span>
        )}
      </div>
    </div>
  );
}
