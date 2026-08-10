import { useState } from "react";
import { X, Plus } from "lucide-react";
import type { AxiosError } from "axios";
import {
  useAvailability,
  useAddAvailability,
  useDeleteAvailability,
} from "@/lib/hooks/use-availability";
import { toHHMM, toHHMMSS } from "@/lib/utils/dates";
import type { Employee } from "@/lib/types/employee";
import type { AvailabilityWindow } from "@/lib/types/availability";

// ── Constants ────────────────────────────────────────────────

const DAYS = [
  { num: 1, short: "Mon", long: "Monday" },
  { num: 2, short: "Tue", long: "Tuesday" },
  { num: 3, short: "Wed", long: "Wednesday" },
  { num: 4, short: "Thu", long: "Thursday" },
  { num: 5, short: "Fri", long: "Friday" },
  { num: 6, short: "Sat", long: "Saturday" },
  { num: 7, short: "Sun", long: "Sunday" },
];

// ── Window chip ──────────────────────────────────────────────

function WindowChip({
  window,
  onDelete,
  isDeleting,
}: {
  window: AvailabilityWindow;
  onDelete: () => void;
  isDeleting: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-1.5 rounded-lg px-2 py-1.5 bg-primary-fixed/30 transition-opacity ${isDeleting ? "opacity-40" : ""}`}
    >
      <span className="label-md mono text-on-surface" style={{ fontSize: 11 }}>
        {toHHMM(window.start_time)}–{toHHMM(window.end_time)}
      </span>
      <button
        type="button"
        onClick={onDelete}
        disabled={isDeleting}
        className="text-on-surface-faint hover:text-on-surface transition-colors shrink-0"
        aria-label={`Remove ${toHHMM(window.start_time)}–${toHHMM(window.end_time)}`}
      >
        <X size={11} />
      </button>
    </div>
  );
}

// ── Add form (inline per day) ────────────────────────────────

function AddForm({
  onAdd,
  onCancel,
  isPending,
  error,
}: {
  onAdd: (start: string, end: string) => void;
  onCancel: () => void;
  isPending: boolean;
  error: string;
}) {
  const [start, setStart] = useState("11:00");
  const [end, setEnd] = useState("16:00");

  return (
    <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-surface-container ring-1 ring-primary-fixed/60">
      <div className="flex flex-col gap-1">
        <label
          className="label-md"
          style={{ fontSize: 9, letterSpacing: "0.06em" }}
        >
          FROM
        </label>
        <input
          type="time"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="input-field py-1 px-2 text-[11px] w-full"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label
          className="label-md"
          style={{ fontSize: 9, letterSpacing: "0.06em" }}
        >
          TO
        </label>
        <input
          type="time"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="input-field py-1 px-2 text-[11px] w-full"
        />
      </div>

      {error && (
        <p className="body-sm text-warning" style={{ fontSize: 10 }}>
          {error}
        </p>
      )}

      <div className="flex gap-1 mt-0.5">
        <button
          type="button"
          onClick={() => onAdd(start, end)}
          disabled={isPending}
          className="btn btn-primary flex-1 justify-center py-1 text-[11px]"
        >
          {isPending ? "…" : "Add"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-ghost py-1 px-2 text-[11px]"
          aria-label="Cancel"
        >
          <X size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Day column ───────────────────────────────────────────────

function DayColumn({
  day,
  windows,
  addingHere,
  onOpenAdd,
  addError,
  isAddPending,
  onAdd,
  onCancelAdd,
  onDelete,
  deletingId,
}: {
  day: { num: number; short: string; long: string };
  windows: AvailabilityWindow[];
  addingHere: boolean;
  onOpenAdd: () => void;
  addError: string;
  isAddPending: boolean;
  onAdd: (start: string, end: string) => void;
  onCancelAdd: () => void;
  onDelete: (id: string) => void;
  deletingId: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5 min-w-0">
      {/* Day header */}
      <p className="label-md font-semibold text-center text-on-surface-muted mb-1">
        {day.short}
      </p>

      {/* Existing windows */}
      {windows.map((w) => (
        <WindowChip
          key={w.id}
          window={w}
          onDelete={() => onDelete(w.id)}
          isDeleting={deletingId === w.id}
        />
      ))}

      {/* Add form or trigger */}
      {addingHere ? (
        <AddForm
          onAdd={onAdd}
          onCancel={onCancelAdd}
          isPending={isAddPending}
          error={addError}
        />
      ) : (
        <button
          type="button"
          onClick={onOpenAdd}
          className="flex items-center justify-center gap-1 w-full rounded-lg py-1.5 text-on-surface-faint hover:bg-surface-container hover:text-on-surface transition-colors border border-dashed border-surface-highest"
          style={{ fontSize: 11 }}
          aria-label={`Add availability window for ${day.long}`}
        >
          <Plus size={10} />
          Add
        </button>
      )}
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────

export interface AvailabilityModalProps {
  employee: Employee;
  onClose: () => void;
}

export function AvailabilityModal({
  employee,
  onClose,
}: AvailabilityModalProps) {
  const { data: windows = [], isLoading } = useAvailability(employee.id);
  const addAvailability = useAddAvailability(employee.id);
  const deleteAvailability = useDeleteAvailability(employee.id);

  // Which day's add form is open (null = none)
  const [addingDay, setAddingDay] = useState<number | null>(null);
  // Which window delete is in-flight (for optimistic opacity)
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function openAdd(day: number) {
    addAvailability.reset();
    setAddingDay(day);
  }

  function handleAdd(day: number, start: string, end: string) {
    addAvailability.mutate(
      {
        day_of_week: day,
        start_time: toHHMMSS(start),
        end_time: toHHMMSS(end),
      },
      {
        onSuccess: () => setAddingDay(null),
      },
    );
  }

  function handleDelete(id: string) {
    setDeletingId(id);
    deleteAvailability.mutate(id, {
      onSettled: () => setDeletingId(null),
    });
  }

  // Derive the inline add error message for the active form
  const addError = (() => {
    if (!addAvailability.isError) return "";
    const status = (addAvailability.error as AxiosError<{ detail?: string }>)
      ?.response?.status;
    if (status === 409) return "This window already exists";
    return "Failed to add — please try again";
  })();

  const hasNoWindows = !isLoading && windows.length === 0;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 760, width: "95vw" }}
        role="dialog"
        aria-modal="true"
        aria-label={`Availability for ${employee.name}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <span className="label-md text-on-surface-muted">Availability</span>
            <h2 className="headline-md mt-0.5">{employee.name}</h2>
            <p className="body-sm text-on-surface-muted mt-0.5">
              Set the hours {employee.name.split(" ")[0]} is available each week
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-icon btn-ghost shrink-0"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* No windows banner */}
        {hasNoWindows && (
          <div className="mt-4 rounded-xl bg-surface-low px-4 py-3">
            <p className="body-sm text-on-surface-muted">
              No availability set —{" "}
              <span className="text-on-surface font-medium">
                {employee.name.split(" ")[0]} will be treated as always
                available.
              </span>{" "}
              Add windows below to restrict scheduling to specific days and
              times.
            </p>
          </div>
        )}

        {/* 7-column weekly grid */}
        <div className="mt-4">
          {isLoading ? (
            <div className="grid grid-cols-7 gap-3">
              {DAYS.map((d) => (
                <div key={d.num} className="flex flex-col gap-1.5">
                  <div className="skeleton h-3 w-8 rounded mx-auto mb-1" />
                  <div className="skeleton h-8 rounded-lg" />
                  <div className="skeleton h-6 rounded-lg" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {DAYS.map((day) => {
                const dayWindows = windows
                  .filter((w) => w.day_of_week === day.num)
                  .sort((a, b) => a.start_time.localeCompare(b.start_time));

                return (
                  <DayColumn
                    key={day.num}
                    day={day}
                    windows={dayWindows}
                    addingHere={addingDay === day.num}
                    onOpenAdd={() => openAdd(day.num)}
                    addError={addingDay === day.num ? addError : ""}
                    isAddPending={addAvailability.isPending}
                    onAdd={(start, end) => handleAdd(day.num, start, end)}
                    onCancelAdd={() => {
                      setAddingDay(null);
                      addAvailability.reset();
                    }}
                    onDelete={handleDelete}
                    deletingId={deletingId}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="body-sm text-on-surface-faint mt-5 text-center">
          Days with no windows set are treated as{" "}
          <span className="text-on-surface-muted">unavailable</span> when some
          days have windows.
        </p>
      </div>
    </div>
  );
}
