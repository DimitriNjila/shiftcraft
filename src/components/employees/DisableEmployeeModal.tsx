import { useState } from "react";
import { AlertTriangle, Ban, Trash2, X, EyeOff } from "lucide-react";
import type { Employee } from "@/lib/types/employee";

/**
 * Two-tier destructive action for an employee: **Disable** (soft, reversible)
 * is the default, **Delete permanently** is a secondary link that upgrades the
 * modal. If the hard delete returns 409 (has shift history), the modal flips
 * to the "blocked" state and routes the manager back to Disable.
 *
 * The three states share one modal container so the transition feels like a
 * conversation with the user, not a chain of separate popups.
 */
export type DisableModalMode = "disable" | "delete" | "delete-blocked";

export interface DisableEmployeeModalProps {
  employee: Employee;
  mode: DisableModalMode;
  isPending: boolean;
  /** Called when the user confirms in the current mode. */
  onDisable: () => void;
  onDelete: () => void;
  /** Called by the "Delete permanently instead" link inside disable mode. */
  onSwitchToDelete: () => void;
  onCancel: () => void;
}

export function DisableEmployeeModal({
  employee,
  mode,
  isPending,
  onDisable,
  onDelete,
  onSwitchToDelete,
  onCancel,
}: DisableEmployeeModalProps) {
  const [hasShifts, setHasShifts] = useState(false);

  // The parent flips mode to `delete-blocked` on 409 → we track it locally too
  // so the "This employee has shift history" phrasing sticks even if the
  // parent's mode momentarily bounces back.
  if (mode === "delete-blocked" && !hasShifts) setHasShifts(true);

  if (mode === "delete-blocked") {
    return (
      <Shell onCancel={onCancel} title="Can't delete — has shift history">
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <IconBadge tint="warning">
            <AlertTriangle size={16} />
          </IconBadge>
          <p
            className="body-md"
            style={{
              color: "var(--on-surface-muted)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            <strong style={{ color: "var(--on-surface)" }}>
              {employee.name}
            </strong>{" "}
            has been on the schedule, so we can't permanently delete their
            record without losing shift history. Disable them instead — they
            stay in the roster but no longer show up on schedules, and you
            can re-enable them anytime.
          </p>
        </div>
        <Actions>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            Never mind
          </button>
          <button
            type="button"
            onClick={onDisable}
            className="btn btn-primary"
            style={{ flex: 1, justifyContent: "center" }}
            disabled={isPending}
          >
            <EyeOff size={14} />
            {isPending ? "Disabling…" : "Disable instead"}
          </button>
        </Actions>
      </Shell>
    );
  }

  if (mode === "delete") {
    return (
      <Shell onCancel={onCancel} title={`Delete ${employee.name}?`}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <IconBadge tint="danger">
            <Trash2 size={16} />
          </IconBadge>
          <p
            className="body-md"
            style={{
              color: "var(--on-surface-muted)",
              margin: 0,
              lineHeight: 1.55,
            }}
          >
            This permanently removes {employee.name} and their availability
            windows from the roster. Only use this for duplicate entries or
            people who were never scheduled — <strong>it can't be undone</strong>.
          </p>
        </div>
        <Actions>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            style={{ flex: 1, justifyContent: "center" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="btn btn-danger"
            style={{ flex: 1, justifyContent: "center" }}
            disabled={isPending}
          >
            <Trash2 size={14} />
            {isPending ? "Deleting…" : "Delete permanently"}
          </button>
        </Actions>
      </Shell>
    );
  }

  // Default: `disable`
  return (
    <Shell onCancel={onCancel} title={`Disable ${employee.name}?`}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <IconBadge tint="neutral">
          <Ban size={16} />
        </IconBadge>
        <p
          className="body-md"
          style={{
            color: "var(--on-surface-muted)",
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          They'll stop showing up on new schedules but stay in your roster
          with their history intact. You can re-enable them anytime.
        </p>
      </div>
      <Actions>
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
          style={{ flex: 1, justifyContent: "center" }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onDisable}
          className="btn btn-primary"
          style={{ flex: 1, justifyContent: "center" }}
          disabled={isPending}
        >
          <EyeOff size={14} />
          {isPending ? "Disabling…" : "Disable"}
        </button>
      </Actions>
      <div
        style={{
          textAlign: "center",
          marginTop: 14,
          paddingTop: 14,
          borderTop: "1px solid var(--hairline)",
        }}
      >
        <button
          type="button"
          onClick={onSwitchToDelete}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "var(--on-surface-muted)",
            fontSize: 12,
            fontFamily: "inherit",
            textDecoration: "underline",
            textUnderlineOffset: 2,
          }}
        >
          Delete permanently instead
        </button>
      </div>
    </Shell>
  );
}

/* ─── Presentation helpers ─── */

function Shell({
  title,
  onCancel,
  children,
}: {
  title: string;
  onCancel: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{ maxWidth: 440 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <h2 className="headline-md" style={{ margin: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-icon btn-ghost"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function IconBadge({
  tint,
  children,
}: {
  tint: "neutral" | "warning" | "danger";
  children: React.ReactNode;
}) {
  const bg =
    tint === "danger"
      ? "var(--tertiary-fixed)"
      : tint === "warning"
        ? "var(--warning-container)"
        : "var(--surface-high)";
  const fg =
    tint === "danger"
      ? "#8b1d18"
      : tint === "warning"
        ? "var(--warning)"
        : "var(--on-surface-muted)";
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 11,
        background: bg,
        color: fg,
        display: "grid",
        placeItems: "center",
        flexShrink: 0,
      }}
    >
      {children}
    </div>
  );
}

function Actions({ children }: { children: React.ReactNode }) {
  return <div style={{ display: "flex", gap: 8 }}>{children}</div>;
}
