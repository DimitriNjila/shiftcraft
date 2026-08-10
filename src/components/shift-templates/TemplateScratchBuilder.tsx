import { useEffect, useState } from "react";
import { Plus, Trash2, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useSaveShiftTemplates } from "@/lib/hooks/use-templates";
import type { Role, ShiftTemplateEntry } from "@/lib/types/template";

const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];
const DAYS = [
  { value: 1, label: "Mon" },
  { value: 2, label: "Tue" },
  { value: 3, label: "Wed" },
  { value: 4, label: "Thu" },
  { value: 5, label: "Fri" },
  { value: 6, label: "Sat" },
  { value: 7, label: "Sun" },
] as const;

export interface TemplateScratchBuilderProps {
  /** Called with the number of templates saved after Done. */
  onDone: (savedCount: number) => void;
  /** Fires when the "dirty" state changes so the parent modal can
   *  confirm-on-close if the user has unsaved rows. */
  onDirtyChange?: (dirty: boolean) => void;
}

/**
 * Minimal in-modal template builder. One row at a time (day + start +
 * end + role + count) → grow a list → Done saves them all via
 * `useSaveShiftTemplates` and calls `onDone`. Deliberately narrow —
 * `/templates` is the place for editing, splitting, and reordering.
 */
export function TemplateScratchBuilder({
  onDone,
  onDirtyChange,
}: TemplateScratchBuilderProps) {
  const { data: restaurant } = useRestaurant();
  const save = useSaveShiftTemplates();

  const [rows, setRows] = useState<ShiftTemplateEntry[]>([]);
  const [draft, setDraft] = useState<ShiftTemplateEntry>({
    day_of_week: 1,
    start_time: "09:00:00",
    end_time: "17:00:00",
    role: "Server",
    count: 1,
  });

  useEffect(() => {
    onDirtyChange?.(rows.length > 0);
  }, [rows.length, onDirtyChange]);

  const addRow = () => {
    if (draft.start_time >= draft.end_time) {
      toast.error("End time must be after start time");
      return;
    }
    setRows((prev) => [...prev, draft]);
    // Keep day/role/count sticky so successive rows are cheap to add.
    setDraft({ ...draft });
  };

  const removeRow = (i: number) =>
    setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleDone = () => {
    if (!restaurant?.id) return;
    if (rows.length === 0) {
      toast.error("Add at least one template first");
      return;
    }
    save.mutate(
      { restaurant_id: restaurant.id, templates: rows },
      { onSuccess: () => onDone(rows.length) },
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div
        className="body-sm"
        style={{ color: "var(--on-surface-muted)", maxWidth: "56ch" }}
      >
        Add each recurring shift — an opening barista, weekend closers — one
        row at a time. You can fine-tune everything later from the Templates
        page.
      </div>

      {/* Draft row */}
      <div
        style={{
          background: "var(--surface-lowest)",
          borderRadius: "var(--r-xl)",
          boxShadow: "inset 0 0 0 1.5px var(--accent)",
          padding: 14,
          display: "grid",
          gap: 10,
          gridTemplateColumns: "0.9fr 0.9fr 0.9fr 0.9fr 0.55fr auto",
          alignItems: "end",
        }}
      >
        <LabelledField label="Day">
          <select
            className="input"
            value={draft.day_of_week}
            onChange={(e) =>
              setDraft({ ...draft, day_of_week: Number(e.target.value) })
            }
          >
            {DAYS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </LabelledField>
        <LabelledField label="Start">
          <input
            className="input mono"
            type="time"
            value={draft.start_time.slice(0, 5)}
            onChange={(e) =>
              setDraft({ ...draft, start_time: `${e.target.value}:00` })
            }
          />
        </LabelledField>
        <LabelledField label="End">
          <input
            className="input mono"
            type="time"
            value={draft.end_time.slice(0, 5)}
            onChange={(e) =>
              setDraft({ ...draft, end_time: `${e.target.value}:00` })
            }
          />
        </LabelledField>
        <LabelledField label="Role">
          <select
            className="input"
            value={draft.role}
            onChange={(e) =>
              setDraft({ ...draft, role: e.target.value as Role })
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </LabelledField>
        <LabelledField label="Count">
          <input
            className="input mono"
            type="number"
            min={1}
            max={20}
            value={draft.count}
            onChange={(e) =>
              setDraft({ ...draft, count: Math.max(1, Number(e.target.value)) })
            }
          />
        </LabelledField>
        <button
          type="button"
          className="btn btn-primary"
          onClick={addRow}
          style={{ fontSize: 13, padding: "9px 14px", height: 38 }}
        >
          <Plus size={14} /> Add
        </button>
      </div>

      {/* Row list */}
      {rows.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div className="label-md" style={{ fontSize: 10 }}>
            {rows.length} template{rows.length === 1 ? "" : "s"} ready
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {rows.map((r, i) => (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr 30px auto",
                  gap: 10,
                  alignItems: "center",
                  padding: "8px 12px",
                  background: "var(--surface-lowest)",
                  borderRadius: 10,
                  boxShadow: "inset 0 0 0 1px var(--hairline)",
                  fontSize: 12.5,
                }}
              >
                <span className="mono" style={{ fontWeight: 600 }}>
                  {DAYS.find((d) => d.value === r.day_of_week)?.label}
                </span>
                <span className="mono">
                  {r.start_time.slice(0, 5)} – {r.end_time.slice(0, 5)}
                </span>
                <span>{r.role}</span>
                <span className="mono" style={{ textAlign: "right" }}>
                  ×{r.count}
                </span>
                <button
                  type="button"
                  onClick={() => removeRow(i)}
                  className="btn btn-icon btn-ghost"
                  style={{ width: 26, height: 26, color: "var(--warning)" }}
                  aria-label={`Remove template ${i + 1}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 4,
        }}
      >
        <div
          className="body-sm"
          style={{ color: "var(--on-surface-faint)", fontSize: 12 }}
        >
          <Check size={12} style={{ verticalAlign: "-2px" }} /> Everything is
          editable later.
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleDone}
          disabled={rows.length === 0 || save.isPending}
          style={{ fontSize: 13.5, padding: "10px 18px" }}
        >
          {save.isPending
            ? "Saving…"
            : `Save ${rows.length || ""} template${rows.length === 1 ? "" : "s"}`}
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

function LabelledField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="label-md" style={{ marginBottom: 5, fontSize: 9.5 }}>
        {label}
      </div>
      {children}
    </div>
  );
}
