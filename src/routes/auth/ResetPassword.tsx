import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ChevronRight, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { EditorialPanel } from "@/components/auth/EditorialPanel";

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to send reset email",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell side={<EditorialPanel variant="support" />}>
      {sent ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background:
                "color-mix(in oklab, var(--accent-fixed) 55%, var(--surface-high))",
              display: "grid",
              placeItems: "center",
              marginBottom: 20,
            }}
          >
            <MailCheck size={22} style={{ color: "var(--accent)" }} />
          </div>
          <div className="label-md">Check your inbox</div>
          <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
            Email sent.
          </h1>
          <p
            className="body-md"
            style={{
              color: "var(--on-surface-muted)",
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            We sent a password reset link to{" "}
            <span style={{ fontWeight: 600, color: "var(--on-surface)" }}>
              {email}
            </span>
            . The link expires in 60 minutes.
          </p>
          <p
            className="body-sm"
            style={{ color: "var(--on-surface-muted)", marginBottom: 20 }}
          >
            Didn’t receive it? Check spam, or{" "}
            <button
              type="button"
              onClick={() => setSent(false)}
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              try again
            </button>
            .
          </p>
          <Link
            to="/login"
            className="body-sm"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              color: "var(--accent)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            <ArrowLeft size={14} />
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className="label-md">Password reset</div>
          <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
            Forgot your password?
          </h1>
          <p
            className="body-md"
            style={{ color: "var(--on-surface-muted)", marginBottom: 28 }}
          >
            Enter your work email and we’ll send you a reset link.
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 14 }}
          >
            <div>
              <label
                htmlFor="email"
                className="label-md"
                style={{ display: "block", marginBottom: 6 }}
              >
                Work email
              </label>
              <div style={{ position: "relative" }}>
                <Mail
                  size={15}
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--on-surface-faint)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 36 }}
                  placeholder="you@cafe.com"
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                justifyContent: "center",
                padding: "12px 14px",
                fontSize: 14,
                marginTop: 10,
              }}
            >
              {loading ? "Sending…" : "Send reset link"}
              {!loading && <ChevronRight size={15} />}
            </button>
          </form>

          <p
            className="body-sm"
            style={{
              textAlign: "center",
              marginTop: 22,
              color: "var(--on-surface-muted)",
            }}
          >
            Remember your password?{" "}
            <Link
              to="/login"
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
