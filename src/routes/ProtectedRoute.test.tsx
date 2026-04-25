import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// ── Mock AuthContext ──────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// ── Mock supabase so the import doesn't throw ─────────────────
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: vi.fn(), onAuthStateChange: vi.fn() } },
}));

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Routes>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Protected content</div>} />
        </Route>
        <Route path="/signup" element={<div>Signup page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('shows a loading spinner while auth is resolving', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: true });
    const { container } = renderProtectedRoute();
    // LoadingSpinner renders an SVG (Loader2 icon)
    expect(container.querySelector('svg')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('redirects to /signup when there is no session', () => {
    mockUseAuth.mockReturnValue({ session: null, loading: false });
    renderProtectedRoute();
    expect(screen.getByText('Signup page')).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('renders the outlet when a session exists', () => {
    mockUseAuth.mockReturnValue({
      session: { user: { email: 'a@b.com' }, access_token: 'tok' },
      loading: false,
    });
    renderProtectedRoute();
    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });
});
