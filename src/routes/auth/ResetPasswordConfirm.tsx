import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ChevronRight, Check, X, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { getPasswordCriteria, getPasswordStrength } from "@/routes/auth/Signup";
import { AuthShell } from "@/components/auth/AuthShell";
import { EditorialPanel } from "@/components/auth/EditorialPanel";

const CRITERIA_LABELS = [
  { key: "length" as const, label: "10+ chars" },
  { key: "uppercase" as const, label: "A–Z" },
  { key: "lowercase" as const, label: "a–z" },
  { key: "number" as const, label: "0–9" },
  { key: "special" as const, label: "!@#…" },
];

function strengthColor(strength: number): string {
  if (strength <= 1) return "var(--tertiary-fixed-dim)";
  if (strength === 2) return "var(--warning)";
  if (strength === 3) return "var(--accent-fixed-dim)";
  return "var(--accent)";
}

export default function ResetPasswordConfirmPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    const timeout = setTimeout(() => {
      setExpired((prev) => (prev ? prev : !ready));
    }, 5000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const c = getPasswordCriteria(password);
    if (!c.length) return toast.error("Password must be at least 10 characters");
    if (!c.uppercase) return toast.error("Password must contain an uppercase letter");
    if (!c.lowercase) return toast.error("Password must contain a lowercase letter");
    if (!c.number) return toast.error("Password must contain a number");
    if (!c.special) return toast.error("Password must contain a special character");
    if (password !== confirm) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      await updatePassword(password);
      toast.success("Password updated! Please sign in.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update password",
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);
  const criteria = getPasswordCriteria(password);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  return (
    <AuthShell side={<EditorialPanel variant="support" />}>
      {expired && !ready ? (
        <>
          <div className="label-md">Link expired</div>
          <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
            This link has expired.
          </h1>
          <p
            className="body-md"
            style={{
              color: "var(--on-surface-muted)",
              marginBottom: 28,
              lineHeight: 1.6,
            }}
          >
            Password reset links are single-use and expire after 60 minutes.
            Request a new one to continue.
          </p>
          <Link
            to="/reset-password"
            className="btn btn-primary"
            style={{
              display: "inline-flex",
              justifyContent: "center",
              padding: "12px 14px",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            Request new link
            <ChevronRight size={15} />
          </Link>
        </>
      ) : !ready ? (
        <>
          <div className="label-md">Verifying link…</div>
          <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
            One moment.
          </h1>
          <p className="body-md" style={{ color: "var(--on-surface-muted)" }}>
            Verifying your reset link.
          </p>
        </>
      ) : (
        <>
          <div className="label-md">Password reset</div>
          <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
            Set a new password.
          </h1>
          <p
            className="body-md"
            style={{ color: "var(--on-surface-muted)", marginBottom: 28 }}
          >
            Choose a strong password for your Mise en Place account.
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label
                htmlFor="password"
                className="label-md"
                style={{ display: "block", marginBottom: 6 }}
              >
                New password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
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
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input"
                  style={{ paddingLeft: 36, paddingRight: 36 }}
                  placeholder="At least 10 characters"
                  autoComplete="new-password"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--on-surface-faint)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 4,
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>

              {/* Strength meter */}
              <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    style={{
                      flex: 1,
                      height: 3,
                      borderRadius: 2,
                      background:
                        strength >= level
                          ? strengthColor(strength)
                          : "var(--surface-highest)",
                      transition: "background 0.2s",
                    }}
                  />
                ))}
              </div>

              {password.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginTop: 8,
                  }}
                >
                  {CRITERIA_LABELS.map(({ key, label }) => (
                    <span
                      key={key}
                      className="chip"
                      style={{
                        background: criteria[key]
                          ? "color-mix(in oklab, var(--accent-fixed) 55%, var(--surface-high))"
                          : "var(--surface-highest)",
                        color: criteria[key]
                          ? "var(--on-surface)"
                          : "var(--on-surface-faint)",
                      }}
                    >
                      {criteria[key] ? (
                        <Check size={9} strokeWidth={2.5} />
                      ) : (
                        <X size={9} strokeWidth={2.5} />
                      )}
                      {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="label-md"
                style={{ display: "block", marginBottom: 6 }}
              >
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <Lock
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
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="input"
                  style={{
                    paddingLeft: 36,
                    paddingRight: 36,
                    boxShadow: passwordsMismatch
                      ? "inset 0 0 0 1.5px var(--tertiary-fixed-dim), 0 1px 2px rgba(28,27,27,0.03)"
                      : passwordsMatch
                        ? "inset 0 0 0 1.5px var(--accent), 0 1px 2px rgba(28,27,27,0.03)"
                        : undefined,
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                />
                {confirm.length > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      pointerEvents: "none",
                      color: passwordsMatch
                        ? "var(--accent)"
                        : "var(--tertiary-fixed-dim)",
                    }}
                  >
                    {passwordsMatch ? (
                      <Check size={14} strokeWidth={2.5} />
                    ) : (
                      <X size={14} strokeWidth={2.5} />
                    )}
                  </div>
                )}
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
              {loading ? "Updating…" : "Set new password"}
              {!loading && <ChevronRight size={15} />}
            </button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
