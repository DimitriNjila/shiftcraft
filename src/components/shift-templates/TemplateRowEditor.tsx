import { useId } from "react";
import { Trash2 } from "lucide-react";
import { toHHMM, toHHMMSS } from "@/lib/utils/dates";
import type { ShiftTemplateEntry, Role } from "@/lib/types/template";

const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];

/** Local row shape — the flat per-day entry + a client-side key. */
export interface TemplateRow extends ShiftTemplateEntry {
  _key: string;
}

export interface TemplateRowEditorProps {
  row: TemplateRow;
  onChange: (row: TemplateRow) => void;
  onDelete: () => void;
}

/** Compact per-day row editor used by the setup / onboarding flow. */
export function TemplateRowEditor({
  row,
  onChange,
  onDelete,
}: TemplateRowEditorProps) {
  const startId = useId();
  const endId = useId();
  const countId = useId();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        background: "var(--surface-highest)",
      }}
      className="group"
    >
      <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange({ ...row, role: r })}
            style={{
              padding: "5px 10px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 600,
              background:
                row.role === r ? "var(--surface-lowest)" : "transparent",
              color:
                row.role === r
                  ? "var(--on-surface)"
                  : "var(--on-surface-muted)",
              boxShadow:
                row.role === r
                  ? "inset 0 0 0 1.5px var(--accent-fixed)"
                  : "none",
              border: "none",
              cursor: "pointer",
              transition: "all 0.14s",
            }}
          >
            {r}
          </button>
        ))}
      </div>

      <div
        style={{ width: 1, height: 20, background: "var(--hairline)", flexShrink: 0 }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        <label className="label-sm" htmlFor={startId} style={{ fontSize: 9 }}>
          Start
        </label>
        <input
          id={startId}
          type="time"
          className="input mono"
          value={toHHMM(row.start_time)}
          onChange={(e) =>
            onChange({ ...row, start_time: toHHMMSS(e.target.value) })
          }
          style={{ padding: "4px 8px", fontSize: 12, width: 92 }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        <label className="label-sm" htmlFor={endId} style={{ fontSize: 9 }}>
          End
        </label>
        <input
          id={endId}
          type="time"
          className="input mono"
          value={toHHMM(row.end_time)}
          onChange={(e) =>
            onChange({ ...row, end_time: toHHMMSS(e.target.value) })
          }
          style={{ padding: "4px 8px", fontSize: 12, width: 92 }}
        />
      </div>

      <div
        style={{ width: 1, height: 20, background: "var(--hairline)", flexShrink: 0 }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
        <label className="label-sm" htmlFor={countId} style={{ fontSize: 9 }}>
          Staff
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button
            type="button"
            onClick={() =>
              onChange({ ...row, count: Math.max(1, row.count - 1) })
            }
            className="btn btn-icon btn-ghost"
            style={{ width: 22, height: 22, fontSize: 14, lineHeight: 1 }}
            aria-label="Decrease count"
          >
            −
          </button>
          <span
            id={countId}
            className="mono"
            style={{ fontSize: 13, fontWeight: 600, width: 18, textAlign: "center" }}
          >
            {row.count}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...row, count: row.count + 1 })}
            className="btn btn-icon btn-ghost"
            style={{ width: 22, height: 22, fontSize: 14, lineHeight: 1 }}
            aria-label="Increase count"
          >
            +
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={onDelete}
        className="btn btn-icon btn-ghost"
        style={{ marginLeft: "auto", flexShrink: 0 }}
        aria-label="Remove slot"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}
