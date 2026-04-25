import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

/* ──────────────────────────────────────────────────────────────
   Editorial right panel
   ────────────────────────────────────────────────────────────── */
const STATS = [
  { k: 'Setup time', v: '< 5 min' },
  { k: 'Free trial', v: '14 days' },
  { k: 'Cancel anytime', v: '∞' },
] as const;

function EditorialPanel() {
  return (
    <div className="editorial-panel">
      <div className="editorial-gradient-wash" />

      <div className="relative flex items-center gap-2.5">
        <span className="label-md" style={{ fontSize: 10 }}>14 days free</span>
        <div className="w-5 h-px bg-outline-variant opacity-40" />
        <span className="label-md" style={{ fontSize: 10 }}>No card required</span>
      </div>

      <div className="relative mt-7">
        <p className="display-lg" style={{ lineHeight: 1.02, fontSize: '3rem' }}>
          Staff scheduling,<br />
          <em className="not-italic font-medium text-primary">finally easy.</em>
        </p>
        <p className="body-md mt-5 max-w-[380px] text-on-surface-muted text-[15px] leading-[1.55]">
          Build your first week's schedule in minutes, not hours.
          Auto-fill shifts, manage time-off, and keep your whole team in sync.
        </p>
      </div>

      <div className="flex-1" />

      <div className="relative grid grid-cols-3 gap-0.5 bg-surface-high rounded-2xl p-0.5">
        {STATS.map((s) => (
          <div key={s.k} className="bg-surface-lowest rounded-[14px] py-4 px-[18px]">
            <div className="label-md" style={{ fontSize: 9.5 }}>{s.k}</div>
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
const TEAM_SIZES = ['1–5', '6–20', '21–50', '50+'] as const;
const ROLES = [
  { id: 'owner', label: 'Owner / Founder', sub: 'You run the whole operation' },
  { id: 'gm', label: 'General Manager', sub: 'You oversee daily operations' },
  { id: 'shift', label: 'Shift Lead', sub: 'You run individual shifts' },
] as const;

interface SignupForm {
  fullName: string;
  email: string;
  password: string;
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
    fullName: '',
    email: '',
    password: '',
    restaurantName: '',
    teamSize: '6–20',
    role: 'gm',
  });

  const set = <K extends keyof SignupForm>(k: K, v: SignupForm[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleStep0 = (e: FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) { toast.error('Full name is required'); return; }
    if (!form.email.trim()) { toast.error('Email is required'); return; }
    if (form.password.length < 10) { toast.error('Password must be at least 10 characters'); return; }
    setStep(1);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.restaurantName.trim()) { toast.error('Restaurant name is required'); return; }

    setLoading(true);
    try {
      await signUp(form.email, form.password, form.fullName);
      toast.success('Account created! Check your email to confirm.');
      navigate('/login');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = Math.min(4, Math.floor(form.password.length / 3));

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
          <span className="font-display font-bold text-base tracking-[-0.01em]">Shiftcraft</span>
        </Link>

        {/* Centred form area */}
        <div className="flex-1 flex items-center justify-start">
          <div className="w-full max-w-[400px]">
            <span className="label-md">Start a trial · 14 days free</span>
            <h1 className="display-md mt-1.5 mb-2.5">
              {step === 0 ? 'Create your account.' : 'Tell us about your café.'}
            </h1>
            <p className="body-md text-on-surface-muted mb-6">
              No card required. Cancel anytime.
            </p>

            {/* Step indicator */}
            <div className="flex gap-1.5 mb-6">
              {[0, 1].map(i => (
                <div
                  key={i}
                  className={`flex-1 h-[3px] rounded-sm transition-colors ${
                    step >= i ? 'bg-primary' : 'bg-surface-highest'
                  }`}
                />
              ))}
            </div>

            {step === 0 ? (
              /* ── Step 1: credentials ── */
              <form onSubmit={handleStep0} className="flex flex-col gap-3.5">
                <div>
                  <label htmlFor="fullName" className="field-label">Full name</label>
                  <input
                    id="fullName"
                    value={form.fullName}
                    onChange={e => set('fullName', e.target.value)}
                    className="input-field"
                    placeholder="Elena Kovač"
                    autoComplete="name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="field-label">Work email</label>
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={e => set('email', e.target.value)}
                    className="input-field"
                    placeholder="you@cafe.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="field-label">Password</label>
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    className="input-field"
                    placeholder="At least 10 characters"
                    autoComplete="new-password"
                  />
                  {/* Password strength */}
                  <div className="flex gap-1 mt-1.5">
                    {[0, 1, 2, 3].map(i => (
                      <div
                        key={i}
                        className={`flex-1 h-[3px] rounded-sm transition-colors ${
                          i < passwordStrength ? 'bg-primary' : 'bg-surface-highest'
                        }`}
                      />
                    ))}
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
                  <label htmlFor="restaurantName" className="field-label">Café or restaurant name</label>
                  <input
                    id="restaurantName"
                    value={form.restaurantName}
                    onChange={e => set('restaurantName', e.target.value)}
                    className="input-field"
                    placeholder="Meridian Coffee"
                  />
                </div>

                <div>
                  <span className="field-label">Team size</span>
                  <div className="grid grid-cols-4 gap-1.5 mt-1.5">
                    {TEAM_SIZES.map(s => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => set('teamSize', s)}
                        className={`mono py-2.5 rounded-[10px] text-[12.5px] font-semibold border-none cursor-pointer transition-all ${
                          form.teamSize === s
                            ? 'bg-surface-lowest text-on-surface shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]'
                            : 'bg-surface-highest text-on-surface-muted'
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
                    {ROLES.map(r => (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => set('role', r.id)}
                        className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl text-left border-none cursor-pointer w-full transition-all ${
                          form.role === r.id
                            ? 'bg-surface-lowest shadow-[inset_0_0_0_2px_var(--color-primary-fixed)]'
                            : 'bg-surface-highest'
                        }`}
                      >
                        {/* Radio dot */}
                        <div className={`w-4 h-4 rounded-full grid place-items-center shrink-0 transition-colors ${
                          form.role === r.id ? 'bg-primary' : 'bg-surface-high'
                        }`}>
                          {form.role === r.id && (
                            <div className="w-1.5 h-1.5 rounded-full bg-on-primary" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="title-sm text-[13px]">{r.label}</div>
                          <div className="label-sm normal-case tracking-normal text-[10px]">{r.sub}</div>
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
                    {loading ? 'Creating account…' : 'Start free trial'}
                    {!loading && <Sparkles size={15} />}
                  </button>
                </div>
              </form>
            )}

            <p className="body-sm text-center mt-5 text-on-surface-muted">
              Already have an account?{' '}
              <Link to="/login" className="text-primary font-semibold no-underline">
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
