import { type FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ChevronRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  getPasswordCriteria,
  getPasswordStrength,
} from "@/routes/auth/Signup";

/* ──────────────────────────────────────────────────────────────
   Editorial right panel
   ────────────────────────────────────────────────────────────── */
function EditorialPanel() {
  return (
    <div className="editorial-panel">
      <div className="editorial-gradient-wash" />

      <div className="relative flex items-center gap-2.5">
        <span className="label-md" style={{ fontSize: 10 }}>
          Account security
        </span>
        <div className="w-5 h-px bg-outline-variant opacity-40" />
        <span className="label-md" style={{ fontSize: 10 }}>
          Shiftcraft
        </span>
      </div>

      <div className="relative mt-7">
        <p className="display-lg" style={{ lineHeight: 1.02, fontSize: "3rem" }}>
          Choose a
          <br />
          <em className="not-italic font-medium text-primary">strong password.</em>
        </p>
        <p className="body-md mt-5 max-w-[380px] text-on-surface-muted text-[15px] leading-[1.55]">
          A strong password keeps your team's schedule data safe. Use at least
          10 characters with a mix of letters, numbers, and symbols.
        </p>
      </div>

      <div className="flex-1" />

      <div className="relative bg-surface-high rounded-2xl p-5">
        <p className="label-md mb-3" style={{ fontSize: 10 }}>
          Password tips
        </p>
        {[
          "Use 10 or more characters",
          "Mix uppercase and lowercase",
          "Add numbers and symbols (!@#…)",
          "Avoid using your name or email",
        ].map((tip) => (
          <div key={tip} className="flex items-center gap-2.5 mb-2 last:mb-0">
            <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
            <span className="body-sm text-on-surface">{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Tailwind bg class per strength level. */
function strengthBarColor(strength: number): string {
  if (strength === 1) return "bg-tertiary-fixed-dim";
  if (strength === 2) return "bg-warning";
  if (strength === 3) return "bg-primary-fixed-dim";
  return "bg-primary";
}

const CRITERIA_LABELS = [
  { key: "length" as const, label: "10+ chars" },
  { key: "uppercase" as const, label: "A–Z" },
  { key: "lowercase" as const, label: "a–z" },
  { key: "number" as const, label: "0–9" },
  { key: "special" as const, label: "!@#…" },
];

/* ──────────────────────────────────────────────────────────────
   Reset password confirm page
   ────────────────────────────────────────────────────────────── */
export default function ResetPasswordConfirmPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event Supabase fires when the user
    // lands with a valid recovery token in the URL hash.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setReady(true);
      }
    });

    // If no PASSWORD_RECOVERY event fires within 5 seconds, the link is
    // invalid or has already been used.
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
    if (!c.length) { toast.error("Password must be at least 10 characters"); return; }
    if (!c.uppercase) { toast.error("Password must contain an uppercase letter"); return; }
    if (!c.lowercase) { toast.error("Password must contain a lowercase letter"); return; }
    if (!c.number) { toast.error("Password must contain a number"); return; }
    if (!c.special) { toast.error("Password must contain a special character"); return; }
    if (password !== confirm) { toast.error("Passwords do not match"); return; }

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
    <div className="auth-grid">
      {/* ── Left: form ── */}
      <div className="flex flex-col pt-9 px-16 pb-12 min-h-screen overflow-y-auto">
        {/* Logo */}
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 no-underline text-on-surface w-fit"
        >
          <div className="brand-logo-mark">S</div>
          <span className="font-display font-bold text-base tracking-[-0.01em]">
            Shiftcraft
          </span>
        </Link>

        <div className="flex-1 flex items-center justify-start">
          <div className="w-full max-w-[400px]">
            {expired && !ready ? (
              /* ── Expired / invalid link state ── */
              <>
                <span className="label-md">Link expired</span>
                <h1 className="display-md mt-1.5 mb-2.5">This link has expired.</h1>
                <p className="body-md text-on-surface-muted mb-7 leading-[1.6]">
                  Password reset links are single-use and expire after 60
                  minutes. Request a new one to continue.
                </p>
                <Link
                  to="/reset-password"
                  className="btn btn-primary inline-flex justify-center py-3 text-sm no-underline"
                >
                  Request new link
                  <ChevronRight size={15} />
                </Link>
              </>
            ) : !ready ? (
              /* ── Loading state while waiting for PASSWORD_RECOVERY event ── */
              <>
                <span className="label-md">Verifying link…</span>
                <h1 className="display-md mt-1.5 mb-2.5">One moment.</h1>
                <p className="body-md text-on-surface-muted">
                  Verifying your reset link.
                </p>
              </>
            ) : (
              /* ── New password form ── */
              <>
                <span className="label-md">Password reset</span>
                <h1 className="display-md mt-1.5 mb-2.5">Set a new password.</h1>
                <p className="body-md text-on-surface-muted mb-7">
                  Choose a strong password for your Shiftcraft account.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="password" className="field-label">
                      New password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint pointer-events-none"
                      />
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="input-field pl-9"
                        placeholder="At least 10 characters"
                        autoComplete="new-password"
                        autoFocus
                      />
                    </div>

                    {/* Strength meter */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`flex-1 h-[3px] rounded-sm transition-all duration-300 ${
                            strength >= level
                              ? strengthBarColor(strength)
                              : "bg-surface-highest"
                          }`}
                        />
                      ))}
                    </div>

                    {password.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {CRITERIA_LABELS.map(({ key, label }) => (
                          <span
                            key={key}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium font-label transition-colors ${
                              criteria[key]
                                ? "bg-primary-fixed text-primary"
                                : "bg-surface-highest text-on-surface-faint"
                            }`}
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
                    <label htmlFor="confirm" className="field-label">
                      Confirm password
                    </label>
                    <div className="relative">
                      <Lock
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint pointer-events-none"
                      />
                      <input
                        id="confirm"
                        type="password"
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className={`input-field pl-9 pr-9 ${
                          passwordsMismatch
                            ? "shadow-[inset_0_0_0_2px_var(--color-tertiary-fixed-dim)]"
                            : passwordsMatch
                              ? "shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]"
                              : ""
                        }`}
                        placeholder="Re-enter your password"
                        autoComplete="new-password"
                      />
                      {confirm.length > 0 && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                          {passwordsMatch ? (
                            <Check size={14} className="text-primary" strokeWidth={2.5} />
                          ) : (
                            <X size={14} className="text-tertiary-fixed-dim" strokeWidth={2.5} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary justify-center py-3 text-sm mt-2.5"
                    disabled={loading}
                  >
                    {loading ? "Updating…" : "Set new password"}
                    {!loading && <ChevronRight size={15} />}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 text-on-surface-faint">
          <span className="label-sm">© 2026 Shiftcraft</span>
          <span className="label-sm cursor-pointer">Terms</span>
          <span className="label-sm cursor-pointer">Privacy</span>
          <span className="label-sm cursor-pointer">Support</span>
        </div>
      </div>

      {/* ── Right: editorial panel ── */}
      <EditorialPanel />
    </div>
  );
}
