import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ChevronRight, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
          Back in
          <br />
          <em className="not-italic font-medium text-primary">two minutes.</em>
        </p>
        <p className="body-md mt-5 max-w-[380px] text-on-surface-muted text-[15px] leading-[1.55]">
          Enter the email address linked to your account and we'll send you a
          secure link to reset your password.
        </p>
      </div>

      <div className="flex-1" />

      <div className="relative flex flex-col gap-4 bg-surface-high rounded-2xl p-5">
        {[
          { step: "1", text: "Enter your work email below" },
          { step: "2", text: "Click the link we send you" },
          { step: "3", text: "Choose a new password" },
        ].map(({ step, text }) => (
          <div key={step} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-primary-fixed grid place-items-center shrink-0">
              <span className="mono text-[11px] font-bold text-primary">
                {step}
              </span>
            </div>
            <span className="body-sm text-on-surface">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Reset password page
   ────────────────────────────────────────────────────────────── */
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

        {/* Centred form area */}
        <div className="flex-1 flex items-center justify-start">
          <div className="w-full max-w-[400px]">
            {sent ? (
              /* ── Success state ── */
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 rounded-2xl bg-primary-fixed grid place-items-center mb-5">
                  <MailCheck size={22} className="text-primary" />
                </div>
                <span className="label-md">Check your inbox</span>
                <h1 className="display-md mt-1.5 mb-2.5">Email sent.</h1>
                <p className="body-md text-on-surface-muted mb-7 leading-[1.6]">
                  We sent a password reset link to{" "}
                  <span className="font-semibold text-on-surface">{email}</span>
                  . The link expires in 60 minutes.
                </p>
                <p className="body-sm text-on-surface-muted mb-6">
                  Didn't receive it? Check your spam folder, or{" "}
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="text-primary font-semibold bg-transparent border-none cursor-pointer p-0"
                  >
                    try again
                  </button>
                  .
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-primary font-semibold no-underline body-sm"
                >
                  <ArrowLeft size={14} />
                  Back to sign in
                </Link>
              </div>
            ) : (
              /* ── Request form ── */
              <>
                <span className="label-md">Password reset</span>
                <h1 className="display-md mt-1.5 mb-2.5">Forgot your password?</h1>
                <p className="body-md text-on-surface-muted mb-7">
                  Enter your work email and we'll send you a reset link.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="email" className="field-label">
                      Work email
                    </label>
                    <div className="relative">
                      <Mail
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint pointer-events-none"
                      />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field pl-9"
                        placeholder="you@cafe.com"
                        autoComplete="email"
                        autoFocus
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary justify-center py-3 text-sm mt-2.5"
                    disabled={loading}
                  >
                    {loading ? "Sending…" : "Send reset link"}
                    {!loading && <ChevronRight size={15} />}
                  </button>
                </form>

                <p className="body-sm text-center mt-5 text-on-surface-muted">
                  Remember your password?{" "}
                  <Link
                    to="/login"
                    className="text-primary font-semibold no-underline"
                  >
                    Sign in
                  </Link>
                </p>
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
