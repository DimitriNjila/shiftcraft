import { type FormEvent, useEffect, useState } from "react";
import { Plus, X } from "lucide-react";

export interface RolesEditorProps {
  value: string[];
  onChange: (roles: string[]) => void;
  onSave?: (roles: string[]) => void;
  isSaving?: boolean;
  /** Hide the explicit Save button when the parent commits on its own schedule. */
  hideSaveButton?: boolean;
  helpText?: string;
}

/**
 * Small, self-contained editor for a restaurant's role list. Case-insensitive
 * dedup mirrors the backend (first casing wins). Refuses to render zero
 * roles — save is disabled until at least one entry survives.
 */
export function RolesEditor({
  value,
  onChange,
  onSave,
  isSaving,
  hideSaveButton,
  helpText,
}: RolesEditorProps) {
  const [draft, setDraft] = useState("");
  const [localRoles, setLocalRoles] = useState<string[]>(value);

  useEffect(() => {
    setLocalRoles(value);
  }, [value]);

  const propagate = (next: string[]) => {
    setLocalRoles(next);
    onChange(next);
  };

  const addRole = (e?: FormEvent) => {
    e?.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    const exists = localRoles.some(
      (r) => r.toLowerCase() === trimmed.toLowerCase(),
    );
    if (exists) {
      setDraft("");
      return;
    }
    propagate([...localRoles, trimmed]);
    setDraft("");
  };

  const removeRole = (role: string) => {
    propagate(localRoles.filter((r) => r !== role));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 6,
          minHeight: 32,
          padding: localRoles.length ? 0 : 8,
        }}
      >
        {localRoles.length === 0 ? (
          <span
            className="body-sm"
            style={{ color: "var(--on-surface-faint)" }}
          >
            No roles yet — add at least one below.
          </span>
        ) : (
          localRoles.map((r) => (
            <span
              key={r}
              className="chip"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "var(--surface-high)",
              }}
            >
              {r}
              <button
                type="button"
                onClick={() => removeRole(r)}
                aria-label={`Remove ${r}`}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--on-surface-muted)",
                  cursor: "pointer",
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
      </div>

      <form
        onSubmit={addRole}
        style={{ display: "flex", gap: 6, alignItems: "center" }}
      >
        <input
          className="input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="e.g. Barista"
          style={{ flex: 1, fontSize: 13 }}
        />
        <button
          type="submit"
          className="btn btn-secondary"
          disabled={!draft.trim()}
          style={{ fontSize: 12.5 }}
        >
          <Plus size={13} /> Add
        </button>
      </form>

      {helpText && (
        <div
          className="body-sm"
          style={{
            color: "var(--on-surface-faint)",
            fontSize: 12,
          }}
        >
          {helpText}
        </div>
      )}

      {!hideSaveButton && onSave && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-primary"
            disabled={isSaving || localRoles.length === 0}
            onClick={() => onSave(localRoles)}
          >
            {isSaving ? "Saving…" : "Save roles"}
          </button>
        </div>
      )}
    </div>
  );
}
