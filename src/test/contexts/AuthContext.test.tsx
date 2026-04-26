import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

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
  mockUpdateUser,
  mockResetPasswordForEmail,
  mockInsert,
  mockFrom,
} = vi.hoisted(() => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });
  return {
    mockUnsubscribe: vi.fn(),
    mockGetSession: vi.fn(),
    mockOnAuthStateChange: vi.fn(),
    mockSignInWithPassword: vi.fn(),
    mockSignUp: vi.fn(),
    mockSignOut: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockResetPasswordForEmail: vi.fn(),
    mockInsert,
    mockFrom,
  };
});

vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      updateUser: mockUpdateUser,
      resetPasswordForEmail: mockResetPasswordForEmail,
    },
    from: mockFrom,
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

/** Captures the onAuthStateChange callback so tests can fire fake events. */
function captureAuthStateChangeCallback() {
  let capturedCallback: Parameters<typeof mockOnAuthStateChange>[0] | null = null;
  mockOnAuthStateChange.mockImplementation((cb) => {
    capturedCallback = cb;
    return { data: { subscription: { unsubscribe: mockUnsubscribe } } };
  });
  return () => capturedCallback!;
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: no active session
    mockGetSession.mockResolvedValue({ data: { session: null } });
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } },
    });
    mockUpdateUser.mockResolvedValue({ error: null });
    mockInsert.mockResolvedValue({ error: null });
  });

  describe('initial state', () => {
    it('starts with loading=true then resolves to false', async () => {
      renderAuthConsumer();
      expect(screen.getByTestId('loading').textContent).toBe('true');
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
    it('stores credentials and full_name in metadata (no restaurantData)', async () => {
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

    it('stores restaurant data and onboarding_pending flag in metadata', async () => {
      mockSignUp.mockResolvedValue({ error: null });

      function SignUpTrigger() {
        const { signUp } = useAuth();
        return (
          <button
            onClick={() =>
              signUp('new@test.com', 'pass12345678', 'Alice', {
                name: 'Meridian Coffee',
                teamSize: '6–20',
                role: 'gm',
              })
            }
          >
            Sign up
          </button>
        );
      }

      render(<AuthProvider><SignUpTrigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@test.com',
        password: 'pass12345678',
        options: {
          data: {
            full_name: 'Alice',
            restaurant_name: 'Meridian Coffee',
            team_size: '6–20',
            role: 'gm',
            onboarding_pending: true,
          },
        },
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

  describe('onboarding provisioning', () => {
    it('inserts restaurant row on first SIGNED_IN when onboarding_pending is true', async () => {
      const getCallback = captureAuthStateChangeCallback();
      renderAuthConsumer();
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      const fakeSession = {
        user: {
          id: 'user-123',
          email: 'elena@meridian.co',
          user_metadata: {
            full_name: 'Elena',
            restaurant_name: 'Meridian Coffee',
            team_size: '6–20',
            role: 'gm',
            onboarding_pending: true,
          },
        },
      };

      await act(async () => {
        await getCallback()('SIGNED_IN', fakeSession as never);
      });

      expect(mockFrom).toHaveBeenCalledWith('restaurants');
      expect(mockInsert).toHaveBeenCalledWith({
        name: 'Meridian Coffee',
        team_size: '6–20',
        owner_id: 'user-123',
      });
      expect(mockUpdateUser).toHaveBeenCalledWith({
        data: { onboarding_pending: null },
      });
    });

    it('does not insert restaurant row when onboarding_pending is absent', async () => {
      const getCallback = captureAuthStateChangeCallback();
      renderAuthConsumer();
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      const fakeSession = {
        user: {
          id: 'user-456',
          email: 'returning@test.com',
          user_metadata: { full_name: 'Bob' },
        },
      };

      await act(async () => {
        await getCallback()('SIGNED_IN', fakeSession as never);
      });

      expect(mockFrom).not.toHaveBeenCalled();
      expect(mockUpdateUser).not.toHaveBeenCalled();
    });

    it('skips updateUser when the restaurant insert fails', async () => {
      mockInsert.mockResolvedValueOnce({ error: new Error('DB error') });
      const getCallback = captureAuthStateChangeCallback();
      renderAuthConsumer();
      await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('false'));

      const fakeSession = {
        user: {
          id: 'user-789',
          email: 'elena@meridian.co',
          user_metadata: {
            restaurant_name: 'Meridian Coffee',
            team_size: '6–20',
            onboarding_pending: true,
          },
        },
      };

      await act(async () => {
        await getCallback()('SIGNED_IN', fakeSession as never);
      });

      expect(mockInsert).toHaveBeenCalledOnce();
      expect(mockUpdateUser).not.toHaveBeenCalled();
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

  describe('resetPassword', () => {
    it('calls supabase.auth.resetPasswordForEmail with the email', async () => {
      mockResetPasswordForEmail.mockResolvedValue({ error: null });

      function Trigger() {
        const { resetPassword } = useAuth();
        return (
          <button onClick={() => resetPassword('user@test.com')}>Reset</button>
        );
      }

      render(<AuthProvider><Trigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('throws when supabase returns an error', async () => {
      const error = new Error('Rate limit exceeded');
      mockResetPasswordForEmail.mockResolvedValue({ error });

      let caughtError: unknown;
      function Trigger() {
        const { resetPassword } = useAuth();
        return (
          <button
            onClick={async () => {
              try { await resetPassword('user@test.com'); }
              catch (e) { caughtError = e; }
            }}
          >
            Reset
          </button>
        );
      }

      render(<AuthProvider><Trigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(caughtError).toBe(error);
    });
  });

  describe('updatePassword', () => {
    it('calls supabase.auth.updateUser with the new password', async () => {
      mockUpdateUser.mockResolvedValue({ error: null });

      function Trigger() {
        const { updatePassword } = useAuth();
        return (
          <button onClick={() => updatePassword('NewPass@123')}>Update</button>
        );
      }

      render(<AuthProvider><Trigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'NewPass@123' });
    });

    it('throws when supabase returns an error', async () => {
      const error = new Error('Session expired');
      mockUpdateUser.mockResolvedValue({ error });

      let caughtError: unknown;
      function Trigger() {
        const { updatePassword } = useAuth();
        return (
          <button
            onClick={async () => {
              try { await updatePassword('NewPass@123'); }
              catch (e) { caughtError = e; }
            }}
          >
            Update
          </button>
        );
      }

      render(<AuthProvider><Trigger /></AuthProvider>);
      await act(async () => { screen.getByRole('button').click(); });

      expect(caughtError).toBe(error);
    });
  });

  describe('useAuth outside provider', () => {
    it('throws a clear error when used outside AuthProvider', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => render(<AuthConsumer />)).toThrow(
        'useAuth must be used inside AuthProvider',
      );
      spy.mockRestore();
    });
  });
});
