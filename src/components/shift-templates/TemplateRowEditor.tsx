import { Trash2 } from "lucide-react";
import { toHHMM, toHHMMSS } from "@/lib/utils/dates";
import type { ShiftTemplateEntry, Role } from "@/lib/types/template";

export const TEMPLATE_DAYS = [
  { num: 1, short: "Mon", label: "Monday" },
  { num: 2, short: "Tue", label: "Tuesday" },
  { num: 3, short: "Wed", label: "Wednesday" },
  { num: 4, short: "Thu", label: "Thursday" },
  { num: 5, short: "Fri", label: "Friday" },
  { num: 6, short: "Sat", label: "Saturday" },
  { num: 7, short: "Sun", label: "Sunday" },
];

export const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];

export function TemplateRowEditor({
  entry,
  onRemove,
  onChange,
}: {
  entry: ShiftTemplateEntry;
  onRemove: () => void;
  onChange: (updated: ShiftTemplateEntry) => void;
}) {
  return (
    <div className="flex items-center gap-2 py-2 border-b border-surface-highest last:border-0 flex-wrap">
      <select
        value={entry.day_of_week}
        onChange={(e) => onChange({ ...entry, day_of_week: Number(e.target.value) })}
        className="input-field py-1 px-2 text-[12px] w-[72px]"
      >
        {TEMPLATE_DAYS.map((d) => (
          <option key={d.num} value={d.num}>{d.short}</option>
        ))}
      </select>

      <select
        value={entry.role}
        onChange={(e) => onChange({ ...entry, role: e.target.value as Role })}
        className="input-field py-1 px-2 text-[12px] w-[90px]"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{r}</option>
        ))}
      </select>

      <input
        type="time"
        value={toHHMM(entry.start_time)}
        onChange={(e) => onChange({ ...entry, start_time: toHHMMSS(e.target.value) })}
        className="input-field py-1 px-2 text-[12px] w-[88px]"
      />
      <span className="text-on-surface-faint text-[12px]">–</span>
      <input
        type="time"
        value={toHHMM(entry.end_time)}
        onChange={(e) => onChange({ ...entry, end_time: toHHMMSS(e.target.value) })}
        className="input-field py-1 px-2 text-[12px] w-[88px]"
      />

      <div className="flex items-center gap-1 ml-auto">
        <span className="label-md text-on-surface-muted" style={{ fontSize: 11 }}>×</span>
        <input
          type="number"
          min={1}
          max={20}
          value={entry.count}
          onChange={(e) =>
            onChange({ ...entry, count: Math.max(1, Number(e.target.value)) })
          }
          className="input-field py-1 px-2 text-[12px] w-[52px]"
        />
        <button
          type="button"
          onClick={onRemove}
          className="btn-icon btn-ghost ml-1"
          aria-label="Remove template row"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
