import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import SignupPage, {
  getPasswordCriteria,
  getPasswordStrength,
} from '@/routes/auth/Signup';

// ── Mocks ─────────────────────────────────────────────────────
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => mockNavigate };
});

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
  Toaster: () => null,
}));

vi.mock('@/lib/supabase', () => ({
  supabase: { auth: {} },
}));

// ── Helpers ───────────────────────────────────────────────────
function setup() {
  mockUseAuth.mockReturnValue({ ...mockAuthValue });
  return {
    user: userEvent.setup(),
    ...renderWithRouter(<SignupPage />),
  };
}

const VALID_PASSWORD = 'Secure@Pass1';

/** Fills valid step-1 data and clicks Continue. */
async function fillStep1AndAdvance(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), 'Elena Kovač');
  await user.type(screen.getByLabelText(/work email/i), 'elena@meridian.co');
  await user.type(screen.getByLabelText(/^password$/i), VALID_PASSWORD);
  await user.type(screen.getByLabelText(/confirm password/i), VALID_PASSWORD);
  await user.click(screen.getByRole('button', { name: /continue/i }));
}

// ──────────────────────────────────────────────────────────────
describe('getPasswordCriteria', () => {
  it('returns all false for an empty string', () => {
    const c = getPasswordCriteria('');
    expect(Object.values(c).every(v => v === false)).toBe(true);
  });

  it('detects length >= 10', () => {
    expect(getPasswordCriteria('abcdefghij').length).toBe(true);
    expect(getPasswordCriteria('short').length).toBe(false);
  });

  it('detects uppercase', () => {
    expect(getPasswordCriteria('A').uppercase).toBe(true);
    expect(getPasswordCriteria('abc').uppercase).toBe(false);
  });

  it('detects lowercase', () => {
    expect(getPasswordCriteria('a').lowercase).toBe(true);
    expect(getPasswordCriteria('ABC').lowercase).toBe(false);
  });

  it('detects numbers', () => {
    expect(getPasswordCriteria('1').number).toBe(true);
    expect(getPasswordCriteria('abc').number).toBe(false);
  });

  it('detects special characters', () => {
    expect(getPasswordCriteria('!').special).toBe(true);
    expect(getPasswordCriteria('abc123').special).toBe(false);
  });
});

describe('getPasswordStrength', () => {
  it('returns 0 for an empty password', () => {
    expect(getPasswordStrength('')).toBe(0);
  });

  it('returns 1 for a password meeting only 1 criterion', () => {
    expect(getPasswordStrength('abc')).toBe(1); // lowercase only
  });

  it('returns 2 for a password meeting 2 criteria', () => {
    expect(getPasswordStrength('abcABC')).toBe(2); // lower + upper
  });

  it('returns 3 for a password meeting 3 criteria', () => {
    expect(getPasswordStrength('abcABC123')).toBe(3); // lower + upper + number
  });

  it('returns 4 for a password meeting 4+ criteria', () => {
    expect(getPasswordStrength('abcABC123!')).toBe(4); // all four
    expect(getPasswordStrength(VALID_PASSWORD)).toBe(4);
  });
});

// ──────────────────────────────────────────────────────────────
describe('SignupPage — step 1: credentials', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders name, email, password, and confirm-password fields', () => {
    setup();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  it('shows an error toast when full name is empty', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Full name is required');
  });

  it('shows an error toast when password is too short', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'Alice');
    await user.type(screen.getByLabelText(/work email/i), 'a@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Short1!');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Password must be at least 10 characters');
  });

  it('shows an error toast when password has no uppercase letter', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'Alice');
    await user.type(screen.getByLabelText(/work email/i), 'a@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'nouppercase1!');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Password must contain an uppercase letter');
  });

  it('shows an error toast when password has no lowercase letter', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'Alice');
    await user.type(screen.getByLabelText(/work email/i), 'a@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'NOLOWERCASE1!');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Password must contain a lowercase letter');
  });

  it('shows an error toast when password has no number', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'Alice');
    await user.type(screen.getByLabelText(/work email/i), 'a@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'NoNumbers!!!');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Password must contain a number');
  });

  it('shows an error toast when password has no special character', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'Alice');
    await user.type(screen.getByLabelText(/work email/i), 'a@test.com');
    await user.type(screen.getByLabelText(/^password$/i), 'NoSpecial1234');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Password must contain a special character');
  });

  it('shows an error toast when passwords do not match', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await user.type(screen.getByLabelText(/full name/i), 'Alice');
    await user.type(screen.getByLabelText(/work email/i), 'a@test.com');
    await user.type(screen.getByLabelText(/^password$/i), VALID_PASSWORD);
    await user.type(screen.getByLabelText(/confirm password/i), 'Different@Pass1');
    await user.click(screen.getByRole('button', { name: /continue/i }));
    expect(toast.error).toHaveBeenCalledWith('Passwords do not match');
  });

  it('advances to step 2 when all step-1 data is valid', async () => {
    const { user } = setup();
    await fillStep1AndAdvance(user);
    expect(screen.getByLabelText(/café or restaurant name/i)).toBeInTheDocument();
  });

  it('does not call signUp on step-1 submit', async () => {
    const { user } = setup();
    await fillStep1AndAdvance(user);
    expect(mockAuthValue.signUp).not.toHaveBeenCalled();
  });

  describe('strength meter', () => {
    it('shows criteria pills once the user starts typing', async () => {
      const { user } = setup();
      expect(screen.queryByText('10+ chars')).not.toBeInTheDocument();
      await user.type(screen.getByLabelText(/^password$/i), 'a');
      expect(screen.getByText('10+ chars')).toBeInTheDocument();
    });

    it('marks a criterion as met when the condition is satisfied', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/^password$/i), 'A');
      // "A–Z" pill should appear as met (Check icon present alongside label)
      const pill = screen.getByText('A–Z').closest('span')!;
      expect(pill.className).toContain('bg-primary-fixed');
    });
  });

  describe('confirm-password match indicator', () => {
    it('shows a checkmark when passwords match', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/^password$/i), VALID_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), VALID_PASSWORD);

      const confirmWrapper = screen.getByLabelText(/confirm password/i).parentElement!;
      expect(confirmWrapper.querySelector('svg')).toBeInTheDocument();
    });

    it('shows an X when passwords do not match', async () => {
      const { user } = setup();
      await user.type(screen.getByLabelText(/^password$/i), VALID_PASSWORD);
      await user.type(screen.getByLabelText(/confirm password/i), 'wrong');

      const confirmWrapper = screen.getByLabelText(/confirm password/i).parentElement!;
      expect(confirmWrapper.querySelector('svg')).toBeInTheDocument();
    });
  });
});

describe('SignupPage — step 2: café details', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders restaurant name, team size, and role fields', async () => {
    const { user } = setup();
    await fillStep1AndAdvance(user);
    expect(screen.getByLabelText(/café or restaurant name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '1–5' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /general manager/i })).toBeInTheDocument();
  });

  it('goes back to step 1 when Back is clicked', async () => {
    const { user } = setup();
    await fillStep1AndAdvance(user);
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
  });

  it('shows an error toast when restaurant name is empty', async () => {
    const { toast } = await import('sonner');
    const { user } = setup();
    await fillStep1AndAdvance(user);
    await user.click(screen.getByRole('button', { name: /start free trial/i }));
    expect(toast.error).toHaveBeenCalledWith('Restaurant name is required');
    expect(mockAuthValue.signUp).not.toHaveBeenCalled();
  });

  it('calls signUp with the correct credentials', async () => {
    mockAuthValue.signUp.mockResolvedValue(undefined);
    const { user } = setup();
    await fillStep1AndAdvance(user);
    await user.type(screen.getByLabelText(/café or restaurant name/i), 'Meridian Coffee');
    await user.click(screen.getByRole('button', { name: /start free trial/i }));

    await waitFor(() =>
      expect(mockAuthValue.signUp).toHaveBeenCalledWith(
        'elena@meridian.co',
        VALID_PASSWORD,
        'Elena Kovač',
        { name: 'Meridian Coffee', teamSize: '6–20', role: 'gm' },
      ),
    );
  });

  it('navigates to /login after successful sign-up', async () => {
    mockAuthValue.signUp.mockResolvedValue(undefined);
    const { user } = setup();
    await fillStep1AndAdvance(user);
    await user.type(screen.getByLabelText(/café or restaurant name/i), 'Meridian Coffee');
    await user.click(screen.getByRole('button', { name: /start free trial/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
  });

  it('shows an error toast when signUp throws', async () => {
    const { toast } = await import('sonner');
    mockAuthValue.signUp.mockRejectedValue(new Error('Email already registered'));
    const { user } = setup();
    await fillStep1AndAdvance(user);
    await user.type(screen.getByLabelText(/café or restaurant name/i), 'My Café');
    await user.click(screen.getByRole('button', { name: /start free trial/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith('Email already registered'),
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
