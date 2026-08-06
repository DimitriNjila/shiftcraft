import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useAuth } from "@/contexts/AuthContext";
import { useSaveShiftTemplates } from "@/lib/hooks/use-templates";
import { supabase } from "@/lib/supabase";
import { TemplateRowEditor } from "@/components/shift-templates/TemplateRowEditor";
import type { ShiftTemplateEntry } from "@/lib/types/template";

// ── Step indicator ────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {[1, 2].map((n) => (
        <div key={n} className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-full grid place-items-center label-md font-bold transition-colors ${
              n === step
                ? "bg-primary text-on-primary"
                : n < step
                  ? "bg-primary-fixed/30 text-primary"
                  : "bg-surface-highest text-on-surface-faint"
            }`}
            style={{ fontSize: 11 }}
          >
            {n}
          </div>
          {n < 2 && (
            <div
              className={`h-px w-8 transition-colors ${n < step ? "bg-primary/40" : "bg-surface-highest"}`}
            />
          )}
        </div>
      ))}
      <span
        className="ml-2 label-md text-on-surface-muted"
        style={{ fontSize: 11 }}
      >
        Step {step} of 2
      </span>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function SetupPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: restaurant } = useRestaurant();
  const saveTemplates = useSaveShiftTemplates();

  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 state
  const [name, setName] = useState(restaurant?.name ?? "");

  // Step 2 state
  const [templates, setTemplates] = useState<ShiftTemplateEntry[]>([]);

  function addTemplate() {
    setTemplates((prev) => [
      ...prev,
      {
        day_of_week: 1,
        role: "Server",
        start_time: "09:00:00",
        end_time: "17:00:00",
        count: 1,
      },
    ]);
  }

  function removeTemplate(i: number) {
    setTemplates((prev) => prev.filter((_, idx) => idx !== i));
  }

  function updateTemplate(i: number, updated: ShiftTemplateEntry) {
    setTemplates((prev) => prev.map((t, idx) => (idx === i ? updated : t)));
  }

  async function completeOnboarding() {
    if (!restaurant) return;
    const { error } = await supabase
      .from("restaurants")
      .update({ onboarding_completed: true })
      .eq("id", restaurant.id);
    if (error) throw error;
    // Optimistically update the cache so OnboardedRoute sees the new value
    // immediately without waiting for a refetch.
    queryClient.setQueryData(["restaurant", user?.id], {
      ...restaurant,
      onboarding_completed: true,
    });
    await queryClient.invalidateQueries({ queryKey: ["restaurant"] });
    navigate("/dashboard", { replace: true });
  }

  async function handleStep1(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!name.trim()) {
      toast.error("Restaurant name is required");
      return;
    }
    setSaving(true);
    try {
      if (restaurant) {
        // Row exists — update name
        const { error } = await supabase
          .from("restaurants")
          .update({ name: name.trim() })
          .eq("id", restaurant.id);
        if (error) throw error;
      } else {
        // No row yet — create one
        const { error } = await supabase
          .from("restaurants")
          .insert({
            name: name.trim(),
            owner_id: user.id,
            onboarding_completed: false,
          });
        if (error) throw error;
      }
      await queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      setStep(2);
    } catch {
      toast.error("Failed to save restaurant name");
    } finally {
      setSaving(false);
    }
  }

  async function handleFinish() {
    if (!restaurant) return;
    setSaving(true);
    try {
      if (templates.length > 0) {
        await saveTemplates.mutateAsync({
          restaurant_id: restaurant.id,
          templates,
        });
      }
      await completeOnboarding();
    } catch {
      toast.error("Failed to complete setup");
      setSaving(false);
    }
  }

  async function handleSkip() {
    setSaving(true);
    try {
      await completeOnboarding();
    } catch {
      toast.error("Failed to complete setup");
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-120">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="brand-logo-mark">S</div>
          <span className="font-display font-bold text-base tracking-[-0.01em]">
            Mise en Place
          </span>
        </div>

        <StepIndicator step={step} />

        {/* ── Step 1: Restaurant name ── */}
        {step === 1 && (
          <form onSubmit={handleStep1} className="flex flex-col gap-4">
            <div>
              <span className="label-md">Welcome</span>
              <h1 className="display-md mt-1.5 mb-2">Name your restaurant</h1>
              <p className="body-md text-on-surface-muted mb-6">
                This is how it'll appear across your schedule and team.
              </p>
            </div>

            <div>
              <label htmlFor="setup-name" className="field-label">
                Restaurant name
              </label>
              <input
                id="setup-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="Meridian Coffee"
                autoFocus
                required
              />
            </div>

            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={saving}
                className="btn btn-primary py-2.5 text-sm"
              >
                {saving ? "Saving…" : "Next →"}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 2: Shift templates ── */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <span className="label-md">Shift templates</span>
              <h1 className="display-md mt-1.5 mb-2">
                Define your typical shifts
              </h1>
              <p className="body-md text-on-surface-muted mb-6">
                Templates let you auto-generate weekly schedules. You can skip
                this and add them later in Settings.
              </p>
            </div>

            {templates.length > 0 && (
              <div className="rounded-xl border border-surface-highest bg-surface px-4">
                {templates.map((t, i) => (
                  <TemplateRowEditor
                    key={i}
                    row={{ ...t, _key: String(i) }}
                    onDelete={() => removeTemplate(i)}
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    onChange={({ _key: _, ...entry }) =>
                      updateTemplate(i, entry)
                    }
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addTemplate}
              className="btn btn-ghost py-2.5 text-sm gap-2 self-start"
            >
              <Plus size={14} />
              Add shift template
            </button>

            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={handleSkip}
                disabled={saving}
                className="btn btn-ghost py-2.5 text-sm"
              >
                {saving ? "Saving…" : "Skip"}
              </button>
              <button
                type="button"
                onClick={handleFinish}
                disabled={saving}
                className="btn btn-primary py-2.5 text-sm"
              >
                {saving ? "Saving…" : "Finish setup"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
