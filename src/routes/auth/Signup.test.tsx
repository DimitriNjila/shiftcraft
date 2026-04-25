import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import SignupPage from './Signup';

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

/** Fills in step 1 and advances to step 2. */
async function fillStep1AndAdvance(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), 'Elena Kovač');
  await user.type(screen.getByLabelText(/work email/i), 'elena@meridian.co');
  await user.type(screen.getByLabelText(/password/i), 'supersecure1234');
  await user.click(screen.getByRole('button', { name: /continue/i }));
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('step 1 — credentials', () => {
    it('renders the three credential fields', () => {
      setup();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders two step-indicator bars', () => {
      const { container } = setup();
      // Both step bars present in the DOM
      const bars = container.querySelectorAll('.h-\\[3px\\]');
      expect(bars.length).toBeGreaterThanOrEqual(2);
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
      await user.type(screen.getByLabelText(/work email/i), 'alice@test.com');
      await user.type(screen.getByLabelText(/password/i), 'short');
      await user.click(screen.getByRole('button', { name: /continue/i }));

      expect(toast.error).toHaveBeenCalledWith(
        'Password must be at least 10 characters',
      );
    });

    it('does not call signUp on step 1 submit', async () => {
      const { user } = setup();
      await fillStep1AndAdvance(user);
      expect(mockAuthValue.signUp).not.toHaveBeenCalled();
    });
  });

  describe('step 2 — café details', () => {
    it('advances to step 2 with valid step 1 data', async () => {
      const { user } = setup();
      await fillStep1AndAdvance(user);

      expect(screen.getByLabelText(/café or restaurant name/i)).toBeInTheDocument();
    });

    it('renders team size options', async () => {
      const { user } = setup();
      await fillStep1AndAdvance(user);

      expect(screen.getByRole('button', { name: '1–5' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '6–20' })).toBeInTheDocument();
    });

    it('renders role options', async () => {
      const { user } = setup();
      await fillStep1AndAdvance(user);

      expect(screen.getByRole('button', { name: /general manager/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /owner \/ founder/i })).toBeInTheDocument();
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

      await user.type(
        screen.getByLabelText(/café or restaurant name/i),
        'Meridian Coffee',
      );
      await user.click(screen.getByRole('button', { name: /start free trial/i }));

      await waitFor(() =>
        expect(mockAuthValue.signUp).toHaveBeenCalledWith(
          'elena@meridian.co',
          'supersecure1234',
          'Elena Kovač',
        ),
      );
    });

    it('navigates to /login after successful sign-up', async () => {
      mockAuthValue.signUp.mockResolvedValue(undefined);
      const { user } = setup();
      await fillStep1AndAdvance(user);

      await user.type(
        screen.getByLabelText(/café or restaurant name/i),
        'Meridian Coffee',
      );
      await user.click(screen.getByRole('button', { name: /start free trial/i }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/login'));
    });

    it('shows an error toast when signUp throws', async () => {
      const { toast } = await import('sonner');
      mockAuthValue.signUp.mockRejectedValue(new Error('Email already registered'));
      const { user } = setup();
      await fillStep1AndAdvance(user);

      await user.type(
        screen.getByLabelText(/café or restaurant name/i),
        'My Café',
      );
      await user.click(screen.getByRole('button', { name: /start free trial/i }));

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Email already registered'),
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});
