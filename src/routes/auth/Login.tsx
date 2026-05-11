import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ChevronRight,EyeOff,Eye } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

/* ──────────────────────────────────────────────────────────────
   Editorial right panel
   ────────────────────────────────────────────────────────────── */
const STATS = [
  { k: "Hours saved / wk", v: "6.4h" },
  { k: "Avg. labor savings", v: "11%" },
  { k: "Cafés on platform", v: "1,240" },
] as const;

function EditorialPanel() {
  return (
    <div className="editorial-panel">
      <div className="editorial-gradient-wash" />

      {/* Top meta */}
      <div className="relative flex items-center gap-2.5">
        <span className="label-md" style={{ fontSize: 10 }}>
          Vol. 26 · Week 17
        </span>
        <div className="w-5 h-px bg-outline-variant opacity-40" />
        <span className="label-md" style={{ fontSize: 10 }}>
          Precision Hospitality
        </span>
      </div>

      {/* Editorial headline */}
      <div className="relative mt-7">
        <p
          className="display-lg"
          style={{ lineHeight: 1.02, fontSize: "3rem" }}
        >
          The calm behind
          <br />
          <em className="not-italic font-medium text-primary">every shift.</em>
        </p>
        <p className="body-md mt-5 max-w-95 text-on-surface-muted text-[15px] leading-[1.55]">
          Schedule staff, track hours, approve time off — the daily operations
          of a modern café, composed like a well-run dining room.
        </p>
      </div>

      <div className="flex-1" />

      {/* Proof bar */}
      <div className="relative grid grid-cols-3 gap-0.5 bg-surface-high rounded-2xl p-0.5">
        {STATS.map((s) => (
          <div key={s.k} className="bg-surface-lowest rounded-lg py-4 px-4.5">
            <div className="label-md" style={{ fontSize: 9.5 }}>
              {s.k}
            </div>
            <div className="headline-md mono mt-1 text-xl">{s.v}</div>
          </div>
        ))}
      </div>

      {/* Testimonial */}
      <div className="relative mt-5 flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-full grid place-items-center shrink-0 font-display font-bold text-[15px]"
          style={{
            background: "oklch(0.82 0.06 30)",
            color: "oklch(0.28 0.08 30)",
          }}
        >
          EK
        </div>
        <div className="flex-1">
          <p className="body-sm italic text-on-surface leading-[1.4]">
            "Our Friday-night schedule used to be a four-hour spreadsheet. Now
            it's fifteen minutes."
          </p>
          <p className="label-sm mt-1" style={{ fontSize: 10 }}>
            Elena Kovač · GM, Meridian Coffee
          </p>
        </div>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Login page
   ────────────────────────────────────────────────────────────── */
export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }
    if (!password) {
      toast.error("Password is required");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to sign in");
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
          <div className="w-full max-w-100">
            <span className="label-md">Sign in</span>
            <h1 className="display-md mt-1.5 mb-2.5">Welcome back.</h1>
            <p className="body-md text-on-surface-muted mb-7">
              Sign in to continue running your café operations.
            </p>

            {/* Form */}
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
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label htmlFor="password" className="field-label mb-0">
                    Password
                  </label>
                  <Link
                    to="/reset-password"
                    className="label-md text-primary no-underline"
                    style={{ fontSize: 11 }}
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint pointer-events-none"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-9"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-faint focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button> 
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary justify-center py-3 text-sm mt-2.5"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign in to Shiftcraft"}
                {!loading && <ChevronRight size={15} />}
              </button>
            </form>

            <p className="body-sm text-center mt-5 text-on-surface-muted">
              New to Shiftcraft?{" "}
              <Link
                to="/signup"
                className="text-primary font-semibold no-underline"
              >
                Start a free trial
              </Link>
            </p>
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
