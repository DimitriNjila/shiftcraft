import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, Check, X } from "lucide-react";
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

export const getPasswordCriteria = (password: string): PasswordCriteria => {
  return {
    length: password.length >= 10,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
};

/** Returns 0–4 based on how many criteria are met. */
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

const validateStep0 = (form: SignupForm): string | null => {
  if (!form.fullName.trim()) return "Full name is required";
  if (!form.email.trim()) return "Email is required";

  const c = getPasswordCriteria(form.password);
  if (!c.length) return "Password must be at least 10 characters";
  if (!c.uppercase) return "Password must contain an uppercase letter";
  if (!c.lowercase) return "Password must contain a lowercase letter";
  if (!c.number) return "Password must contain a number";
  if (!c.special) return "Password must contain a special character";

  if (form.password !== form.confirmPassword) {
    return "Passwords do not match";
  }

  return null;
};

const validateStep1 = (form: SignupForm): string | null => {
  if (!form.restaurantName.trim()) return "Restaurant name is required";
  return null;
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
        <p className="body-md mt-5 max-w-[380px] text-on-surface-muted text-[15px] leading-[1.55]">
          Build your first week's schedule in minutes, not hours. Auto-fill
          shifts, manage time-off, and keep your whole team in sync.
        </p>
      </div>

      <div className="flex-1" />

      <div className="relative grid grid-cols-3 gap-0.5 bg-surface-high rounded-2xl p-0.5">
        {STATS.map((s) => (
          <div
            key={s.k}
            className="bg-surface-lowest rounded-[14px] py-4 px-[18px]"
          >
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
   Signup page
   ────────────────────────────────────────────────────────────── */
const TEAM_SIZES = ["1–5", "6–20", "21–50", "50+"] as const;
const ROLES = [
  { id: "owner", label: "Owner / Founder", sub: "You run the whole operation" },
  { id: "gm", label: "General Manager", sub: "You oversee daily operations" },
  { id: "shift", label: "Shift Lead", sub: "You run individual shifts" },
] as const;

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  restaurantName: string;
  teamSize: string;
  role: string;
}

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<SignupForm>({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    restaurantName: "",
    teamSize: "6–20",
    role: "gm",
  });

  const set = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleStep0 = (e: FormEvent) => {
    e.preventDefault();
    const error = validateStep0(form);
    if (error) {
      toast.error(error);
      return;
    }
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const error = validateStep1(form);
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try {
      await signUp(form.email, form.password, form.fullName, {
        name: form.restaurantName,
        teamSize: form.teamSize,
        role: form.role,
      });
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
          <div className="w-full max-w-[400px]">
            <span className="label-md">Start a trial · 14 days free</span>
            <h1 className="display-md mt-1.5 mb-2.5">
              {step === 0 ? "Create your account." : "Tell us about your café."}
            </h1>
            <p className="body-md text-on-surface-muted mb-6">
              No card required. Cancel anytime.
            </p>

            {/* Step indicator */}
            <div className="flex gap-1.5 mb-6">
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className={`flex-1 h-[3px] rounded-sm transition-colors ${
                    step >= i ? "bg-primary" : "bg-surface-highest"
                  }`}
                />
              ))}
            </div>

            {step === 0 ? (
              /* ── Step 1: credentials ── */
              <form onSubmit={handleStep0} className="flex flex-col gap-3.5">
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
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    className="input-field"
                    placeholder="At least 10 characters"
                    autoComplete="new-password"
                  />

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
                      type="password"
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
                >
                  Continue
                  <ChevronRight size={15} />
                </button>
              </form>
            ) : (
              /* ── Step 2: café details ── */
              <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label htmlFor="restaurantName" className="field-label">
                    Café or restaurant name
                  </label>
                  <input
                    id="restaurantName"
                    value={form.restaurantName}
                    onChange={(e) => set("restaurantName", e.target.value)}
                    className="input-field"
                    placeholder="Meridian Coffee"
                  />
                </div>

                <div>
                  <span className="field-label">Team size</span>
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {TEAM_SIZES.map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => set("teamSize", s)}
                        className={`mono py-2.5 rounded-[10px] text-[12.5px] font-semibold border-none cursor-pointer transition-all ${
                          form.teamSize === s
                            ? "bg-surface-lowest text-on-surface shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]"
                            : "bg-surface-highest text-on-surface-muted"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="field-label">Your role</span>
                  <div className="flex flex-col gap-1.5 mt-1.5">
                    {ROLES.map((r) => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => set("role", r.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left border-none cursor-pointer w-full transition-all ${
                          form.role === r.id
                            ? "bg-surface-lowest shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]"
                            : "bg-surface-highest"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded-full grid place-items-center shrink-0 transition-colors ${
                            form.role === r.id
                              ? "bg-primary"
                              : "bg-surface-high"
                          }`}
                        >
                          {form.role === r.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="title-sm text-[13px]">{r.label}</div>
                          <div className="label-sm normal-case tracking-normal text-[10px]">
                            {r.sub}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => setStep(0)}
                    className="btn btn-secondary py-3 px-4 text-sm"
                  >
                    <ChevronLeft size={15} /> Back
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1 justify-center py-3 text-sm"
                    disabled={loading}
                  >
                    {loading ? "Creating account…" : "Start free trial"}
                    {!loading && <Sparkles size={15} />}
                  </button>
                </div>
              </form>
            )}

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
