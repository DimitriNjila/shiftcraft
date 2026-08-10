import { type FormEvent, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Moon, Sun, ArrowRight, MapPin, Copy, Palette, CreditCard } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { supabase } from "@/lib/supabase";
import { usePageMeta } from "@/components/layout/page-meta";

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
  { value: "Australia/Melbourne", label: "Australian Eastern Time – Melbourne" },
];

type Tab = "restaurant" | "templates" | "appearance" | "billing";

const TABS: Array<{ id: Tab; label: string; icon: LucideIcon }> = [
  { id: "restaurant", label: "Restaurant info", icon: MapPin },
  { id: "templates", label: "Shift templates", icon: Copy },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const { data: restaurant, status: restaurantStatus } = useRestaurant();
  const [tab, setTab] = useState<Tab>("restaurant");

  usePageMeta({
    title: "Settings",
    breadcrumbs: ["Settings", TABS.find((t) => t.id === tab)?.label ?? ""],
  });

  if (restaurantStatus === "pending") {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size={28} />
      </div>
    );
  }

  return (
    <div
      className="fade-in mobile-stack"
      style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}
    >
      <aside style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {TABS.map((t) => {
          const Ico = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 10,
                background: active ? "var(--surface-container)" : "transparent",
                color: active ? "var(--on-surface)" : "var(--on-surface-muted)",
                fontSize: 13,
                fontWeight: active ? 600 : 500,
                textAlign: "left",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              <Ico size={16} strokeWidth={active ? 2 : 1.7} />
              {t.label}
            </button>
          );
        })}
      </aside>

      <div style={{ minWidth: 0, maxWidth: 720 }}>
        {tab === "restaurant" && (
          <RestaurantPanel restaurant={restaurant ?? undefined} />
        )}
        {tab === "templates" && <TemplatesPanel />}
        {tab === "appearance" && <AppearancePanel />}
        {tab === "billing" && <BillingPanel />}
      </div>
    </div>
  );
}

/* ─── Restaurant info ─── */

function RestaurantPanel({
  restaurant,
}: {
  restaurant: { id: string; name: string } | undefined;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("America/New_York");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (restaurant) setName(restaurant.name ?? "");
  }, [restaurant]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!restaurant) return;
    if (!name.trim()) return toast.error("Name is required");
    setSaving(true);
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
      setSaving(false);
    }
  }

  return (
    <PanelHeader label="Settings / Restaurant info" title="Restaurant info">
      <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="section" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              htmlFor="cfg-name"
              className="label-md"
              style={{ display: "block", marginBottom: 6 }}
            >
              Restaurant name
            </label>
            <input
              id="cfg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
            <div
              className="label-sm"
              style={{
                marginTop: 6,
                fontSize: 10.5,
                textTransform: "none",
                letterSpacing: "normal",
              }}
            >
              Shown to your team and on shared schedule links.
            </div>
          </div>

          <div>
            <label
              htmlFor="cfg-timezone"
              className="label-md"
              style={{ display: "block", marginBottom: 6 }}
            >
              Timezone
            </label>
            <select
              id="cfg-timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="input"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "Saving…" : "Save info"}
          </button>
        </div>
      </form>
    </PanelHeader>
  );
}

/* ─── Shift templates panel ─── */

function TemplatesPanel() {
  return (
    <PanelHeader label="Settings / Shift templates" title="Shift templates">
      <div
        className="section"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}
      >
        <div>
          <div className="title-md">Recurring shift patterns</div>
          <div
            className="body-sm"
            style={{
              color: "var(--on-surface-muted)",
              marginTop: 4,
              maxWidth: 420,
            }}
          >
            Define the recurring shift patterns your generator uses to auto-fill each new week.
          </div>
        </div>
        <Link
          to="/templates"
          className="btn btn-secondary"
          style={{ textDecoration: "none", flexShrink: 0 }}
        >
          Manage templates <ArrowRight size={14} />
        </Link>
      </div>
    </PanelHeader>
  );
}

/* ─── Appearance panel ─── */

function AppearancePanel() {
  const [dark, setDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <PanelHeader label="Settings / Appearance" title="Appearance">
      <div className="section">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: "var(--surface-high)",
                boxShadow: "inset 0 0 0 1px var(--hairline)",
                display: "grid",
                placeItems: "center",
                color: "var(--on-surface-muted)",
              }}
            >
              {dark ? <Sun size={15} /> : <Moon size={15} />}
            </div>
            <div>
              <div className="title-sm" style={{ fontSize: 13 }}>
                Dark mode
              </div>
              <div
                className="label-sm"
                style={{
                  fontSize: 10.5,
                  textTransform: "none",
                  letterSpacing: "normal",
                }}
              >
                Switch to a darker colour scheme
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDark}
            aria-pressed={dark}
            aria-label="Toggle dark mode"
            style={{
              width: 40,
              height: 22,
              borderRadius: 999,
              background: dark ? "var(--accent)" : "var(--surface-highest)",
              position: "relative",
              transition: "background 0.18s",
              border: "none",
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: dark ? 20 : 2,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                transition: "left 0.18s",
              }}
            />
          </button>
        </div>
      </div>
    </PanelHeader>
  );
}

/* ─── Billing panel ─── */

function BillingPanel() {
  const plan = {
    name: "Professional",
    monthly: 189,
    seatsUsed: 8,
    seatsTotal: 25,
    renews: "May 14, 2026",
  };
  const seatPercent = (plan.seatsUsed / plan.seatsTotal) * 100;

  return (
    <PanelHeader label="Settings / Billing" title="Plan and usage">
      <div
        className="section ink-panel grain"
        style={{
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.1)",
          overflow: "hidden",
          borderRadius: "var(--r-2xl)",
          color: "#f2efe9",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-40px -40px auto auto",
            width: 200,
            height: 200,
            background:
              "radial-gradient(circle, rgba(113,219,166,0.22), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 16,
            }}
          >
            <div>
              <div
                className="label-md"
                style={{ color: "rgba(242,239,233,0.6)" }}
              >
                Current plan
              </div>
              <div
                style={{
                  fontFamily: "'Newsreader', Georgia, serif",
                  fontWeight: 400,
                  fontSize: 34,
                  marginTop: 4,
                  letterSpacing: "-0.01em",
                }}
              >
                {plan.name}
              </div>
              <div
                className="body-sm"
                style={{ color: "rgba(242,239,233,0.65)", marginTop: 4 }}
              >
                Renews {plan.renews}
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flexShrink: 0 }}
              disabled
            >
              Manage plan
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              marginTop: 22,
              paddingTop: 18,
              borderTop: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div>
              <div
                className="label-md"
                style={{ color: "rgba(242,239,233,0.55)" }}
              >
                Seats used
              </div>
              <div
                className="mono"
                style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}
              >
                {plan.seatsUsed} / {plan.seatsTotal}
              </div>
              <div
                style={{
                  height: 4,
                  borderRadius: 2,
                  background: "rgba(255,255,255,0.12)",
                  overflow: "hidden",
                  marginTop: 8,
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${seatPercent}%`,
                    background: "var(--mint)",
                    transition: "width 0.3s",
                  }}
                />
              </div>
            </div>
            <div>
              <div
                className="label-md"
                style={{ color: "rgba(242,239,233,0.55)" }}
              >
                Monthly
              </div>
              <div
                className="mono"
                style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}
              >
                ${plan.monthly}
              </div>
              <div
                className="label-sm"
                style={{
                  color: "rgba(242,239,233,0.5)",
                  marginTop: 8,
                  textTransform: "none",
                  letterSpacing: "normal",
                  fontSize: 10.5,
                }}
              >
                Billed monthly · USD
              </div>
            </div>
            <div>
              <div
                className="label-md"
                style={{ color: "rgba(242,239,233,0.55)" }}
              >
                Payment method
              </div>
              <div
                className="title-md"
                style={{ marginTop: 4, fontSize: 14, color: "#f2efe9" }}
              >
                Visa ···· 4242
              </div>
              <button
                type="button"
                disabled
                style={{
                  marginTop: 6,
                  background: "transparent",
                  border: "none",
                  color: "var(--mint)",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: "inherit",
                }}
              >
                Update card →
              </button>
            </div>
          </div>

          <div
            style={{
              marginTop: 22,
              padding: "12px 14px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: 10,
            }}
          >
            <span
              className="label-sm"
              style={{
                color: "rgba(242,239,233,0.65)",
                textTransform: "none",
                letterSpacing: "normal",
                fontSize: 11.5,
              }}
            >
              Real billing integration ships in a future release. Contact
              support@miseenplace.app for invoicing questions.
            </span>
          </div>
        </div>
      </div>
    </PanelHeader>
  );
}

/* ─── Shared panel header ─── */

function PanelHeader({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <div className="label-md">{label}</div>
        <div className="headline-lg" style={{ marginTop: 4 }}>
          {title}
        </div>
      </div>
      {children}
    </div>
  );
}
