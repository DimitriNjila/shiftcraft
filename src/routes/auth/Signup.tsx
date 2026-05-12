import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Check, X, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/* ──────────────────────────────────────────────────────────────
   Password strength helpers
   ────────────────────────────────────────────────────────────── */
export interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const getPasswordCriteria = (password: string): PasswordCriteria => {
  return {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  const c = getPasswordCriteria(password);
  const score = Object.values(c).filter(Boolean).length; // 0–5
  if (score <= 1) return 1;
  if (score === 2) return 2;
  if (score === 3) return 3;
  if (score >= 4) return 4;
  return 0;
};

const CRITERIA_LABELS: { key: keyof PasswordCriteria; label: string }[] = [
  { key: "length", label: "10+ chars" },
  { key: "uppercase", label: "A–Z" },
  { key: "lowercase", label: "a–z" },
  { key: "number", label: "0–9" },
  { key: "special", label: "!@#…" },
];

/** Tailwind bg class for each strength level. */
function strengthBarColor(strength: number): string {
  if (strength === 1) return "bg-tertiary-fixed-dim";
  if (strength === 2) return "bg-warning";
  if (strength === 3) return "bg-primary-fixed-dim";
  return "bg-primary";
}

/* ──────────────────────────────────────────────────────────────
   Editorial right panel
   ────────────────────────────────────────────────────────────── */
const STATS = [
  { k: "Setup time", v: "< 5 min" },
  { k: "Free trial", v: "14 days" },
  { k: "Cancel anytime", v: "∞" },
] as const;

function EditorialPanel() {
  return (
    <div className="editorial-panel">
      <div className="editorial-gradient-wash" />

      <div className="relative flex items-center gap-2.5">
        <span className="label-md" style={{ fontSize: 10 }}>
          14 days free
        </span>
        <div className="w-5 h-px bg-outline-variant opacity-40" />
        <span className="label-md" style={{ fontSize: 10 }}>
          No card required
        </span>
      </div>

      <div className="relative mt-7">
        <p
          className="display-lg"
          style={{ lineHeight: 1.02, fontSize: "3rem" }}
        >
          Staff scheduling,
          <br />
          <em className="not-italic font-medium text-primary">finally easy.</em>
        </p>
        <p className="body-md mt-5 max-w-95 text-on-surface-muted text-[15px] leading-[1.55]">
          Build your first week's schedule in minutes, not hours. Auto-fill
          shifts, manage time-off, and keep your whole team in sync.
        </p>
      </div>

      <div className="flex-1" />

      <div className="relative grid grid-cols-3 gap-0.5 bg-surface-high rounded-2xl p-0.5">
        {STATS.map((s) => (
          <div key={s.k} className="bg-surface-lowest rounded-lg py-4 px-4.5">
            <div className="label-md" style={{ fontSize: 9.5 }}>
              {s.k}
            </div>
            <div className="headline-md mono mt-1 text-[18px]">{s.v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Validation
   ────────────────────────────────────────────────────────────── */
interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validateForm = (form: SignupForm): string | null => {
  if (!form.fullName.trim()) return "Full name is required";
  if (!form.email.trim()) return "Email is required";

  const c = getPasswordCriteria(form.password);
  if (!c.length) return "Password must be at least 10 characters";
  if (!c.uppercase) return "Password must contain an uppercase letter";
  if (!c.lowercase) return "Password must contain a lowercase letter";
  if (!c.number) return "Password must contain a number";
  if (!c.special) return "Password must contain a special character";

  if (form.password !== form.confirmPassword) return "Passwords do not match";

  return null;
};

/* ──────────────────────────────────────────────────────────────
   Signup page
   ────────────────────────────────────────────────────────────── */
export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [form, setForm] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  const set = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validateForm(form);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      await signUp(form.email, form.password, form.fullName);
      toast.success("Account created! Check your email to confirm.");
      navigate("/login");
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);
  const criteria = getPasswordCriteria(form.password);
  const passwordsMatch =
    form.confirmPassword.length > 0 && form.password === form.confirmPassword;
  const passwordsMismatch =
    form.confirmPassword.length > 0 && form.password !== form.confirmPassword;

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
          <div className="w-full max-w-100">
            <span className="label-md">Start a trial · 14 days free</span>
            <h1 className="display-md mt-1.5 mb-2.5">Create your account.</h1>
            <p className="body-md text-on-surface-muted mb-6">
              No card required. Cancel anytime.
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div>
                <label htmlFor="fullName" className="field-label">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className="input-field"
                  placeholder="Elena Kovač"
                  autoComplete="name"
                />
              </div>

              <div>
                <label htmlFor="email" className="field-label">
                  Work email
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="input-field"
                  placeholder="you@cafe.com"
                  autoComplete="email"
                />
              </div>

              {/* Password + strength */}
              <div>
                <label htmlFor="password" className="field-label">
                  Password
                </label>
                <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  className="input-field"
                  placeholder="At least 10 characters"
                  autoComplete="new-password"
                />
                <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-faint focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button> 
                </div>

                {/* Strength meter */}
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`flex-1 h-0.75 rounded-sm transition-all duration-300 ${
                        strength >= level
                          ? strengthBarColor(strength)
                          : "bg-surface-highest"
                      }`}
                    />
                  ))}
                </div>

                {/* Criteria pills — only shown once typing starts */}
                {form.password.length > 0 && (
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

              {/* Confirm password */}
              <div>
                <label htmlFor="confirmPassword" className="field-label">
                  Confirm password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) => set("confirmPassword", e.target.value)}
                    className={`input-field pr-9 ${
                      passwordsMismatch
                        ? "shadow-[inset_0_0_0_2px_var(--color-tertiary-fixed-dim)]"
                        : passwordsMatch
                          ? "shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]"
                          : ""
                    }`}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                  />
                  {/* Match indicator icon */}
                  {form.confirmPassword.length > 0 && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                      {passwordsMatch ? (
                        <Check
                          size={14}
                          className="text-primary"
                          strokeWidth={2.5}
                        />
                      ) : (
                        <X
                          size={14}
                          className="text-tertiary-fixed-dim"
                          strokeWidth={2.5}
                        />
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
                {loading ? "Creating account…" : "Start free trial"}
                {!loading && <Sparkles size={15} />}
              </button>
            </form>

            <p className="body-sm text-center mt-5 text-on-surface-muted">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold no-underline"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-4 text-on-surface-faint">
          <span className="label-sm">© 2026 Shiftcraft</span>
          <span className="label-sm cursor-pointer">Terms</span>
          <span className="label-sm cursor-pointer">Privacy</span>
        </div>
      </div>

      {/* ── Right: editorial panel ── */}
      <EditorialPanel />
    </div>
  );
}
