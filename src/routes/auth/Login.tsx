import { type FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, ChevronRight, EyeOff, Eye, Check } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { AuthShell } from "@/components/auth/AuthShell";
import { EditorialPanel } from "@/components/auth/EditorialPanel";

export default function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

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
    <AuthShell side={<EditorialPanel variant="login" />}>
      <div className="label-md">Sign in</div>
      <h1 className="display-md" style={{ margin: "6px 0 10px" }}>
        Welcome back.
      </h1>
      <p
        className="body-md"
        style={{ color: "var(--on-surface-muted)", marginBottom: 28 }}
      >
        Sign in to continue running your café operations.
      </p>

      {/* SSO (Google / Apple) — hidden for launch. Restore when the SSO flow
          is ready on the backend. */}
      {/*
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" className="btn btn-secondary" ...>Continue with Google</button>
        <button type="button" className="btn btn-secondary" ...>Continue with Apple</button>
      </div>
      <div style={{ ... "or with email" divider ... }} />
      */}

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 14 }}
      >
        <div>
          <label htmlFor="email" className="label-md" style={{ display: "block", marginBottom: 6 }}>
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

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 6,
            }}
          >
            <label htmlFor="password" className="label-md">
              Password
            </label>
            <Link
              to="/reset-password"
              className="label-md"
              style={{ color: "var(--accent)", textDecoration: "none" }}
            >
              Forgot?
            </Link>
          </div>
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
              placeholder="••••••••"
              autoComplete="current-password"
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
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            marginTop: 4,
          }}
        >
          <button
            type="button"
            onClick={() => setRemember((r) => !r)}
            aria-pressed={remember}
            aria-label="Keep me signed in"
            style={{
              width: 18,
              height: 18,
              borderRadius: 5,
              background: remember
                ? "var(--accent)"
                : "var(--surface-highest)",
              display: "grid",
              placeItems: "center",
              transition: "background 0.15s",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            {remember && <Check size={12} color="white" />}
          </button>
          <span className="body-sm">Keep me signed in for 30 days</span>
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          style={{
            justifyContent: "center",
            padding: "12px 14px",
            fontSize: 14,
            marginTop: 10,
          }}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign in to Mise en Place"}
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
        New to Mise en Place?{" "}
        <Link
          to="/signup"
          style={{
            color: "var(--accent)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Start a free trial
        </Link>
      </p>
    </AuthShell>
  );
}
