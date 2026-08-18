import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { Search, Moon, Sun, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePageMetaValue } from "./page-meta";
import { useRestaurant } from "@/lib/hooks/use-restaurant";
import { useEmployees } from "@/lib/hooks/use-employees";
import { Avatar } from "@/components/ui/Avatar";

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
        <StaffSearch />

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

/**
 * Global staff search — matches employees by name (case-insensitive) and
 * navigates to their detail page. Cmd/Ctrl-K focuses the input; ↑↓ move
 * through results; Enter jumps to the highlighted one; Esc closes.
 */
function StaffSearch() {
  const navigate = useNavigate();
  const { data: restaurant } = useRestaurant();
  const { data: employees = [] } = useEmployees(restaurant?.id);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [] as typeof employees;
    return employees
      .filter((e) => e.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [employees, query]);

  useEffect(() => {
    setHighlight(0);
  }, [query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const pick = (id: string) => {
    setOpen(false);
    setQuery("");
    inputRef.current?.blur();
    navigate(`/employees/${id}`);
  };

  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!results.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = results[highlight];
      if (target) pick(target.id);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", minWidth: 210 }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "6px 10px",
          background: "var(--surface-lowest)",
          boxShadow: "inset 0 0 0 1px var(--hairline-strong)",
          borderRadius: 8,
          color: "var(--on-surface-faint)",
        }}
      >
        <Search size={14} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onInputKey}
          placeholder="Search staff by name…"
          aria-label="Search staff"
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

      {open && query.trim() && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "var(--surface-lowest)",
            borderRadius: 10,
            boxShadow: "var(--shadow-lift, 0 10px 30px rgba(0,0,0,0.15))",
            border: "1px solid var(--hairline)",
            padding: 4,
            maxHeight: 320,
            overflowY: "auto",
          }}
        >
          {results.length === 0 ? (
            <div
              style={{
                padding: "14px 12px",
                fontSize: 12,
                color: "var(--on-surface-muted)",
                textAlign: "center",
              }}
            >
              No staff match “{query}”
            </div>
          ) : (
            results.map((emp, i) => {
              const isActive = i === highlight;
              return (
                <button
                  key={emp.id}
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(emp.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 10px",
                    borderRadius: 7,
                    background: isActive ? "var(--surface-high)" : "transparent",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "inherit",
                  }}
                >
                  <Avatar name={emp.name} size={26} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="title-sm"
                      style={{
                        fontSize: 12.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {emp.name}
                    </div>
                    <div
                      className="body-sm"
                      style={{
                        fontSize: 11,
                        color: "var(--on-surface-muted)",
                      }}
                    >
                      {emp.role}
                      {!emp.is_active ? " · inactive" : ""}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
