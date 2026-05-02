import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import EmployeesPage from '@/routes/employees/index';
import type { Employee } from '@/lib/types/employee';

// ── Mocks ─────────────────────────────────────────────────────
const mockUseAuth = vi.fn();
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

// Mock Supabase (used by useRestaurant)
vi.mock('@/lib/supabase', () => ({
  supabase: { auth: { getSession: vi.fn() } },
}));

// ── Hook mocks ────────────────────────────────────────────────
const mockUseRestaurant = vi.fn();
vi.mock('@/lib/hooks/use-restaurant', () => ({
  useRestaurant: () => mockUseRestaurant(),
}));

const mockCreate = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

const mockUseEmployees = vi.fn();
vi.mock('@/lib/hooks/use-employees', () => ({
  useEmployees: () => mockUseEmployees(),
  useCreateEmployee: () => ({ mutate: mockCreate, isPending: false }),
  useUpdateEmployee: () => ({ mutate: mockUpdate, isPending: false }),
  useDeleteEmployee: () => ({ mutate: mockDelete, isPending: false }),
}));

// ── Sample data ───────────────────────────────────────────────
const RESTAURANT = { id: 'rest-1', name: 'Meridian Coffee', team_size: '6–20' };

const EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Elena Kovač',
    role: 'Server',
    salary: 32000,
    max_hours_per_week: 38,
    is_active: true,
    restaurant_id: 'rest-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'emp-2',
    name: 'Marco Ricci',
    role: 'Cook',
    salary: 28000,
    max_hours_per_week: 40,
    is_active: true,
    restaurant_id: 'rest-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

// ── Helpers ───────────────────────────────────────────────────
function setup() {
  mockUseAuth.mockReturnValue({ ...mockAuthValue });
  return {
    user: userEvent.setup(),
    ...renderWithRouter(<EmployeesPage />),
  };
}

// ──────────────────────────────────────────────────────────────
describe('EmployeesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRestaurant.mockReturnValue({ data: RESTAURANT, isLoading: false });
    mockUseEmployees.mockReturnValue({ data: EMPLOYEES, isLoading: false, error: null, refetch: vi.fn() });
  });

  describe('loading state', () => {
    it('renders skeleton cards while loading', () => {
      mockUseEmployees.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: vi.fn() });
      setup();
      expect(screen.getByLabelText('Loading employees')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows an error message when the query fails', () => {
      mockUseEmployees.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch: vi.fn(),
      });
      setup();
      expect(screen.getByText('Failed to load employees')).toBeInTheDocument();
    });

    it('calls refetch when the retry button is clicked', async () => {
      const refetch = vi.fn();
      mockUseEmployees.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
        refetch,
      });
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /try again/i }));
      expect(refetch).toHaveBeenCalledOnce();
    });
  });

  describe('empty state', () => {
    it('shows empty state when there are no employees', () => {
      mockUseEmployees.mockReturnValue({ data: [], isLoading: false, error: null, refetch: vi.fn() });
      setup();
      expect(screen.getByText('No employees yet')).toBeInTheDocument();
    });
  });

  describe('employee list', () => {
    it('renders a card for each employee', () => {
      setup();
      expect(screen.getByText('Elena Kovač')).toBeInTheDocument();
      expect(screen.getByText('Marco Ricci')).toBeInTheDocument();
    });

    it('filters employees by name when searching', async () => {
      const { user } = setup();
      await user.type(screen.getByRole('searchbox', { name: /search/i }), 'Elena');
      expect(screen.getByText('Elena Kovač')).toBeInTheDocument();
      expect(screen.queryByText('Marco Ricci')).not.toBeInTheDocument();
    });

    it('shows a "no results" empty state when search finds nothing', async () => {
      const { user } = setup();
      await user.type(screen.getByRole('searchbox', { name: /search/i }), 'zzz');
      expect(screen.getByText('No results')).toBeInTheDocument();
    });
  });

  describe('create employee', () => {
    it('opens the modal when "Add employee" is clicked', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /add employee/i }));
      expect(screen.getByText('Add to your team')).toBeInTheDocument();
    });

    it('calls createEmployee.mutate with the correct payload', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /add employee/i }));
      const dialog = screen.getByRole('dialog');
      await user.type(within(dialog).getByLabelText(/full name/i), 'Sam Lee');
      await user.click(within(dialog).getByRole('button', { name: /add employee/i }));

      await waitFor(() =>
        expect(mockCreate).toHaveBeenCalledWith(
          { name: 'Sam Lee', role: 'Server', restaurant_id: 'rest-1', salary: 30000, max_hours_per_week: 40 },
          expect.any(Object),
        ),
      );
    });
  });

  describe('edit employee', () => {
    it('opens the modal pre-filled when the edit button is clicked', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /edit elena kovač/i }));
      expect(screen.getByText('Update details')).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toHaveValue('Elena Kovač');
    });
  });

  describe('delete employee', () => {
    it('shows a confirmation modal when the delete button is clicked', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /delete elena kovač/i }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Remove employee')).toBeInTheDocument();
      expect(within(dialog).getByText(/Remove Elena Kovač from your team/)).toBeInTheDocument();
    });

    it('calls deleteEmployee.mutate when confirmed', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /delete elena kovač/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^remove$/i }));
      expect(mockDelete).toHaveBeenCalledWith('emp-1', expect.any(Object));
    });

    it('closes the modal when Cancel is clicked', async () => {
      const { user } = setup();
      await user.click(screen.getByRole('button', { name: /delete elena kovač/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: /^cancel$/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
