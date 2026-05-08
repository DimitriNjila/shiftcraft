import { type FormEvent, useState, useEffect } from "react";
import { Moon, Plus } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import {
  useShiftTemplates,
  useSaveShiftTemplates,
} from "@/lib/hooks/use-templates";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { TemplateRowEditor } from "@/components/shift-templates/TemplateRowEditor";
import { supabase } from "@/lib/supabase";
import type { ShiftTemplateEntry } from "@/lib/types/template";

// ── Constants ─────────────────────────────────────────────────

const TIMEZONES = [
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "America/Anchorage", label: "Alaska Time" },
  { value: "Pacific/Honolulu", label: "Hawaii Time" },
  { value: "America/Toronto", label: "Eastern Time – Toronto" },
  { value: "America/Vancouver", label: "Pacific Time – Vancouver" },
  { value: "Europe/London", label: "GMT / London" },
  { value: "Europe/Paris", label: "Central European Time (CET)" },
  { value: "Europe/Berlin", label: "Central European Time – Berlin" },
  { value: "Europe/Amsterdam", label: "Central European Time – Amsterdam" },
  { value: "Africa/Johannesburg", label: "South Africa Standard Time" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (GST)" },
  { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
  { value: "Australia/Sydney", label: "Australian Eastern Time" },
  {
    value: "Australia/Melbourne",
    label: "Australian Eastern Time – Melbourne",
  },
];

// ── Page ─────────────────────────────────────────────────────

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: restaurant, status: restaurantStatus } = useRestaurant();
  const { data: templateRecord, status: templatesStatus } = useShiftTemplates(
    restaurant?.id,
  );
  const saveTemplates = useSaveShiftTemplates();

  // Restaurant info state
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [savingInfo, setSavingInfo] = useState(false);

  // Templates state
  const [templates, setTemplates] = useState<ShiftTemplateEntry[]>([]);
  const [savingTemplates, setSavingTemplates] = useState(false);

  // Dark mode state
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  // Sync restaurant info from server
  useEffect(() => {
    if (restaurantStatus === "success" && restaurant) {
      setName(restaurant.name ?? "");
    }
  }, [restaurantStatus, restaurant]);

  // Sync templates from server
  useEffect(() => {
    if (templatesStatus === "success") {
      setTemplates(templateRecord?.templates ?? []);
    }
  }, [templatesStatus, templateRecord]);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", next ? "dark" : "light");
  }

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

  async function handleSaveInfo(e: FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSavingInfo(true);
    try {
      const { error } = await supabase
        .from("restaurants")
        .update({ name: name.trim() })
        .eq("id", restaurant.id);
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["restaurant"] });
      toast.success("Settings saved");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSavingInfo(false);
    }
  }

  async function handleSaveTemplates() {
    if (!restaurant) return;
    setSavingTemplates(true);
    try {
      await saveTemplates.mutateAsync({
        restaurant_id: restaurant.id,
        templates,
      });
    } finally {
      setSavingTemplates(false);
    }
  }

  const isLoading =
    restaurantStatus === "pending" || templatesStatus === "pending";

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div>
          <span className="label-md">Configuration</span>
          <h1 className="headline-lg mt-1.5">Settings</h1>
        </div>
      </div>

      <div className="max-w-xl flex flex-col gap-8">
        {/* ── Restaurant info ── */}
        <form onSubmit={handleSaveInfo} className="card flex flex-col gap-4">
          <h2 className="title-md">Restaurant info</h2>

          <div>
            <label htmlFor="cfg-name" className="field-label">
              Name
            </label>
            <input
              id="cfg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label htmlFor="cfg-timezone" className="field-label">
              Timezone
            </label>
            <select
              id="cfg-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input-field"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingInfo}
              className="btn btn-primary py-2.5 text-sm"
            >
              {savingInfo ? "Saving…" : "Save info"}
            </button>
          </div>
        </form>

        {/* ── Shift templates ── */}
        <div className="card flex flex-col gap-4">
          <h2 className="title-md">Shift templates</h2>
          <p className="body-sm text-on-surface-muted">
            Templates define the recurring shifts used to auto-generate your
            weekly schedule.
          </p>

          {templates.length > 0 && (
            <div className="rounded-xl border border-surface-highest bg-surface px-4">
              {templates.map((t, i) => (
                <TemplateRowEditor
                  key={i}
                  entry={t}
                  onRemove={() => removeTemplate(i)}
                  onChange={(updated) => updateTemplate(i, updated)}
                />
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={addTemplate}
            className="btn btn-ghost py-2 text-sm gap-2 self-start"
          >
            <Plus size={14} />
            Add shift template
          </button>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveTemplates}
              disabled={savingTemplates}
              className="btn btn-primary py-2.5 text-sm"
            >
              {savingTemplates ? "Saving…" : "Save templates"}
            </button>
          </div>
        </div>

        {/* ── Appearance ── */}
        <div className="card flex flex-col gap-4">
          <h2 className="title-md">Appearance</h2>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon size={16} className="text-on-surface-muted" />
              <div>
                <p className="body-sm font-semibold">Dark mode</p>
                <p
                  className="label-md text-on-surface-muted"
                  style={{ fontSize: 11 }}
                >
                  Switch to a darker colour scheme
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={toggleDark}
              className={`relative shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer ${
                dark ? "bg-primary" : "bg-surface-highest"
              }`}
              role="switch"
              aria-checked={dark}
              aria-label="Toggle dark mode"
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  dark ? "left-5.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
