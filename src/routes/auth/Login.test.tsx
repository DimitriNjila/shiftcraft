import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import LoginPage from './Login';

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
    ...renderWithRouter(<LoginPage />),
  };
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders email and password inputs', () => {
      setup();
      expect(screen.getByLabelText(/work email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    it('renders the sign-in submit button', () => {
      setup();
      expect(
        screen.getByRole('button', { name: /sign in to shiftcraft/i }),
      ).toBeInTheDocument();
    });

    it('renders a link to the signup page', () => {
      setup();
      expect(screen.getByRole('link', { name: /start a free trial/i })).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('shows an error toast when email is empty', async () => {
      const { toast } = await import('sonner');
      const { user } = setup();

      await user.click(screen.getByRole('button', { name: /sign in to shiftcraft/i }));

      expect(toast.error).toHaveBeenCalledWith('Email is required');
      expect(mockAuthValue.signIn).not.toHaveBeenCalled();
    });

    it('shows an error toast when password is empty', async () => {
      const { toast } = await import('sonner');
      const { user } = setup();

      await user.type(screen.getByLabelText(/work email/i), 'user@test.com');
      await user.click(screen.getByRole('button', { name: /sign in to shiftcraft/i }));

      expect(toast.error).toHaveBeenCalledWith('Password is required');
      expect(mockAuthValue.signIn).not.toHaveBeenCalled();
    });
  });

  describe('form submission', () => {
    it('calls signIn with the entered credentials', async () => {
      mockAuthValue.signIn.mockResolvedValue(undefined);
      const { user } = setup();

      await user.type(screen.getByLabelText(/work email/i), 'manager@cafe.com');
      await user.type(screen.getByLabelText(/password/i), 'secret123');
      await user.click(screen.getByRole('button', { name: /sign in to shiftcraft/i }));

      await waitFor(() =>
        expect(mockAuthValue.signIn).toHaveBeenCalledWith('manager@cafe.com', 'secret123'),
      );
    });

    it('navigates to /dashboard on successful sign-in', async () => {
      mockAuthValue.signIn.mockResolvedValue(undefined);
      const { user } = setup();

      await user.type(screen.getByLabelText(/work email/i), 'manager@cafe.com');
      await user.type(screen.getByLabelText(/password/i), 'secret123');
      await user.click(screen.getByRole('button', { name: /sign in to shiftcraft/i }));

      await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'));
    });

    it('shows an error toast when signIn throws', async () => {
      const { toast } = await import('sonner');
      mockAuthValue.signIn.mockRejectedValue(new Error('Invalid credentials'));
      const { user } = setup();

      await user.type(screen.getByLabelText(/work email/i), 'bad@test.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /sign in to shiftcraft/i }));

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith('Invalid credentials'),
      );
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('remember-me toggle', () => {
    it('toggles remember-me state on click', async () => {
      const { user } = setup();
      const toggle = screen.getByRole('button', { name: /keep me signed in/i });

      // Starts checked (true)
      expect(toggle.querySelector('svg')).toBeInTheDocument();

      await user.click(toggle);
      // Unchecked — no checkmark SVG inside the button
      expect(toggle.querySelector('svg')).not.toBeInTheDocument();
    });
  });
});
