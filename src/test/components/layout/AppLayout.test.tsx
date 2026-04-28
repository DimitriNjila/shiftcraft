import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import AppLayout from '@/components/layout/AppLayout';

// ── Mocks ─────────────────────────────────────────────────────
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...(actual as object),
    useNavigate: () => vi.fn(),
    Outlet: () => <div data-testid="outlet">page content</div>,
  };
});

const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

const mockUseRestaurant = vi.fn();
vi.mock('@/lib/hooks/use-restaurant', () => ({
  useRestaurant: () => mockUseRestaurant(),
}));

// ── Helpers ───────────────────────────────────────────────────
function setup() {
  mockUseAuth.mockReturnValue({ ...mockAuthValue });
  mockUseRestaurant.mockReturnValue({
    data: { id: 'r1', name: 'Test Restaurant', team_size: '6–20', onboarding_completed: true },
    status: 'success',
    refetch: vi.fn(),
  });
  return {
    user: userEvent.setup(),
    ...renderWithRouter(<AppLayout />),
  };
}

// ──────────────────────────────────────────────────────────────
describe('AppLayout', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders the sidebar', () => {
    setup();
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeInTheDocument();
  });

  it('renders the outlet', () => {
    setup();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
  });

  it('renders the mobile top bar with a menu button', () => {
    setup();
    expect(screen.getByRole('button', { name: /open navigation/i })).toBeInTheDocument();
  });

  it('shows the dark overlay when the menu button is clicked', async () => {
    const { user } = setup();
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open navigation/i }));
    expect(screen.queryByTestId('mobile-overlay')).toBeInTheDocument();
  });

  it('closes the mobile sidebar when the overlay is clicked', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /open navigation/i }));

    const overlay = screen.queryByTestId('mobile-overlay');
    expect(overlay).toBeInTheDocument();
    await user.click(overlay!);

    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
  });

  it('shows an error message when the restaurant fetch fails', () => {
    mockUseAuth.mockReturnValue({ ...mockAuthValue });
    mockUseRestaurant.mockReturnValue({
      data: undefined,
      status: 'error',
      refetch: vi.fn(),
    });
    renderWithRouter(<AppLayout />);
    expect(screen.getByText(/failed to load workspace/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('does not render the sidebar when the restaurant fetch fails', () => {
    mockUseAuth.mockReturnValue({ ...mockAuthValue });
    mockUseRestaurant.mockReturnValue({
      data: undefined,
      status: 'error',
      refetch: vi.fn(),
    });
    renderWithRouter(<AppLayout />);
    expect(screen.queryByRole('navigation', { name: /main navigation/i })).not.toBeInTheDocument();
  });
});
