import { Check } from "lucide-react";
import { Fragment } from "react";

const STEPS = ["Upload", "Reading", "Review"] as const;

export function ImportStepDots({ step }: { step: 0 | 1 | 2 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {STEPS.map((label, i) => (
        <Fragment key={label}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: 10.5,
                fontWeight: 700,
                fontFamily: "var(--font-label)",
                background:
                  i < step
                    ? "var(--accent)"
                    : i === step
                      ? "var(--surface-lowest)"
                      : "var(--surface-high)",
                color:
                  i < step
                    ? "var(--on-primary)"
                    : i === step
                      ? "var(--accent)"
                      : "var(--on-surface-faint)",
                boxShadow:
                  i === step ? "inset 0 0 0 2px var(--accent)" : "none",
                transition: "all 0.25s",
              }}
            >
              {i < step ? <Check size={11} /> : i + 1}
            </div>
            <span
              className="label-md"
              style={{
                fontSize: 10,
                color:
                  i === step
                    ? "var(--on-surface)"
                    : "var(--on-surface-faint)",
              }}
            >
              {label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div
              style={{
                width: 28,
                height: 1.5,
                borderRadius: 1,
                background:
                  i < step ? "var(--accent)" : "var(--surface-high)",
                transition: "background 0.25s",
              }}
            />
          )}
        </Fragment>
      ))}
    </div>
  );
}
