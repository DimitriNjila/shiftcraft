import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { BrandMark } from "@/components/ui/BrandMark";

export interface AuthShellProps {
  children: ReactNode;
  /** Right-hand editorial panel (or any element). */
  side: ReactNode;
  /** Footer links to omit — defaults to all shown. */
  footerLinks?: Array<"terms" | "privacy" | "support">;
}

/**
 * Split-layout shell for /login, /signup, /reset-password.
 * Left = form (with brand + footer), right = editorial panel.
 * Mobile collapses to single column via CSS.
 */
export function AuthShell({
  children,
  side,
  footerLinks = ["terms", "privacy", "support"],
}: AuthShellProps) {
  return (
    <div className="auth-grid">
      {/* Left — form side */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "36px 64px 48px",
          minHeight: "100vh",
          overflowY: "auto",
        }}
      >
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "var(--on-surface)",
            width: "fit-content",
          }}
        >
          <BrandMark size={32} />
          <span
            style={{
              fontFamily: "'Newsreader', Georgia, serif",
              fontStyle: "italic",
              fontWeight: 500,
              fontSize: 17.5,
            }}
          >
            Mise en place
          </span>
        </Link>

        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <div style={{ width: "100%", maxWidth: 400 }}>{children}</div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            color: "var(--on-surface-faint)",
          }}
        >
          <span className="label-sm">© 2026 Mise en Place</span>
          {footerLinks.includes("terms") && (
            <span className="label-sm" style={{ cursor: "pointer" }}>
              Terms
            </span>
          )}
          {footerLinks.includes("privacy") && (
            <span className="label-sm" style={{ cursor: "pointer" }}>
              Privacy
            </span>
          )}
          {footerLinks.includes("support") && (
            <span className="label-sm" style={{ cursor: "pointer" }}>
              Support
            </span>
          )}
        </div>
      </div>

      {/* Right — editorial slot */}
      {side}
    </div>
  );
}
