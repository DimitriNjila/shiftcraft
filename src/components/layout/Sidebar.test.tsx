import { screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import { Sidebar, type SidebarProps } from './Sidebar';

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

// ── Helpers ───────────────────────────────────────────────────
const defaultProps: SidebarProps = {
  collapsed: false,
  onToggleCollapse: vi.fn(),
  mobileOpen: false,
  onMobileClose: vi.fn(),
};

function setup(props: Partial<SidebarProps> = {}) {
  mockUseAuth.mockReturnValue({ ...mockAuthValue });
  return {
    user: userEvent.setup(),
    ...renderWithRouter(<Sidebar {...defaultProps} {...props} />),
  };
}

// ──────────────────────────────────────────────────────────────
describe('Sidebar', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('rendering', () => {
    it('renders the brand name and logo', () => {
      setup();
      expect(screen.getByText('Shiftcraft')).toBeInTheDocument();
    });

    it('renders all five nav items', () => {
      setup();
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /employees/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /schedules/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /templates/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
    });

    it('nav links point to the correct routes', () => {
      setup();
      expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
      expect(screen.getByRole('link', { name: /employees/i })).toHaveAttribute('href', '/employees');
      expect(screen.getByRole('link', { name: /schedules/i })).toHaveAttribute('href', '/schedules');
      expect(screen.getByRole('link', { name: /templates/i })).toHaveAttribute('href', '/templates');
      expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute('href', '/settings');
    });

    it('renders a sign-out button', () => {
      setup();
      expect(screen.getByRole('button', { name: /sign out/i })).toBeInTheDocument();
    });
  });

  describe('user display', () => {
    it('shows initials derived from full_name', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthValue,
        user: { email: 'elena@test.com', user_metadata: { full_name: 'Elena Kovač' } },
      });
      renderWithRouter(<Sidebar {...defaultProps} />);
      expect(screen.getByText('EK')).toBeInTheDocument();
    });

    it('shows the first letter of email when full_name is absent', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthValue,
        user: { email: 'alice@test.com', user_metadata: {} },
      });
      renderWithRouter(<Sidebar {...defaultProps} />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('renders the user email', () => {
      mockUseAuth.mockReturnValue({
        ...mockAuthValue,
        user: { email: 'elena@meridian.co', user_metadata: { full_name: 'Elena' } },
      });
      renderWithRouter(<Sidebar {...defaultProps} />);
      expect(screen.getByText('elena@meridian.co')).toBeInTheDocument();
    });
  });

  describe('collapse behaviour', () => {
    it('hides nav labels in rail mode', () => {
      setup({ collapsed: true });
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Employees')).not.toBeInTheDocument();
    });

    it('calls onToggleCollapse when the collapse button is clicked', async () => {
      const onToggleCollapse = vi.fn();
      const { user } = setup({ collapsed: false, onToggleCollapse });
      await user.click(screen.getByRole('button', { name: /collapse sidebar/i }));
      expect(onToggleCollapse).toHaveBeenCalledOnce();
    });

    it('shows the expand button in rail mode', () => {
      setup({ collapsed: true });
      expect(screen.getByRole('button', { name: /expand sidebar/i })).toBeInTheDocument();
    });
  });

  describe('mobile', () => {
    it('calls onMobileClose when the close button is clicked', async () => {
      const onMobileClose = vi.fn();
      const { user } = setup({ mobileOpen: true, onMobileClose });
      await user.click(screen.getByRole('button', { name: /close navigation/i }));
      expect(onMobileClose).toHaveBeenCalledOnce();
    });

    it('calls onMobileClose when a nav link is clicked', async () => {
      const onMobileClose = vi.fn();
      const { user } = setup({ mobileOpen: true, onMobileClose });
      await user.click(screen.getByRole('link', { name: /employees/i }));
      expect(onMobileClose).toHaveBeenCalled();
    });
  });

  describe('sign out', () => {
    it('calls signOut and navigates to /login', async () => {
      const signOut = vi.fn().mockResolvedValue(undefined);
      mockUseAuth.mockReturnValue({ ...mockAuthValue, signOut });

      renderWithRouter(<Sidebar {...defaultProps} />);

      await act(async () => {
        screen.getByRole('button', { name: /sign out/i }).click();
      });

      expect(signOut).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
