import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import AppLayout from './AppLayout';

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

// ── Helpers ───────────────────────────────────────────────────
function setup() {
  mockUseAuth.mockReturnValue({ ...mockAuthValue });
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
    // No overlay before opening
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open navigation/i }));
    // Overlay appears after opening
    expect(screen.queryByTestId('mobile-overlay')).toBeInTheDocument();
  });

  it('closes the mobile sidebar when the overlay is clicked', async () => {
    const { user } = setup();
    await user.click(screen.getByRole('button', { name: /open navigation/i }));

    const overlay = screen.queryByTestId('mobile-overlay');
    expect(overlay).toBeInTheDocument();
    await user.click(overlay!);

    // Overlay removed once sidebar closes
    expect(screen.queryByTestId('mobile-overlay')).not.toBeInTheDocument();
  });
});
