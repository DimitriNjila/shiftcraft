import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useEmployees } from "@/lib/hooks/use-employees";
import { useImportShiftTemplates } from "@/lib/hooks/use-templates";
import { usePageMeta } from "@/components/layout/page-meta";
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

type Step = 0 | 1 | 2;

export default function ImportTemplatesPage() {
  const navigate = useNavigate();
  const { data: restaurant } = useRestaurant();
  const { data: employees = [] } = useEmployees(restaurant?.id);
  const importConfirm = useImportShiftTemplates();

  const [step, setStep] = useState<Step>(0);
  const [source, setSource] = useState<"sheet" | "photo">("sheet");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<PreviewRow[]>([]);

  usePageMeta({
    title: "Import templates",
    breadcrumbs: ["Templates", "Import"],
    actions: (
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => navigate("/templates")}
      >
        <X size={14} /> Cancel import
      </button>
    ),
  });

  const goSheet = async (file: File) => {
    setSource("sheet");
    setFileName(file.name);
    setStep(1);
    try {
      const { rows: parsed } = await parseScheduleFile(file);
      // Give the "Reading" step a beat so users can see it — even if the
      // parse was instant, this keeps the UI grounded.
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
    setStep(1);
    try {
      const response = await templatesApi.parseImage(file);
      // Map the image parse response to our internal ParsedShiftRow shape
      // (drops fields the CSV path doesn't set, carries role/confidence
      // through so buildPreviewRows can honor them).
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
        toast.error("Image import isn't available right now — try a spreadsheet instead.");
      } else if (status === 502) {
        toast.error("Couldn't read that photo — try a clearer image or a spreadsheet.");
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
    importConfirm.mutate(
      { restaurant_id: restaurant.id, rows: templates },
      { onSuccess: () => navigate("/templates") },
    );
  };

  return (
    <div
      className="fade-in"
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100%",
        paddingTop: 8,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginBottom: 40,
        }}
      >
        <ImportStepDots step={step} />
      </div>
      <div style={{ flex: 1 }}>
        {step === 0 && <UploadStep onSheet={goSheet} onPhoto={goPhoto} />}
        {step === 1 && <ReadingStep source={source} fileName={fileName} />}
        {step === 2 && (
          <PreviewStep
            rows={preview}
            employees={employees}
            onChange={setPreview}
            onBack={restart}
            onSave={handleConfirm}
            isSaving={importConfirm.isPending}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Step 1: Upload ─────────────────────────────────────────── */

function UploadStep({
  onSheet,
  onPhoto,
}: {
  onSheet: (file: File) => void;
  onPhoto: (file: File) => void;
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
    <div style={{ maxWidth: 760, margin: "0 auto", width: "100%" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="display-md">Bring your schedule with you</div>
        <div
          className="body-md"
          style={{ color: "var(--on-surface-muted)", marginTop: 8 }}
        >
          Upload a photo of the whiteboard or a spreadsheet. We'll read the
          names, match them to your team, and turn the patterns into
          templates.
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Photo tile — hero (name-based AI import) */}
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
            padding: "26px 28px 22px",
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
          <div className="headline-md" style={{ marginTop: 10 }}>
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

        {/* Sheet dropzone (also supported) */}
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
        className="body-sm"
        style={{
          textAlign: "center",
          color: "var(--on-surface-faint)",
          marginTop: 20,
        }}
      >
        Nothing is saved until you review and confirm.
      </div>
    </div>
  );
}

/* ─── Step 2: Reading animation ─────────────────────────────── */

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
      {/* Faux document being scanned */}
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
          <div
            key={r}
            style={{ display: "flex", gap: 5, marginBottom: 6 }}
          >
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
          style={{ display: "inline-flex", alignItems: "center", gap: 10 }}
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

/* ─── Step 3: Preview ───────────────────────────────────────── */

function PreviewStep({
  rows,
  employees,
  onChange,
  onBack,
  onSave,
  isSaving,
}: {
  rows: PreviewRow[];
  employees: Employee[];
  onChange: (next: PreviewRow[]) => void;
  onBack: () => void;
  onSave: () => void;
  isSaving: boolean;
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
        // Recompute is_valid + drop matching errors when the manager fixes
        // the row inline (e.g. picks a role or reassigns the employee).
        const errors = next.errors.filter((e) => {
          if (patch.role !== undefined && /matching employee/.test(e))
            return false;
          if (patch.employeeId !== undefined && /matching employee/.test(e))
            return false;
          return true;
        });
        next.errors = errors;
        next.is_valid = errors.length === 0 && !!next.role && !!next.day_of_week && !!next.start_time && !!next.end_time;
        return next;
      }),
    );
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", width: "100%" }}>
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
            {templatesCount} template{templatesCount === 1 ? "" : "s"} will
            be created
          </div>
          <div className="headline-lg" style={{ marginTop: 4 }}>
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
  // Low confidence but otherwise valid = subtle warm tint, not the loud
  // warning-tinted style reserved for actual errors.
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
        {/* Name → employee */}
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

        {/* Day */}
        <div className="label-sm" style={{ fontSize: 11 }}>
          {row.day_of_week ? DAY_LABEL[row.day_of_week] : "—"}
        </div>

        {/* Time */}
        <div className="mono" style={{ fontSize: 12.5 }}>
          {row.start_time && row.end_time
            ? `${formatShiftTime(row.start_time)} – ${formatShiftTime(row.end_time)}`
            : "—"}
        </div>

        {/* Role */}
        <div>
          {row.role ? (
            <span className="chip" style={{ background: "var(--surface-high)" }}>
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

/* ─── helper ─── */
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
