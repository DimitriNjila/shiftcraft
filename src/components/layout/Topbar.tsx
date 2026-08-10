import { Fragment, useEffect, useState } from "react";
import { Search, Moon, Sun, Bell } from "lucide-react";
import { usePageMetaValue } from "./page-meta";

function useTheme(): [string, (t: string) => void] {
  const [theme, setThemeState] = useState<string>(() =>
    typeof document !== "undefined"
      ? document.documentElement.getAttribute("data-theme") || "light"
      : "light",
  );
  const setTheme = (t: string) => {
    setThemeState(t);
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", t);
      try {
        localStorage.setItem("theme", t);
      } catch {
        /* ignore */
      }
    }
  };
  useEffect(() => {
    // Sync in case something else set the attribute
    if (typeof document === "undefined") return;
    const observer = new MutationObserver(() => {
      const t = document.documentElement.getAttribute("data-theme") || "light";
      setThemeState(t);
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);
  return [theme, setTheme];
}

export function Topbar() {
  const { title, eyebrow, breadcrumbs, actions } = usePageMetaValue();
  const [theme, setTheme] = useTheme();

  return (
    <header
      style={{
        padding: "13px 36px",
        background: "var(--bg)",
        boxShadow: "inset 0 -1px var(--hairline)",
        display: "flex",
        alignItems: "center",
        gap: 20,
        flexShrink: 0,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div
            className="label-md"
            style={{ marginBottom: 3, display: "flex", gap: 6 }}
          >
            {breadcrumbs.map((c, i) => (
              <Fragment key={i}>
                <span
                  style={{
                    color:
                      i === breadcrumbs.length - 1
                        ? "var(--on-surface)"
                        : "var(--on-surface-faint)",
                  }}
                >
                  {c}
                </span>
                {i < breadcrumbs.length - 1 && (
                  <span style={{ color: "var(--on-surface-faint)" }}>/</span>
                )}
              </Fragment>
            ))}
          </div>
        )}
        {eyebrow && (
          <div className="label-md" style={{ marginBottom: 3 }}>
            {eyebrow}
          </div>
        )}
        <h1 className="headline-md" style={{ margin: 0, fontSize: 17 }}>
          {title ?? ""}
        </h1>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 10px",
            background: "var(--surface-lowest)",
            boxShadow: "inset 0 0 0 1px var(--hairline-strong)",
            borderRadius: 8,
            minWidth: 210,
            color: "var(--on-surface-faint)",
          }}
        >
          <Search size={14} />
          <input
            placeholder="Search staff, shifts, requests…"
            style={{
              background: "transparent",
              border: "none",
              outline: "none",
              flex: 1,
              fontSize: 12.5,
              color: "var(--on-surface)",
              fontFamily: "inherit",
              minWidth: 0,
            }}
          />
          <kbd
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 10,
              padding: "1px 5px",
              background: "var(--surface-high)",
              borderRadius: 4,
              color: "var(--on-surface-muted)",
            }}
          >
            ⌘K
          </kbd>
        </label>

        <button
          className="btn btn-icon btn-ghost"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
        </button>
        <button
          className="btn btn-icon btn-ghost"
          title="Notifications"
          aria-label="Notifications"
          style={{ position: "relative" }}
        >
          <Bell size={17} />
          <span
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: "var(--tertiary-fixed-dim)",
              boxShadow: "0 0 0 2px var(--bg)",
            }}
          />
        </button>

        {actions}
      </div>
    </header>
  );
}
