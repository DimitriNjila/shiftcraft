import { useEffect, useMemo, useRef, useState } from "react";
import {
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useEmployees } from "@/lib/hooks/use-employees";
import {
  useImportShiftTemplates,
  useSaveShiftTemplates,
  useShiftTemplates,
} from "@/lib/hooks/use-templates";
import { ImportStepDots } from "@/components/shift-templates/ImportStepDots";
import {
  parseScheduleFile,
  type ParsedShiftRow,
} from "@/lib/utils/schedule-import";
import { templatesApi } from "@/lib/api/templates";
import {
  buildPreviewRows,
  groupIntoTemplates,
  type PreviewRow,
} from "@/lib/utils/templates-from-schedule";
import { formatShiftTime } from "@/lib/utils/dates";
import type { Role } from "@/lib/types/template";
import type { Employee } from "@/lib/types/employee";

const DAY_LABEL: Record<number, string> = {
  1: "Mon",
  2: "Tue",
  3: "Wed",
  4: "Thu",
  5: "Fri",
  6: "Sat",
  7: "Sun",
};

const ROLES: Role[] = ["Server", "Cook", "Host", "Manager"];

export interface TemplateImportFlowProps {
  /**
   * Called with the number of templates saved after the import confirms.
   * The caller decides where to navigate (dashboard, setup step 4, etc.).
   */
  onDone: (templatesSaved: number) => void;
  /** Optional — called if the user aborts before saving. */
  onCancel?: () => void;
  /**
   * `compact` trims the outer padding and step-dot margin so the flow
   * fits inside a modal. In `full` mode it looks like a standalone page.
   */
  compact?: boolean;
  /**
   * Which source to open first. Default is "sheet"; callers who want the
   * upload step's photo tile hero can pass `initialSource: "photo"`.
   */
  initialSource?: "sheet" | "photo";
  /**
   * Fires when the "dirty" state changes — true once the user has parsed
   * a file and has an unsaved preview loaded. Callers use this to
   * confirm-on-close.
   */
  onDirtyChange?: (dirty: boolean) => void;
}

type Step = 0 | 1 | 2;

/**
 * Self-contained 3-step template import (Upload → Reading → Review).
 * Renders inside the /templates/import full page AND inside the /setup
 * onboarding modal. All parsing, employee-name resolution, preview
 * editing, and confirm-mutation state lives here.
 */
export function TemplateImportFlow({
  onDone,
  onCancel,
  compact,
  onDirtyChange,
}: TemplateImportFlowProps) {
  const { data: restaurant } = useRestaurant();
  const { data: employees = [] } = useEmployees(restaurant?.id);
  const { data: existingRecord } = useShiftTemplates(restaurant?.id);
  const importConfirm = useImportShiftTemplates();
  const saveTemplates = useSaveShiftTemplates();
  const [pendingChoice, setPendingChoice] = useState(false);
  const existingTemplates = existingRecord?.templates ?? [];
  const existingCount = existingTemplates.length;
  const existingKeys = useMemo(
    () => new Set(existingTemplates.map(templateKey)),
    [existingTemplates],
  );

  const [step, setStep] = useState<Step>(0);
  const [source, setSource] = useState<"sheet" | "photo">("sheet");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<PreviewRow[]>([]);

  // Report dirty state to caller (modal uses this to confirm-on-close).
  const dirty = preview.length > 0;
  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  const goSheet = async (file: File) => {
    setSource("sheet");
    setFileName(file.name);
    setStep(1);
    try {
      const { rows: parsed } = await parseScheduleFile(file);
      await sleep(600);
      const rows = buildPreviewRows(parsed, employees);
      setPreview(rows);
      setStep(2);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't read that file",
      );
      setStep(0);
    }
  };

  const goPhoto = async (file: File) => {
    setSource("photo");
    setFileName(file.name);
    // Free-tier Groq caps us around ~60 shift entries per image; a photo
    // covering more than a single week (say a 2-week board) will blow the
    // TPM budget and the request 502s. We can't measure shift count client-
    // side, but very large files are a strong proxy — warn early so the
    // user can crop before we spend the round trip.
    if (file.size > 4 * 1024 * 1024) {
      toast(
        "Large photo — if it covers more than one week the reader may time out. Try cropping to a single week for best results.",
        { icon: "⚠️" },
      );
    }
    setStep(1);
    try {
      const response = await templatesApi.parseImage(file);
      const parsed: ParsedShiftRow[] = response.rows.map((r) => ({
        row_number: r.row_number,
        name: r.name,
        day_of_week: r.day_of_week,
        start_time: r.start_time,
        end_time: r.end_time,
        role: r.role,
        confidence: r.confidence,
        errors: r.errors,
        warnings: r.warnings,
      }));
      const rows = buildPreviewRows(parsed, employees);
      setPreview(rows);
      setStep(2);
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const status = (err as any)?.response?.status;
      if (status === 503) {
        toast.error(
          "Image import isn't available right now — try a spreadsheet instead.",
        );
      } else if (status === 502) {
        toast.error(
          "Couldn't read that photo. If it covers more than one week, try cropping to a single week — the reader has a per-image limit.",
        );
      } else if (status === 400) {
        toast.error("That file doesn't look like an image.");
      } else {
        toast.error(
          err instanceof Error ? err.message : "Couldn't read that photo",
        );
      }
      setStep(0);
    }
  };

  const restart = () => {
    setStep(0);
    setPreview([]);
    setFileName("");
  };

  const handleConfirm = () => {
    if (!restaurant?.id) return;
    const templates = groupIntoTemplates(preview);
    if (templates.length === 0) {
      toast.error("Nothing valid to import — fix the flagged rows first.");
      return;
    }
    // First-time import (no existing templates) just merges — no dialog to
    // show since there's nothing to replace.
    if (existingCount === 0) {
      importConfirm.mutate(
        { restaurant_id: restaurant.id, rows: templates },
        { onSuccess: () => onDone(templates.length) },
      );
      return;
    }
    setPendingChoice(true);
  };

  const commitMerge = () => {
    if (!restaurant?.id) return;
    const templates = groupIntoTemplates(preview);
    importConfirm.mutate(
      { restaurant_id: restaurant.id, rows: templates },
      {
        onSuccess: () => {
          setPendingChoice(false);
          onDone(templates.length);
        },
      },
    );
  };

  const commitReplace = () => {
    if (!restaurant?.id) return;
    const templates = groupIntoTemplates(preview);
    saveTemplates.mutate(
      { restaurant_id: restaurant.id, templates },
      {
        onSuccess: () => {
          setPendingChoice(false);
          onDone(templates.length);
        },
      },
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: compact ? "auto" : "100%",
        paddingTop: compact ? 0 : 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: compact ? 20 : 40,
        }}
      >
        <ImportStepDots step={step} />
      </div>
      <div style={{ flex: 1 }}>
        {step === 0 && (
          <UploadStep
            onSheet={goSheet}
            onPhoto={goPhoto}
            onCancel={onCancel}
            compact={compact}
          />
        )}
        {step === 1 && (
          <ReadingStep source={source} fileName={fileName} />
        )}
        {step === 2 && (
          <PreviewStep
            rows={preview}
            employees={employees}
            onChange={setPreview}
            onBack={restart}
            onSave={handleConfirm}
            isSaving={importConfirm.isPending || saveTemplates.isPending}
            compact={compact}
          />
        )}
      </div>
      {pendingChoice && (
        <ImportChoiceDialog
          existingCount={existingCount}
          incoming={groupIntoTemplates(preview)}
          existingKeys={existingKeys}
          isMerging={importConfirm.isPending}
          isReplacing={saveTemplates.isPending}
          onMerge={commitMerge}
          onReplace={commitReplace}
          onCancel={() => setPendingChoice(false)}
        />
      )}
    </div>
  );
}

/**
 * Identity key for a template. Two templates that agree on (day, start, end,
 * role) are the same slot — count differences are edits, not new templates.
 * Kept out of the shared utils module because this is import-flow-specific
 * heuristic: on the server, templates are pure rows and appending duplicates
 * is legal; we're the ones deciding to warn about it.
 */
function templateKey(t: {
  day_of_week: number;
  start_time: string;
  end_time: string;
  role: string;
}): string {
  return `${t.day_of_week}|${t.start_time}|${t.end_time}|${t.role}`;
}

function ImportChoiceDialog({
  existingCount,
  incoming,
  existingKeys,
  isMerging,
  isReplacing,
  onMerge,
  onReplace,
  onCancel,
}: {
  existingCount: number;
  incoming: Array<{
    day_of_week: number;
    start_time: string;
    end_time: string;
    role: string;
    count: number;
  }>;
  existingKeys: Set<string>;
  isMerging: boolean;
  isReplacing: boolean;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
}) {
  const incomingCount = incoming.length;
  const dupeCount = useMemo(
    () => incoming.filter((t) => existingKeys.has(templateKey(t))).length,
    [incoming, existingKeys],
  );
  const newCount = incomingCount - dupeCount;
  const allDupes = dupeCount === incomingCount && incomingCount > 0;
  const busy = isMerging || isReplacing;
  return (
    <div className="modal-overlay" onClick={busy ? undefined : onCancel}>
      <div
        className="modal-panel"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: 480 }}
      >
        <div style={{ marginBottom: 14 }}>
          <div className="label-md">Before we save</div>
          <div className="headline-md" style={{ marginTop: 4 }}>
            {allDupes
              ? "This import looks redundant"
              : `You already have ${existingCount} template${existingCount === 1 ? "" : "s"}`}
          </div>
          <div
            className="body-sm"
            style={{
              color: "var(--on-surface-muted)",
              marginTop: 8,
            }}
          >
            {allDupes ? (
              <>
                All {incomingCount} template{incomingCount === 1 ? "" : "s"}{" "}
                in this import match one you already have (same day, time and
                role). Adding them again would create duplicate rows in your
                template list.
              </>
            ) : dupeCount > 0 ? (
              <>
                <strong>{newCount}</strong> new · <strong>{dupeCount}</strong>{" "}
                already exist{dupeCount === 1 ? "s" : ""} with the same day,
                time and role. Adding will create duplicates for those{" "}
                {dupeCount}; replacing swaps everything.
              </>
            ) : (
              <>
                The {incomingCount} template{incomingCount === 1 ? "" : "s"}{" "}
                from this import can either be added to your existing set or
                replace everything you have today.
              </>
            )}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            type="button"
            onClick={onMerge}
            disabled={busy}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 12,
              background: "var(--surface-lowest)",
              boxShadow: "inset 0 0 0 1px var(--hairline)",
              border: "none",
              cursor: busy ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="title-sm" style={{ fontSize: 13.5 }}>
                {allDupes
                  ? "Add duplicates anyway"
                  : dupeCount > 0
                    ? `Add all ${incomingCount} (creates ${dupeCount} duplicate${dupeCount === 1 ? "" : "s"})`
                    : "Add to existing"}
              </div>
              <div
                className="body-sm"
                style={{
                  fontSize: 12,
                  color: "var(--on-surface-muted)",
                  marginTop: 2,
                }}
              >
                {allDupes
                  ? "Not recommended — creates identical rows in your template list."
                  : `Keep all ${existingCount} — you'll end up with ${existingCount + incomingCount} templates.`}
              </div>
            </div>
            {isMerging && (
              <span className="label-sm" style={{ fontSize: 10 }}>
                Adding…
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={onReplace}
            disabled={busy}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              textAlign: "left",
              padding: "14px 16px",
              borderRadius: 12,
              background: "var(--surface-lowest)",
              boxShadow: "inset 0 0 0 1.5px var(--tertiary-fixed-dim, #b45309)",
              border: "none",
              cursor: busy ? "wait" : "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ flex: 1 }}>
              <div className="title-sm" style={{ fontSize: 13.5 }}>
                Replace all existing templates
              </div>
              <div
                className="body-sm"
                style={{
                  fontSize: 12,
                  color: "var(--on-surface-muted)",
                  marginTop: 2,
                }}
              >
                Wipe the current {existingCount} and install just these{" "}
                {incomingCount}. Use this when the imported schedule is your
                new source of truth.
              </div>
            </div>
            {isReplacing && (
              <span className="label-sm" style={{ fontSize: 10 }}>
                Replacing…
              </span>
            )}
          </button>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 14 }}>
          <button
            type="button"
            className={allDupes ? "btn btn-primary" : "btn btn-ghost"}
            onClick={onCancel}
            disabled={busy}
          >
            {allDupes ? "Cancel import" : "Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1: Upload ─────────────────────────────────────────── */

function UploadStep({
  onSheet,
  onPhoto,
  onCancel,
  compact,
}: {
  onSheet: (file: File) => void;
  onPhoto: (file: File) => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const sheetInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSheet = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onSheet(file);
  };
  const handlePhoto = (files: FileList | null) => {
    const file = files?.[0];
    if (file) onPhoto(file);
  };

  return (
    <div
      style={{
        maxWidth: compact ? "100%" : 760,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {!compact && (
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div className="display-md">Bring your schedule with you</div>
          <div
            className="body-md"
            style={{ color: "var(--on-surface-muted)", marginTop: 8 }}
          >
            Upload a photo of the whiteboard or a spreadsheet. We'll read
            the names, match them to your team, and turn the patterns into
            templates.
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Photo tile */}
        <button
          type="button"
          onClick={() => photoInputRef.current?.click()}
          style={{
            position: "relative",
            overflow: "hidden",
            textAlign: "left",
            background:
              "linear-gradient(150deg, color-mix(in oklab, var(--accent-fixed) 32%, var(--surface-container)), var(--surface-container) 65%)",
            borderRadius: "var(--r-xl)",
            padding: compact ? "18px 20px 16px" : "26px 28px 22px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            transition: "transform 0.15s ease, box-shadow 0.15s ease",
            border: "none",
            width: "100%",
            cursor: "pointer",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "var(--shadow-lift)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "var(--surface-lowest)",
                boxShadow: "inset 0 0 0 1px var(--hairline)",
                color: "var(--accent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <Sparkles size={17} />
            </div>
            <span
              className="chip"
              style={{
                background: "var(--surface-lowest)",
                fontWeight: 600,
              }}
            >
              New · AI
            </span>
          </div>
          <div
            className={compact ? "title-lg" : "headline-md"}
            style={{ marginTop: 10 }}
          >
            Snap a photo of your old schedule
          </div>
          <div
            className="body-sm"
            style={{ color: "var(--on-surface-muted)", maxWidth: 400 }}
          >
            Whiteboard, printout, even handwriting — point your camera at
            it and Mise en Place turns it into templates.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginTop: 8,
              color: "var(--accent)",
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            Take or upload a photo <ChevronRight size={14} />
          </div>
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: "none" }}
            onChange={(e) => handlePhoto(e.target.files)}
          />
        </button>

        {/* Sheet dropzone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleSheet(e.dataTransfer.files);
          }}
          onClick={() => sheetInputRef.current?.click()}
          style={{
            border: "1.5px dashed var(--outline-variant)",
            borderRadius: "var(--r-xl)",
            padding: "22px 24px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            transition: "background 0.15s",
            background: dragOver
              ? "var(--surface-low)"
              : "transparent",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: "var(--surface-container)",
              color: "var(--on-surface-muted)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Upload size={17} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="title-sm">Or drop a spreadsheet here</div>
            <div
              className="body-sm"
              style={{ color: "var(--on-surface-muted)", fontSize: 12 }}
            >
              .csv or .xlsx · with columns for name, day, and time
            </div>
          </div>
          <span className="chip">Browse</span>
          <input
            ref={sheetInputRef}
            type="file"
            accept=".csv,.xlsx,.xls,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            style={{ display: "none" }}
            onChange={(e) => handleSheet(e.target.files)}
          />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: onCancel ? "space-between" : "center",
          gap: 12,
          marginTop: 20,
        }}
      >
        {onCancel && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            style={{ fontSize: 12.5 }}
          >
            Cancel
          </button>
        )}
        <div
          className="body-sm"
          style={{
            textAlign: "center",
            color: "var(--on-surface-faint)",
            flex: onCancel ? 1 : "initial",
            textAlignLast: "center",
          }}
        >
          Nothing is saved until you review and confirm.
        </div>
        {onCancel && <div style={{ width: 60 }} />}
      </div>
    </div>
  );
}

/* ─── Step 2: Reading ─────────────────────────────────────── */

const READING_MSGS = [
  "Reading your schedule…",
  "Detecting day columns",
  "Recognizing names and times",
  "Matching names to your team",
  "Grouping by role",
];

function ReadingStep({
  source,
  fileName,
}: {
  source: "sheet" | "photo";
  fileName: string;
}) {
  const [msg, setMsg] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      setMsg((m) => Math.min(m + 1, READING_MSGS.length - 1));
    }, 550);
    return () => clearInterval(id);
  }, []);
  return (
    <div
      style={{
        maxWidth: 520,
        margin: "0 auto",
        width: "100%",
        textAlign: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 300,
          margin: "0 auto",
          borderRadius: 14,
          overflow: "hidden",
          background: "var(--surface-lowest)",
          boxShadow: "var(--shadow-lift)",
          padding: "18px 16px",
          transform: "rotate(-1.5deg)",
        }}
      >
        <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: 8,
                borderRadius: 3,
                background: "var(--surface-high)",
              }}
            />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, r) => (
          <div key={r} style={{ display: "flex", gap: 5, marginBottom: 6 }}>
            <div
              style={{
                width: 52,
                height: 14,
                borderRadius: 4,
                background: "var(--surface-container)",
              }}
            />
            {Array.from({ length: 5 }).map((_, c) => (
              <div
                key={c}
                style={{
                  flex: 1,
                  height: 14,
                  borderRadius: 4,
                  background:
                    (r * 5 + c) % 3 === 0
                      ? "color-mix(in oklab, var(--accent-fixed) 45%, var(--surface-container))"
                      : "var(--surface-container)",
                }}
              />
            ))}
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            height: 52,
            top: 0,
            background:
              "linear-gradient(180deg, transparent, color-mix(in oklab, var(--accent-fixed) 35%, transparent) 50%, transparent)",
            borderBottom: "1.5px solid var(--accent)",
            animation: "prepScan 1.8s ease-in-out infinite",
          }}
        />
      </div>

      <div style={{ marginTop: 34 }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span style={{ display: "inline-flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "var(--accent)",
                  animation: `prepPulse 1s ${i * 0.18}s infinite`,
                }}
              />
            ))}
          </span>
          <span
            className="title-md"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {READING_MSGS[msg]}
          </span>
        </div>
        <div
          className="body-sm"
          style={{ color: "var(--on-surface-muted)", marginTop: 10 }}
        >
          {source === "photo"
            ? "Reading your photo — usually under 10 seconds."
            : `Mapping columns from ${fileName}`}
        </div>
      </div>
    </div>
  );
}

/* ─── Step 3: Preview ─────────────────────────────────────── */

function PreviewStep({
  rows,
  employees,
  onChange,
  onBack,
  onSave,
  isSaving,
  compact,
}: {
  rows: PreviewRow[];
  employees: Employee[];
  onChange: (next: PreviewRow[]) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
  compact?: boolean;
}) {
  const validCount = rows.filter((r) => r.is_valid).length;
  const issueCount = rows.length - validCount;
  const templatesCount = useMemo(
    () => groupIntoTemplates(rows).length,
    [rows],
  );

  const update = (key: string, patch: Partial<PreviewRow>) => {
    onChange(
      rows.map((r) => {
        if (r.key !== key) return r;
        const next = { ...r, ...patch };
        const errors = next.errors.filter((e) => {
          if (patch.role !== undefined && /matching employee/.test(e))
            return false;
          if (patch.employeeId !== undefined && /matching employee/.test(e))
            return false;
          return true;
        });
        next.errors = errors;
        next.is_valid =
          errors.length === 0 &&
          !!next.role &&
          !!next.day_of_week &&
          !!next.start_time &&
          !!next.end_time;
        return next;
      }),
    );
  };

  return (
    <div
      style={{
        maxWidth: compact ? "100%" : 900,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="label-md">
            {rows.length} shift{rows.length === 1 ? "" : "s"} parsed ·{" "}
            {templatesCount} template{templatesCount === 1 ? "" : "s"} will be
            created
          </div>
          <div
            className={compact ? "headline-md" : "headline-lg"}
            style={{ marginTop: 4 }}
          >
            Review before saving
          </div>
        </div>
        {issueCount > 0 ? (
          <span
            className="chip"
            style={{
              background: "var(--warning-container)",
              color: "var(--warning)",
              fontWeight: 600,
            }}
          >
            <AlertTriangle size={12} /> {issueCount} to review
          </span>
        ) : (
          <span
            className="chip"
            style={{
              background:
                "color-mix(in oklab, var(--accent-fixed) 55%, var(--surface-high))",
              fontWeight: 600,
            }}
          >
            <Check size={12} /> All clear
          </span>
        )}
      </div>

      <div
        style={{
          background: "var(--surface-container)",
          borderRadius: "var(--r-2xl)",
          padding: "6px 12px 12px",
          maxHeight: compact ? 320 : "none",
          overflowY: compact ? "auto" : "visible",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.8fr 1fr 1.3fr 1.2fr",
            gap: 12,
            padding: "14px 14px 8px",
          }}
        >
          {["Name → Employee", "Day", "Time", "Role"].map((h) => (
            <div key={h} className="label-md">
              {h}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {rows.map((r) => (
            <RowCard
              key={r.key}
              row={r}
              employees={employees}
              onChange={(patch) => update(r.key, patch)}
            />
          ))}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginTop: 18,
        }}
      >
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          <ChevronLeft size={14} /> Start over
        </button>
        <div style={{ flex: 1 }} />
        <span
          className="body-sm"
          style={{ color: "var(--on-surface-muted)" }}
        >
          {issueCount > 0
            ? `${issueCount} row${issueCount === 1 ? "" : "s"} will be skipped unless fixed`
            : "Everything looks good"}
        </span>
        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: "11px 20px", fontSize: 13.5 }}
          onClick={onSave}
          disabled={isSaving || templatesCount === 0}
        >
          <Check size={15} />{" "}
          {isSaving
            ? "Saving…"
            : `Save ${templatesCount} template${templatesCount === 1 ? "" : "s"}`}
        </button>
      </div>
    </div>
  );
}

function RowCard({
  row,
  employees,
  onChange,
}: {
  row: PreviewRow;
  employees: Employee[];
  onChange: (patch: Partial<PreviewRow>) => void;
}) {
  const bad = !row.is_valid;
  const uncertain = row.confidence === "low" && !bad;
  return (
    <div
      style={{
        borderRadius: 12,
        overflow: "hidden",
        background: bad
          ? "color-mix(in oklab, var(--warning-container) 45%, var(--surface-lowest))"
          : uncertain
            ? "color-mix(in oklab, var(--warning-container) 18%, var(--surface-lowest))"
            : "var(--surface-lowest)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.8fr 1fr 1.3fr 1.2fr",
          gap: 12,
          padding: "10px 14px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            className="title-sm"
            style={{ fontSize: 13, marginBottom: 4 }}
          >
            {row.name ?? "—"}
          </div>
          <select
            value={row.employeeId ?? ""}
            onChange={(e) => {
              const empId = e.target.value;
              const emp = employees.find((x) => x.id === empId);
              const role = (emp?.role as PreviewRow["role"]) ?? null;
              onChange({ employeeId: empId || null, role });
            }}
            className="input"
            style={{
              padding: "4px 8px",
              fontSize: 12,
              width: "100%",
              background: "var(--surface-lowest)",
              boxShadow: !row.employeeId
                ? "inset 0 0 0 1.5px var(--warning)"
                : "inset 0 0 0 1px var(--hairline)",
            }}
          >
            <option value="">Unmatched…</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name} · {e.role}
              </option>
            ))}
          </select>
        </div>

        <div className="label-sm" style={{ fontSize: 11 }}>
          {row.day_of_week ? DAY_LABEL[row.day_of_week] : "—"}
        </div>

        <div className="mono" style={{ fontSize: 12.5 }}>
          {row.start_time && row.end_time
            ? `${formatShiftTime(row.start_time)} – ${formatShiftTime(row.end_time)}`
            : "—"}
        </div>

        <div>
          {row.role ? (
            <span
              className="chip"
              style={{ background: "var(--surface-high)" }}
            >
              {row.role}
            </span>
          ) : (
            <select
              className="input"
              style={{
                padding: "4px 8px",
                fontSize: 12,
                background: "var(--surface-lowest)",
                boxShadow: "inset 0 0 0 1.5px var(--warning)",
              }}
              value=""
              onChange={(e) =>
                onChange({ role: (e.target.value as Role) || null })
              }
            >
              <option value="" disabled>
                Pick a role…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {row.errors.length > 0 ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "7px 14px",
            background:
              "color-mix(in oklab, var(--warning-container) 70%, transparent)",
          }}
        >
          <AlertCircle size={13} style={{ color: "var(--warning)" }} />
          <span
            className="body-sm"
            style={{ fontSize: 12, color: "var(--warning)", flex: 1 }}
          >
            {row.errors.join(" · ")}
          </span>
        </div>
      ) : uncertain ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            background:
              "color-mix(in oklab, var(--warning-container) 30%, transparent)",
          }}
        >
          <AlertTriangle size={12} style={{ color: "var(--warning)" }} />
          <span
            className="body-sm"
            style={{ fontSize: 11.5, color: "var(--warning)", flex: 1 }}
          >
            Model was less certain here — worth a quick look
          </span>
        </div>
      ) : null}
    </div>
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
