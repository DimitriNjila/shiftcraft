import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChevronRight, ChevronLeft, Sparkles, EyeOff, Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { EditorialPanel } from "@/components/auth/EditorialPanel";

/* ──────────────────────────────────────────────────────────────
   Password validation (kept simple to match design's meter,
   but with a minimum-length guardrail before advancing steps)
   ────────────────────────────────────────────────────────────── */
export interface PasswordCriteria {
  length: boolean;
  uppercase: boolean;
  lowercase: boolean;
  number: boolean;
  special: boolean;
}

// eslint-disable-next-line react-refresh/only-export-components
export const getPasswordCriteria = (password: string): PasswordCriteria => ({
  length: password.length >= 10,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[^A-Za-z0-9]/.test(password),
});

// eslint-disable-next-line react-refresh/only-export-components
export const getPasswordStrength = (password: string): number => {
  if (!password) return 0;
  const c = getPasswordCriteria(password);
  return Object.values(c).filter(Boolean).length;
};

type Size = "1-5" | "6-20" | "21-50" | "50+";
type Role = "owner" | "gm" | "shift";

interface Form {
  fullName: string;
  email: string;
  password: string;
  cafe: string;
  size: Size;
  role: Role;
}

const ROLE_OPTIONS: Array<{ id: Role; label: string; sub: string }> = [
  { id: "owner", label: "Owner / Founder", sub: "You run the whole operation" },
  { id: "gm", label: "General Manager", sub: "You oversee daily operations" },
  { id: "shift", label: "Shift Lead", sub: "You run individual shifts" },
];

const SIZE_OPTIONS: Size[] = ["1-5", "6-20", "21-50", "50+"];

export default function SignupPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<0 | 1>(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<Form>({
    fullName: "",
    email: "",
    password: "",
    cafe: "",
    size: "6-20",
    role: "gm",
  });

  const set = <K extends keyof Form>(k: K, v: Form[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const canAdvanceStep1 = () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!form.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    const c = getPasswordCriteria(form.password);
    if (!c.length) {
      toast.error("Password must be at least 10 characters");
      return false;
    }
    return true;
  };

  const handleStep1 = (e: FormEvent) => {
    e.preventDefault();
    if (canAdvanceStep1()) setStep(1);
  };

  const handleStep2 = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.cafe.trim()) {
      toast.error("Please tell us the name of your café");
      return;
    }
    setLoading(true);
    try {
      const { signedIn } = await signUp(
        form.email,
        form.password,
        form.fullName,
        {
          cafe_name: form.cafe,
          team_size: form.size,
          role: form.role,
        },
      );
      if (signedIn) {
        // Email confirmation is disabled — the user is authenticated
        // right now. Route straight into onboarding.
        toast.success("Welcome to Mise en Place");
        navigate("/setup");
      } else {
        // Email confirmation is on — the user must click the emailed
        // link before they can sign in. Route to a friendly holding
        // state.
        toast.success("Account created — check your email to confirm.");
        navigate("/login");
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create account",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell side={<EditorialPanel variant="signup" />} footerLinks={["terms", "privacy"]}>
      <div className="label-md">Start a trial · 14 days free</div>
      <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
        {step === 0 ? "Create your account." : "Tell us about your café."}
      </h1>
      <p
        className="body-md"
        style={{ color: "var(--on-surface-muted)", marginBottom: 24 }}
      >
        No card required. Cancel anytime.
      </p>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {[0, 1].map((i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background:
                step >= i ? "var(--accent)" : "var(--surface-highest)",
              transition: "background 0.2s",
            }}
          />
        ))}
      </div>

      {step === 0 ? (
        <form
          onSubmit={handleStep1}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label htmlFor="fullName" className="label-md" style={{ display: "block", marginBottom: 6 }}>
              Full name
            </label>
            <input
              id="fullName"
              value={form.fullName}
              onChange={(e) => set("fullName", e.target.value)}
              className="input"
              placeholder="Elena Kovač"
              autoComplete="name"
            />
          </div>
          <div>
            <label htmlFor="email" className="label-md" style={{ display: "block", marginBottom: 6 }}>
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              className="input"
              placeholder="you@cafe.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label htmlFor="password" className="label-md" style={{ display: "block", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => set("password", e.target.value)}
                className="input"
                style={{ paddingRight: 36 }}
                placeholder="At least 10 characters"
                autoComplete="new-password"
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
            {/* Strength meter — 4 bars, filled by length in 3-char steps (matches design) */}
            <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 3,
                    borderRadius: 2,
                    background:
                      form.password.length > i * 3
                        ? "var(--accent)"
                        : "var(--surface-highest)",
                    transition: "background 0.2s",
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              justifyContent: "center",
              padding: "12px 14px",
              fontSize: 14,
              marginTop: 10,
            }}
          >
            Continue
            <ChevronRight size={15} />
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleStep2}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label htmlFor="cafe" className="label-md" style={{ display: "block", marginBottom: 6 }}>
              Café or restaurant name
            </label>
            <input
              id="cafe"
              value={form.cafe}
              onChange={(e) => set("cafe", e.target.value)}
              className="input"
              placeholder="Meridian Coffee"
              autoFocus
            />
          </div>

          <div>
            <div className="label-md" style={{ marginBottom: 6 }}>
              Team size
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
              }}
            >
              {SIZE_OPTIONS.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => set("size", s)}
                  aria-pressed={form.size === s}
                  className="mono"
                  style={{
                    padding: "10px 6px",
                    borderRadius: 10,
                    fontSize: 12.5,
                    fontWeight: 600,
                    background:
                      form.size === s
                        ? "var(--surface-lowest)"
                        : "var(--surface-highest)",
                    color:
                      form.size === s
                        ? "var(--on-surface)"
                        : "var(--on-surface-muted)",
                    boxShadow:
                      form.size === s
                        ? "inset 0 0 0 1.5px var(--accent)"
                        : "none",
                    transition: "all 0.15s",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="label-md" style={{ marginBottom: 6 }}>
              Your role
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {ROLE_OPTIONS.map((r) => (
                <button
                  type="button"
                  key={r.id}
                  onClick={() => set("role", r.id)}
                  aria-pressed={form.role === r.id}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    textAlign: "left",
                    background:
                      form.role === r.id
                        ? "var(--surface-lowest)"
                        : "var(--surface-highest)",
                    boxShadow:
                      form.role === r.id
                        ? "inset 0 0 0 1.5px var(--accent)"
                        : "none",
                    transition: "all 0.15s",
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    border: "none",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      width: 16,
                      height: 16,
                      borderRadius: "50%",
                      background:
                        form.role === r.id
                          ? "var(--accent)"
                          : "var(--surface-high)",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    {form.role === r.id && (
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "white",
                        }}
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="title-sm" style={{ fontSize: 13 }}>
                      {r.label}
                    </div>
                    <div
                      className="label-sm"
                      style={{
                        fontSize: 10,
                        textTransform: "none",
                        letterSpacing: "normal",
                      }}
                    >
                      {r.sub}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button
              type="button"
              onClick={() => setStep(0)}
              className="btn btn-secondary"
              style={{ padding: "12px 16px", fontSize: 14 }}
            >
              <ChevronLeft size={15} /> Back
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{
                flex: 1,
                justifyContent: "center",
                padding: "12px 14px",
                fontSize: 14,
              }}
            >
              {loading ? "Creating account…" : "Start free trial"}
              {!loading && <Sparkles size={15} />}
            </button>
          </div>
        </form>
      )}

      <p
        className="body-sm"
        style={{
          textAlign: "center",
          marginTop: 22,
          color: "var(--on-surface-muted)",
        }}
      >
        Already have an account?{" "}
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
    </AuthShell>
  );
}
