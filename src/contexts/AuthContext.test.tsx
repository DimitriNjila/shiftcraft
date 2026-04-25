import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

// ── Mock the Supabase client ──────────────────────────────────
// vi.mock() is hoisted to the top of the file, so variables used inside its
// factory must be created with vi.hoisted() to avoid TDZ errors.
const {
  mockUnsubscribe,
  mockGetSession,
  mockOnAuthStateChange,
  mockSignInWithPassword,
  mockSignUp,
  mockSignOut,
} = vi.hoisted(() => ({
  mockUnsubscribe: vi.fn(),
  mockGetSession: vi.fn(),
  mockOnAuthStateChange: vi.fn(),
  mockSignInWithPassword: vi.fn(),
  mockSignUp: vi.fn(),
  mockSignOut: vi.fn(),
}));

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
    },
  },
}));

// ── Helper component to read context values ───────────────────
function AuthConsumer() {
  const { session, user, loading } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="session">{session ? 'has-session' : 'no-session'}</span>
      <span data-testid="user">{user?.email ?? 'no-user'}</span>
    </div>
  );
}

function renderAuthConsumer() {
  return render(
    <AuthProvider>
      <AuthConsumer />
    </AuthProvider>,
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no active session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
  });

  describe('initial state', () => {
    it('starts with loading=true then resolves to false', async () => {
      renderAuthConsumer();
      // Synchronously loading
      expect(screen.getByTestId('loading').textContent).toBe('true');
      // Resolves after getSession
      await waitFor(() =>
        expect(screen.getByTestId('loading').textContent).toBe('false'),
      );
    });

    it('session is null when getSession returns null', async () => {
      renderAuthConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('session').textContent).toBe('no-session'),
      );
    });

    it('session is populated when getSession returns a session', async () => {
      const fakeSession = { user: { email: 'test@example.com' }, access_token: 'tok' };
      mockGetSession.mockResolvedValue({ data: { session: fakeSession } });

      renderAuthConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('session').textContent).toBe('has-session'),
      );
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    it('subscribes to onAuthStateChange on mount and unsubscribes on unmount', async () => {
      const { unmount } = renderAuthConsumer();
      await waitFor(() =>
        expect(screen.getByTestId('loading').textContent).toBe('false'),
      );

      expect(mockOnAuthStateChange).toHaveBeenCalledOnce();
      unmount();
      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });
  });

  describe('signIn', () => {
    it('calls supabase.auth.signInWithPassword with the provided credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({ error: null });

      function SignInTrigger() {
        const { signIn } = useAuth();
        return (
          <button onClick={() => signIn('user@test.com', 'password123')}>
            Sign in
          </button>
        );
      }

      render(
        <AuthProvider>
          <SignInTrigger />
        </AuthProvider>,
      );

      await act(async () => {
        screen.getByRole('button').click();
      });

      expect(mockSignInWithPassword).toHaveBeenCalledWith({
        email: 'user@test.com',
        password: 'password123',
      });
    });

    it('throws when supabase returns an error', async () => {
      const error = new Error('Invalid credentials');
      mockSignInWithPassword.mockResolvedValue({ error });

      let caughtError: unknown;
      function SignInTrigger() {
        const { signIn } = useAuth();
        return (
          <button
            onClick={async () => {
              try { await signIn('bad@test.com', 'wrong'); }
              catch (e) { caughtError = e; }
            }}
          >
            Sign in
          </button>
        );
      }

      render(<AuthProvider><SignInTrigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(caughtError).toBe(error);
    });
  });

  describe('signUp', () => {
    it('calls supabase.auth.signUp with email, password, and full_name', async () => {
      mockSignUp.mockResolvedValue({ error: null });

      function SignUpTrigger() {
        const { signUp } = useAuth();
        return (
          <button onClick={() => signUp('new@test.com', 'pass12345678', 'Alice')}>
            Sign up
          </button>
        );
      }

      render(<AuthProvider><SignUpTrigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'pass12345678',
        options: { data: { full_name: 'Alice' } },
      });
    });

    it('throws when supabase returns an error', async () => {
      const error = new Error('Email already registered');
      mockSignUp.mockResolvedValue({ error });

      let caughtError: unknown;
      function SignUpTrigger() {
        const { signUp } = useAuth();
        return (
          <button
            onClick={async () => {
              try { await signUp('existing@test.com', 'pass', 'Bob'); }
              catch (e) { caughtError = e; }
            }}
          >
            Sign up
          </button>
        );
      }

      render(<AuthProvider><SignUpTrigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(caughtError).toBe(error);
    });
  });

  describe('signOut', () => {
    it('calls supabase.auth.signOut', async () => {
      mockSignOut.mockResolvedValue({ error: null });

      function SignOutTrigger() {
        const { signOut } = useAuth();
        return <button onClick={signOut}>Sign out</button>;
      }

      render(<AuthProvider><SignOutTrigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(mockSignOut).toHaveBeenCalledOnce();
    });
  });

  describe('useAuth outside provider', () => {
    it('throws a clear error when used outside AuthProvider', () => {
      // Suppress the expected console.error from React
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<AuthConsumer />)).toThrow(
        'useAuth must be used inside AuthProvider',
      );
      spy.mockRestore();
    });
  });
});
