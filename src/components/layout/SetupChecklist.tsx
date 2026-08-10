import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  clearOnboard,
  readOnboard,
  type OnboardState,
  type OnboardStepId,
} from "@/lib/utils/onboarding";

interface ChecklistItem {
  id: OnboardStepId;
  label: string;
  href: string;
}

const ITEMS: ChecklistItem[] = [
  { id: "store", label: "Store details", href: "/setup" },
  { id: "staff", label: "Add your team", href: "/employees" },
  { id: "templates", label: "Shift templates", href: "/templates" },
];

/**
 * Sidebar checklist that appears while the user is mid-setup. Progress
 * only reflects real, completed work — the wizard writes each step on
 * commit, and the schedule / template mutations tick their own step when
 * the API call succeeds. No route-visit heuristics.
 *
 * When every step is ticked the checklist self-clears.
 */
export function SetupChecklist() {
  const [state, setState] = useState<OnboardState | null>(() => readOnboard());
  const navigate = useNavigate();

  // Refresh from localStorage on window focus and via a custom event
  // ('mp:onboard') that mutations dispatch after markStepComplete —
  // keeps the sidebar in sync without a query-key or context wire-up.
  useEffect(() => {
    const sync = () => setState(readOnboard());
    window.addEventListener("focus", sync);
    window.addEventListener("mp:onboard", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("mp:onboard", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  // When every step is done, celebrate briefly then clear.
  useEffect(() => {
    if (!state?.active) return;
    if (state.completed.length === ITEMS.length) {
      const t = setTimeout(() => {
        clearOnboard();
        setState(null);
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [state]);

  if (!state?.active) return null;

  const done = ITEMS.filter((i) => state.completed.includes(i.id)).length;
  const percent = (done / ITEMS.length) * 100;

  const dismiss = () => {
    clearOnboard();
    setState(null);
  };

  return (
    <div
      style={{
        margin: "10px 8px",
        background: "var(--surface-lowest)",
        borderRadius: "var(--r-xl)",
        boxShadow: "inset 0 0 0 1px var(--hairline)",
        padding: "12px 12px 10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="label-md" style={{ fontSize: 10 }}>
          {done === ITEMS.length ? "All set" : "Finishing setup"}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="btn btn-icon btn-ghost"
          style={{ width: 20, height: 20 }}
          title="Dismiss"
          aria-label="Dismiss onboarding checklist"
        >
          <X size={11} />
        </button>
      </div>
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: "var(--surface-high)",
          margin: "8px 0 10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${percent}%`,
            background: "var(--accent)",
            borderRadius: 2,
            transition: "width 0.3s var(--ease)",
          }}
        />
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        {ITEMS.map((item) => {
          const isDone = state.completed.includes(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(item.href)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                cursor: "pointer",
                textAlign: "left",
                padding: 0,
                background: "transparent",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              <span
                style={{
                  width: 15,
                  height: 15,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: isDone ? "var(--ink)" : "transparent",
                  boxShadow: isDone
                    ? "none"
                    : "inset 0 0 0 1.2px var(--hairline-strong)",
                  color: "#8df7c1",
                  flexShrink: 0,
                }}
              >
                {isDone && <Check size={9} />}
              </span>
              <span
                className="body-sm"
                style={{
                  fontSize: 12,
                  color: isDone
                    ? "var(--on-surface-faint)"
                    : "var(--on-surface)",
                  textDecoration: isDone ? "line-through" : "none",
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
