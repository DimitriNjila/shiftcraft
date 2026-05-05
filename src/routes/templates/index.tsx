import { useState, useEffect, useId } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useShiftTemplates,
  useSaveShiftTemplates,
} from "@/lib/hooks/use-templates";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { toHHMM, toHHMMSS } from "@/lib/utils/dates";
import type { ShiftTemplateEntry, Role } from "@/lib/types/template";

// ── Constants ─────────────────────────────────────────────────

const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];

const DAYS = [
  { num: 1, label: "Monday" },
  { num: 2, label: "Tuesday" },
  { num: 3, label: "Wednesday" },
  { num: 4, label: "Thursday" },
  { num: 5, label: "Friday" },
  { num: 6, label: "Saturday" },
  { num: 7, label: "Sunday" },
];

const DEFAULT_ENTRY: Omit<ShiftTemplateEntry, "day_of_week"> = {
  start_time: "09:00:00",
  end_time: "17:00:00",
  role: "Server",
  count: 1,
};

// ── Local row type (adds a client-side key for stable React keys) ──

interface TemplateRow extends ShiftTemplateEntry {
  _key: string;
}

let _seq = 0;
function makeKey() {
  return `row-${++_seq}`;
}

function toRows(entries: ShiftTemplateEntry[]): TemplateRow[] {
  return entries.map((e) => ({ ...e, _key: makeKey() }));
}

function toEntries(rows: TemplateRow[]): ShiftTemplateEntry[] {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return rows.map(({ _key: _, ...entry }) => entry);
}

// ── Template row component ─────────────────────────────────────

interface RowProps {
  row: TemplateRow;
  onChange: (row: TemplateRow) => void;
  onDelete: () => void;
}

function TemplateRowEditor({ row, onChange, onDelete }: RowProps) {
  const startId = useId();
  const endId = useId();
  const countId = useId();

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-xl bg-surface-highest group">
      {/* Role selector */}
      <div className="flex gap-1 shrink-0">
        {ROLES.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => onChange({ ...row, role: r })}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border-none cursor-pointer ${
              row.role === r
                ? "bg-surface-lowest shadow-[inset_0_0_0_1.5px_var(--color-primary-fixed)] text-on-surface"
                : "text-on-surface-muted hover:text-on-surface"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-surface-highest shrink-0" />

      {/* Start time */}
      <div className="flex flex-col items-start gap-0.5 shrink-0">
        <label htmlFor={startId} className="label-md" style={{ fontSize: 9 }}>
          START
        </label>
        <input
          id={startId}
          type="time"
          value={toHHMM(row.start_time)}
          onChange={(e) =>
            onChange({ ...row, start_time: toHHMMSS(e.target.value) })
          }
          className="input-field py-1 px-2 text-[12px] w-22.5"
        />
      </div>

      {/* End time */}
      <div className="flex flex-col items-start gap-0.5 shrink-0">
        <label htmlFor={endId} className="label-md" style={{ fontSize: 9 }}>
          END
        </label>
        <input
          id={endId}
          type="time"
          value={toHHMM(row.end_time)}
          onChange={(e) =>
            onChange({ ...row, end_time: toHHMMSS(e.target.value) })
          }
          className="input-field py-1 px-2 text-[12px] w-22.5"
        />
      </div>

      <div className="w-px h-5 bg-surface-highest shrink-0" />

      {/* Count stepper */}
      <div className="flex flex-col items-start gap-0.5 shrink-0">
        <label htmlFor={countId} className="label-md" style={{ fontSize: 9 }}>
          STAFF
        </label>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              onChange({ ...row, count: Math.max(1, row.count - 1) })
            }
            className="btn-icon btn-ghost w-6 h-6 text-[14px] leading-none"
            aria-label="Decrease count"
          >
            −
          </button>
          <span
            id={countId}
            className="mono text-[13px] font-semibold w-4 text-center"
          >
            {row.count}
          </span>
          <button
            type="button"
            onClick={() => onChange({ ...row, count: row.count + 1 })}
            className="btn-icon btn-ghost w-6 h-6 text-[14px] leading-none"
            aria-label="Increase count"
          >
            +
          </button>
        </div>
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={onDelete}
        className="ml-auto btn-icon btn-ghost opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
        aria-label="Remove slot"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ── Day section ────────────────────────────────────────────────

interface DaySectionProps {
  dayNum: number;
  label: string;
  rows: TemplateRow[];
  onAdd: () => void;
  onChange: (row: TemplateRow) => void;
  onDelete: (key: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DaySection({
  dayNum: _,
  label,
  rows,
  onAdd,
  onChange,
  onDelete,
}: DaySectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="title-sm text-on-surface">{label}</h3>
        <button
          type="button"
          onClick={onAdd}
          className="btn btn-ghost text-xs gap-1 py-1"
        >
          <Plus size={12} />
          Add slot
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="body-sm text-on-surface-faint px-1">
          No shifts scheduled
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {rows.map((row) => (
            <TemplateRowEditor
              key={row._key}
              row={row}
              onChange={onChange}
              onDelete={() => onDelete(row._key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────

export default function TemplatesPage() {
  const { data: restaurant } = useRestaurant();
  const {
    data: record,
    status,
    // error,
    refetch,
  } = useShiftTemplates(restaurant?.id);
  const saveTemplates = useSaveShiftTemplates();

  const [rows, setRows] = useState<TemplateRow[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Sync local state when server data loads
  useEffect(() => {
    if (status === "success") {
      setRows(record ? toRows(record.templates) : []);
      setIsDirty(false);
    }
  }, [status, record]);

  function mutate(updater: (prev: TemplateRow[]) => TemplateRow[]) {
    setRows(updater);
    setIsDirty(true);
  }

  function addRow(dayNum: number) {
    mutate((prev) => [
      ...prev,
      { ...DEFAULT_ENTRY, day_of_week: dayNum, _key: makeKey() },
    ]);
  }

  function updateRow(updated: TemplateRow) {
    mutate((prev) => prev.map((r) => (r._key === updated._key ? updated : r)));
  }

  function deleteRow(key: string) {
    mutate((prev) => prev.filter((r) => r._key !== key));
  }

  function handleSave() {
    if (!restaurant?.id) return;
    saveTemplates.mutate(
      { restaurant_id: restaurant.id, templates: toEntries(rows) },
      { onSuccess: () => setIsDirty(false) },
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Recurring patterns</span>
          <h1 className="headline-lg mt-1.5">Templates</h1>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || saveTemplates.isPending || !restaurant?.id}
          className="btn btn-primary py-2.5 text-sm"
        >
          {saveTemplates.isPending ? "Saving…" : "Save changes"}
        </button>
      </div>

      <p className="body-sm text-on-surface-muted mb-8 max-w-xl">
        Define the shift pattern the auto-generator will use. The generator
        matches employees to open slots based on role, rest rules, and weekly
        hour caps.
      </p>

      {status === "pending" && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size={28} />
        </div>
      )}

      {status === "error" && (
        <ErrorMessage
          message="Failed to load templates"
          onRetry={() => refetch()}
        />
      )}

      {status === "success" && (
        <div className="max-w-3xl">
          {DAYS.map(({ num, label }) => (
            <DaySection
              key={num}
              dayNum={num}
              label={label}
              rows={rows.filter((r) => r.day_of_week === num)}
              onAdd={() => addRow(num)}
              onChange={updateRow}
              onDelete={deleteRow}
            />
          ))}
        </div>
      )}
    </>
  );
}
