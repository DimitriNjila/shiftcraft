import { type FormEvent, useMemo, useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Camera,
  Upload,
  Copy as LayersIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useAuth } from "@/contexts/AuthContext";
import {
  useEmployees,
  useCreateEmployee,
} from "@/lib/hooks/use-employees";
import { useRoles, useSaveRoles } from "@/lib/hooks/use-roles";
import { RolesEditor } from "@/components/settings/RolesEditor";
import { supabase } from "@/lib/supabase";
import { Avatar } from "@/components/ui/Avatar";
import { BrandMark } from "@/components/ui/BrandMark";
import { TemplateImportFlow } from "@/components/shift-templates/TemplateImportFlow";
import { TemplateScratchBuilder } from "@/components/shift-templates/TemplateScratchBuilder";
import {
  writeOnboard,
  clearOnboard,
} from "@/lib/utils/onboarding";
import type { Employee } from "@/lib/types/employee";

/**
 * The wizard covers the three setup tasks the manager can only do once
 * (store details, team, templates). Generating the first schedule lives
 * in its permanent home under /schedules; the SetupChecklist in the
 * sidebar guides them there and ticks itself once a schedule exists.
 */
const OB_STEPS = [
  { id: "store", label: "Store details", desc: "Name and timezone" },
  { id: "staff", label: "Add your team", desc: "People, roles, wages" },
  { id: "templates", label: "Shift templates", desc: "Import or build" },
] as const;

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific · Los Angeles" },
  { value: "America/Denver", label: "Mountain · Denver" },
  { value: "America/Chicago", label: "Central · Chicago" },
  { value: "America/New_York", label: "Eastern · New York" },
  { value: "Europe/London", label: "GMT · London" },
  { value: "Europe/Paris", label: "CET · Paris" },
];

const DEFAULT_RATES: Record<string, number> = {
  Server: 22,
  Cook: 24,
  Host: 19,
  Manager: 30,
};

const rateFor = (role: string) => DEFAULT_RATES[role] ?? 20;

const AVAIL_PRESETS = [
  "Any time",
  "Mornings",
  "Evenings",
  "Weekends",
  "Weekdays",
] as const;

export default function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: restaurant } = useRestaurant();
  const { data: employees = [] } = useEmployees(restaurant?.id);
  const createEmployee = useCreateEmployee();
  const { data: rolesData } = useRoles(restaurant?.id);
  const saveRoles = useSaveRoles(restaurant?.id);
  const roles = rolesData?.roles ?? [];

  // Step lives in the URL (?step=0..2) so browser back/forward navigate
  // between steps and a refresh keeps you where you were. Router owns
  // the source of truth; `setStep` is a helper that pushes a new URL.
  const [searchParams, setSearchParams] = useSearchParams();
  const rawStep = parseInt(searchParams.get("step") ?? "0", 10);
  const step: 0 | 1 | 2 =
    rawStep === 1 || rawStep === 2 ? rawStep : 0;
  const setStep = (next: 0 | 1 | 2) => {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (next === 0) p.delete("step");
      else p.set("step", String(next));
      return p;
    });
  };

  // The templates step opens a modal with one of two flows: the import
  // flow (photo/sheet) or a lightweight scratch builder. Null when closed.
  const [templateKind, setTemplateKind] = useState<
    "photo" | "sheet" | "scratch" | null
  >(null);

  const initialName = useMemo(
    () =>
      restaurant?.name ??
      (user?.user_metadata?.cafe_name as string | undefined) ??
      "",
    [restaurant, user],
  );
  const [storeName, setStoreName] = useState(initialName);
  const [tz, setTz] = useState(restaurant?.timezone ?? TIMEZONES[0].value);
  const [savingStore, setSavingStore] = useState(false);

  useEffect(() => {
    if (initialName && !storeName) setStoreName(initialName);
    if (restaurant?.timezone) setTz(restaurant.timezone);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialName, restaurant?.timezone]);

  // Step 2 · in-progress team member draft (before Add commits it via API)
  const [draft, setDraft] = useState<{
    name: string;
    role: string;
    rate: number;
    avail: (typeof AVAIL_PRESETS)[number];
  } | null>(null);

  // The list rendered in step 2 comes from the real employees API so any
  // adds land in the roster instantly — no separate "commit at the end" step.

  /* ─── Step handlers ─────────────────────────────────────────── */

  async function handleSaveStore(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!storeName.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    setSavingStore(true);
    try {
      // Flag onboarding done once basic store info is saved. From here the
      // manager can hop between /employees, /templates and /schedules
      // freely; the SetupChecklist in the sidebar tracks the remaining
      // steps as gentle guidance, not a gate.
      if (restaurant) {
        const { error } = await supabase
          .from("restaurants")
          .update({
            name: storeName.trim(),
            timezone: tz,
            setup_started: true,
          })
          .eq("id", restaurant.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("restaurants").insert({
          name: storeName.trim(),
          timezone: tz,
          owner_id: user.id,
          setup_started: true,
        });
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      writeOnboard({
        active: true,
        completed: ["store"],
        store: storeName.trim(),
      });
      setStep(1);
    } catch {
      toast.error("Failed to save restaurant details");
    } finally {
      setSavingStore(false);
    }
  }

  const openDraft = () => {
    const defaultRole = roles[0] ?? "Server";
    setDraft({
      name: "",
      role: defaultRole,
      rate: rateFor(defaultRole),
      avail: "Any time",
    });
  };

  const commitDraft = () => {
    if (!draft?.name.trim() || !restaurant?.id) return;
    createEmployee.mutate(
      {
        name: draft.name.trim(),
        role: draft.role,
        restaurant_id: restaurant.id,
        salary: draft.rate,
        max_hours_per_week: 40,
      },
      { onSuccess: () => setDraft(null) },
    );
  };

  const goStaffNext = () => {
    writeOnboard({
      active: true,
      completed: ["store", "staff"],
      store: storeName || restaurant?.name,
    });
    setStep(2);
  };

  // Templates step: all three sources stay in the wizard. Photo + sheet
  // open the import flow; "scratch" opens the in-modal builder. Either
  // way, saving lands the manager on /schedules.
  const chooseTemplateSource = (
    kind: "photo" | "sheet" | "scratch",
  ) => {
    setTemplateKind(kind);
  };

  const finishWithTemplates = (savedCount: number) => {
    toast.success(
      `Saved ${savedCount} template${savedCount === 1 ? "" : "s"}. Let's compose the week.`,
    );
    setTemplateKind(null);
    writeOnboard({
      active: true,
      completed: ["store", "staff", "templates"],
      store: storeName || restaurant?.name,
    });
    navigate("/schedules", { replace: true });
  };

  const skipTemplates = () => {
    // Skipping still lands them on /schedules — the natural next thing —
    // but leaves "templates" unticked in the sidebar so the guidance
    // still nudges them to come back to it.
    writeOnboard({
      active: true,
      completed: ["store", "staff"],
      store: storeName || restaurant?.name,
    });
    navigate("/schedules", { replace: true });
  };

  const dismissWizard = () => {
    // "Take me in" — end onboarding entirely, no checklist. The manager
    // knows their way around and doesn't want babysitting.
    clearOnboard();
    if (restaurant) {
      supabase
        .from("restaurants")
        .update({ setup_started: true })
        .eq("id", restaurant.id)
        .then(() => {
          queryClient.setQueryData(["restaurant", user?.id], {
            ...restaurant,
            setup_started: true,
          });
          queryClient.invalidateQueries({ queryKey: ["restaurant"] });
        });
    }
    navigate("/dashboard", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "var(--bg)",
      }}
    >
      <ObRail step={step} />
      <div
        className="ob-main"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "36px 64px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          {step > 0 && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep((step - 1) as 0 | 1 | 2)}
              style={{ fontSize: 13 }}
            >
              <ChevronLeft size={14} /> Back
            </button>
          )}
          <button
            type="button"
            className="btn btn-ghost"
            onClick={dismissWizard}
            style={{ fontSize: 13 }}
            title="Skip the guided setup and go straight to the dashboard"
          >
            Take me to the dashboard <ChevronRight size={14} />
          </button>
        </div>

        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          <div
            className="fade-in"
            key={step}
            style={{ width: "100%", maxWidth: 560 }}
          >
            {step === 0 && (
              <StepStore
                name={storeName}
                setName={setStoreName}
                tz={tz}
                setTz={setTz}
                saving={savingStore}
                onSubmit={handleSaveStore}
              />
            )}
            {step === 1 && (
              <StepStaff
                storeName={storeName || restaurant?.name || "your café"}
                employees={employees}
                draft={draft}
                setDraft={setDraft}
                openDraft={openDraft}
                commitDraft={commitDraft}
                isSubmitting={createEmployee.isPending}
                roles={roles}
                onRolesChange={(next) => saveRoles.mutate(next)}
                isSavingRoles={saveRoles.isPending}
                onRemove={() => {
                  /* delete not offered mid-onboarding to keep the flow clean */
                }}
                onContinue={goStaffNext}
              />
            )}
            {step === 2 && (
              <StepTemplates onPick={chooseTemplateSource} onSkip={skipTemplates} />
            )}
          </div>
        </div>

        <div
          className="label-sm"
          style={{ color: "var(--on-surface-faint)" }}
        >
          Everything here can be changed later in Settings.
        </div>
      </div>

      {templateKind && (
        <SetupImportModal
          kind={templateKind}
          onDone={finishWithTemplates}
          onCancel={() => setTemplateKind(null)}
        />
      )}
    </div>
  );
}

/* ─── Import modal — wraps TemplateImportFlow in a dialog panel ─── */

function SetupImportModal({
  kind,
  onDone,
  onCancel,
}: {
  kind: "photo" | "sheet" | "scratch";
  onDone: (n: number) => void;
  onCancel: () => void;
}) {
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(dirty);
  useEffect(() => {
    dirtyRef.current = dirty;
  }, [dirty]);

  // Confirm before discarding unsaved work.
  const tryClose = () => {
    if (
      dirtyRef.current &&
      !window.confirm(
        kind === "scratch"
          ? "You have unsaved templates. Close and discard them?"
          : "You have an unsaved template preview. Close and discard it?",
      )
    ) {
      return;
    }
    onCancel();
  };

  // Trap browser Back: push a phantom history entry on mount, and if the
  // user pops it (i.e. hits Back) treat that as a close request. On any
  // real close we clean up the entry so the app history stays sane.
  useEffect(() => {
    const initial = window.history.length;
    window.history.pushState({ mpModal: "setup-import" }, "");
    const onPop = () => tryClose();
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      // If our phantom entry is still on top, remove it so the user
      // doesn't have to hit Back twice later.
      if (window.history.length > initial) {
        window.history.back();
      }
    };
    // tryClose closes over dirtyRef, no other deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ESC also closes (with the same confirm guard).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") tryClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="modal-overlay" onClick={tryClose}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-import-title"
        style={{
          maxWidth: 780,
          width: "min(92vw, 780px)",
          padding: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div>
            <div className="label-md">Setup · Final step</div>
            <div
              id="setup-import-title"
              className="headline-md"
              style={{ marginTop: 4 }}
            >
              {kind === "scratch"
                ? "Build your templates"
                : "Import your templates"}
            </div>
          </div>
          <button
            type="button"
            className="btn btn-icon btn-ghost"
            onClick={tryClose}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {kind === "scratch" ? (
          <TemplateScratchBuilder
            onDone={onDone}
            onDirtyChange={setDirty}
          />
        ) : (
          <TemplateImportFlow
            onDone={onDone}
            onCancel={tryClose}
            onDirtyChange={setDirty}
            initialSource={kind}
            compact
          />
        )}
      </div>
    </div>
  );
}

/* ─── Left rail with vertical stepper ─── */

function ObRail({ step }: { step: number }) {
  return (
    <div
      className="ob-rail"
      style={{
        width: 300,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        padding: "36px 36px 40px",
        boxShadow: "inset -1px 0 var(--hairline)",
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <BrandMark size={32} />
        <div
          style={{
            fontFamily: "'Newsreader', Georgia, serif",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: 17.5,
          }}
        >
          Mise en place
        </div>
      </div>
      <div
        className="label-md"
        style={{ marginTop: 44, color: "var(--on-surface-faint)" }}
      >
        Setting up
      </div>
      <div
        style={{ display: "flex", flexDirection: "column", marginTop: 14 }}
      >
        {OB_STEPS.map((s, i) => {
          const state = i < step ? "done" : i === step ? "now" : "todo";
          return (
            <div
              key={s.id}
              style={{
                display: "flex",
                gap: 14,
                position: "relative",
                paddingBottom: i < OB_STEPS.length - 1 ? 26 : 0,
              }}
            >
              {i < OB_STEPS.length - 1 && (
                <div
                  style={{
                    position: "absolute",
                    left: 13,
                    top: 30,
                    bottom: 2,
                    width: 1,
                    background:
                      state === "done"
                        ? "var(--accent)"
                        : "var(--hairline-strong)",
                  }}
                />
              )}
              <div
                style={{
                  width: 27,
                  height: 27,
                  borderRadius: "50%",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 12,
                  fontFamily: "var(--font-mono)",
                  background:
                    state === "done"
                      ? "var(--ink)"
                      : state === "now"
                        ? "var(--surface-lowest)"
                        : "transparent",
                  color:
                    state === "done"
                      ? "#8df7c1"
                      : state === "now"
                        ? "var(--on-surface)"
                        : "var(--on-surface-faint)",
                  boxShadow:
                    state === "done"
                      ? "none"
                      : `inset 0 0 0 1.5px ${state === "now" ? "var(--accent)" : "var(--hairline-strong)"}`,
                }}
              >
                {state === "done" ? <Check size={13} /> : i + 1}
              </div>
              <div>
                <div
                  className="title-sm"
                  style={{
                    fontSize: 13.5,
                    color:
                      state === "todo"
                        ? "var(--on-surface-muted)"
                        : "var(--on-surface)",
                  }}
                >
                  {s.label}
                </div>
                <div
                  className="body-sm"
                  style={{
                    fontSize: 12,
                    color: "var(--on-surface-faint)",
                    marginTop: 1,
                  }}
                >
                  {s.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ flex: 1 }} />
      <div
        style={{
          fontFamily: "'Newsreader', Georgia, serif",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--on-surface-muted)",
          lineHeight: 1.45,
        }}
      >
        "Every great service begins before the doors open."
      </div>
    </div>
  );
}

/* ─── Step 1 · Store details ─── */

function StepStore({
  name,
  setName,
  tz,
  setTz,
  saving,
  onSubmit,
}: {
  name: string;
  setName: (n: string) => void;
  tz: string;
  setTz: (v: string) => void;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
}) {
  return (
    <div>
      <div className="label-md" style={{ color: "var(--accent)" }}>
        Step 1 of 3
      </div>
      <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
        First, your restaurant.
      </h1>
      <div
        className="body-md"
        style={{
          color: "var(--on-surface-muted)",
          marginBottom: 26,
          maxWidth: "46ch",
        }}
      >
        This names your workspace and sets the clock every schedule runs on.
      </div>
      <form
        onSubmit={onSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <Field label="Restaurant name">
          <input
            className="input"
            autoFocus
            placeholder="e.g. Meridian Coffee"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label="Timezone">
          <select
            className="input"
            value={tz}
            onChange={(e) => setTz(e.target.value)}
          >
            {TIMEZONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </Field>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={!name.trim() || saving}
          style={{
            justifyContent: "center",
            padding: "11px 18px",
            fontSize: 14,
            marginTop: 8,
          }}
        >
          {saving ? "Saving…" : "Continue"}{" "}
          {!saving && <ChevronRight size={15} />}
        </button>
      </form>
    </div>
  );
}

/* ─── Step 2 · Team ─── */

function StepStaff({
  storeName,
  employees,
  draft,
  setDraft,
  openDraft,
  commitDraft,
  isSubmitting,
  roles,
  onRolesChange,
  isSavingRoles,
  onContinue,
}: {
  storeName: string;
  employees: Employee[];
  draft: {
    name: string;
    role: string;
    rate: number;
    avail: (typeof AVAIL_PRESETS)[number];
  } | null;
  setDraft: (
    d: {
      name: string;
      role: string;
      rate: number;
      avail: (typeof AVAIL_PRESETS)[number];
    } | null,
  ) => void;
  openDraft: () => void;
  commitDraft: () => void;
  isSubmitting: boolean;
  roles: string[];
  onRolesChange: (roles: string[]) => void;
  isSavingRoles: boolean;
  onRemove: (id: string) => void;
  onContinue: () => void;
}) {
  return (
    <div>
      <div className="label-md" style={{ color: "var(--accent)" }}>
        Step 2 of 3
      </div>
      <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
        Who works at {storeName}?
      </h1>
      <div
        className="body-md"
        style={{
          color: "var(--on-surface-muted)",
          marginBottom: 22,
          maxWidth: "48ch",
        }}
      >
        Add a few people to start. Availability is optional here — you can
        fine-tune it later from the Staff page.
      </div>

      <div
        style={{
          background: "var(--surface-lowest)",
          borderRadius: "var(--r-xl)",
          boxShadow: "inset 0 0 0 1px var(--hairline)",
          padding: "14px 16px",
          marginBottom: 14,
        }}
      >
        <div className="label-md">Your roles</div>
        <div
          className="body-sm"
          style={{
            color: "var(--on-surface-muted)",
            marginTop: 2,
            marginBottom: 10,
            fontSize: 12,
          }}
        >
          Only roles listed here can be assigned when you add someone. Edit
          any time from Settings.
        </div>
        <RolesEditorSection
          value={roles}
          onSave={onRolesChange}
          isSaving={isSavingRoles}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {employees.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              background: "var(--surface-lowest)",
              borderRadius: "var(--r-xl)",
              boxShadow: "inset 0 0 0 1px var(--hairline)",
              padding: "10px 14px",
            }}
          >
            <Avatar name={m.name} size={30} />
            <div style={{ flex: 1 }}>
              <div className="title-sm" style={{ fontSize: 13 }}>
                {m.name}
              </div>
              <div
                className="body-sm"
                style={{
                  fontSize: 11.5,
                  color: "var(--on-surface-muted)",
                }}
              >
                {m.role} · ${m.salary}/hr
              </div>
            </div>
            <span
              className="chip"
              style={{
                background:
                  "color-mix(in oklab, var(--accent-fixed) 50%, var(--surface-high))",
              }}
            >
              <Check size={10} /> Added
            </span>
          </div>
        ))}

        {draft ? (
          <div
            style={{
              background: "var(--surface-lowest)",
              borderRadius: "var(--r-xl)",
              boxShadow: "inset 0 0 0 1.5px var(--accent)",
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.4fr 1fr 0.7fr",
                gap: 10,
              }}
            >
              <Field label="Name">
                <input
                  className="input"
                  autoFocus
                  placeholder="Full name"
                  value={draft.name}
                  onChange={(e) =>
                    setDraft({ ...draft, name: e.target.value })
                  }
                  onKeyDown={(e) => e.key === "Enter" && commitDraft()}
                />
              </Field>
              <Field label="Role">
                <select
                  className="input"
                  value={draft.role}
                  onChange={(e) => {
                    const role = e.target.value;
                    setDraft({
                      ...draft,
                      role,
                      rate: DEFAULT_RATES[role] ?? draft.rate,
                    });
                  }}
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="$/hr">
                <input
                  className="input mono"
                  type="number"
                  min={1}
                  value={draft.rate}
                  onChange={(e) =>
                    setDraft({ ...draft, rate: +e.target.value })
                  }
                />
              </Field>
            </div>
            <Field label="Availability" optional>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {AVAIL_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => setDraft({ ...draft, avail: p })}
                    className="chip"
                    style={{
                      cursor: "pointer",
                      background:
                        draft.avail === p
                          ? "var(--ink)"
                          : "var(--surface-high)",
                      color:
                        draft.avail === p
                          ? "var(--on-ink)"
                          : "var(--on-surface)",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </Field>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                type="button"
                className="btn btn-primary"
                disabled={!draft.name.trim() || isSubmitting}
                onClick={commitDraft}
                style={{ fontSize: 13 }}
              >
                <Check size={14} />{" "}
                {isSubmitting
                  ? "Adding…"
                  : `Add ${draft.name.split(" ")[0] || "person"}`}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDraft(null)}
                style={{ fontSize: 13 }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={openDraft}
            style={{
              justifyContent: "center",
              padding: "11px 18px",
              fontSize: 13.5,
              borderStyle: "dashed",
            }}
          >
            <Plus size={15} /> Add a team member
          </button>
        )}
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginTop: 22,
        }}
      >
        <button
          type="button"
          className="btn btn-primary"
          onClick={onContinue}
          disabled={employees.length === 0}
          style={{ padding: "11px 18px", fontSize: 14 }}
        >
          Continue with {employees.length || "no"}{" "}
          {employees.length === 1 ? "person" : "people"}{" "}
          <ChevronRight size={15} />
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onContinue}
          style={{ fontSize: 13 }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

/* ─── Step 3 · Templates chooser ─── */

function StepTemplates({
  onPick,
  onSkip,
}: {
  onPick: (kind: "photo" | "sheet" | "scratch") => void;
  onSkip: () => void;
}) {
  const options: Array<{
    icon: React.ReactNode;
    title: string;
    sub: string;
    kind: "photo" | "sheet" | "scratch";
  }> = [
    {
      icon: <Camera size={17} />,
      title: "Photograph the whiteboard",
      sub: "Snap your current schedule and we read the shifts out of it.",
      kind: "photo",
    },
    {
      icon: <Upload size={17} />,
      title: "Import a spreadsheet",
      sub: "CSV or Excel. Columns for name, day, start, end.",
      kind: "sheet",
    },
    {
      icon: <LayersIcon size={17} />,
      title: "Start from scratch",
      sub: "Build templates by hand on the Templates page.",
      kind: "scratch",
    },
  ];
  return (
    <div>
      <div className="label-md" style={{ color: "var(--accent)" }}>
        Step 3 of 3
      </div>
      <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
        Bring in your shift templates.
      </h1>
      <div
        className="body-md"
        style={{
          color: "var(--on-surface-muted)",
          marginBottom: 24,
          maxWidth: "48ch",
        }}
      >
        Templates are the shifts you run every week — opening barista,
        weekend close. Mise en place drafts your schedule from them.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {options.map((o) => (
          <button
            key={o.kind}
            type="button"
            onClick={() => onPick(o.kind)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              textAlign: "left",
              background: "var(--surface-lowest)",
              borderRadius: "var(--r-xl)",
              boxShadow: "inset 0 0 0 1px var(--hairline)",
              padding: "15px 16px",
              cursor: "pointer",
              transition: "box-shadow 0.15s, transform 0.15s",
              border: "none",
              width: "100%",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow =
                "inset 0 0 0 1.5px var(--accent)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow =
                "inset 0 0 0 1px var(--hairline)";
              e.currentTarget.style.transform = "none";
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 11,
                background: "var(--surface-high)",
                boxShadow: "inset 0 0 0 1px var(--hairline)",
                display: "grid",
                placeItems: "center",
                color: "var(--accent)",
                flexShrink: 0,
              }}
            >
              {o.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div className="title-sm" style={{ fontSize: 13.5 }}>
                {o.title}
              </div>
              <div
                className="body-sm"
                style={{
                  fontSize: 12,
                  color: "var(--on-surface-muted)",
                  marginTop: 2,
                }}
              >
                {o.sub}
              </div>
            </div>
            <ChevronRight
              size={16}
              style={{ color: "var(--on-surface-faint)" }}
            />
          </button>
        ))}
      </div>
      <button
        type="button"
        className="btn btn-ghost"
        onClick={onSkip}
        style={{ fontSize: 13, marginTop: 18 }}
      >
        Skip, I'll do this later
      </button>
    </div>
  );
}

/* ─── Onboarding roles section — local draft with explicit save ─── */

function RolesEditorSection({
  value,
  onSave,
  isSaving,
}: {
  value: string[];
  onSave: (roles: string[]) => void;
  isSaving: boolean;
}) {
  const [draft, setDraft] = useState<string[]>(value);
  useEffect(() => setDraft(value), [value]);
  const dirty =
    draft.length !== value.length ||
    draft.some((r, i) => r !== value[i]);

  return (
    <div>
      <RolesEditor value={draft} onChange={setDraft} hideSaveButton />
      {dirty && (
        <div style={{ marginTop: 10, display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={isSaving || draft.length === 0}
            onClick={() => onSave(draft)}
            style={{ fontSize: 12.5 }}
          >
            {isSaving ? "Saving…" : "Save roles"}
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Shared label wrapper ─── */

function Field({
  label,
  children,
  optional,
}: {
  label: string;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div>
      <label
        className="label-md"
        style={{ display: "block", marginBottom: 6 }}
      >
        {label}
        {optional && (
          <span
            style={{
              color: "var(--on-surface-faint)",
              fontWeight: 400,
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            {" "}
            · optional
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

