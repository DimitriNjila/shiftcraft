import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import SchedulesPage from '@/routes/schedules/index';
import type { Schedule, Shift } from '@/lib/types/schedule';
import type { Employee } from '@/lib/types/employee';

// ── Mocks ─────────────────────────────────────────────────────

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock('@/lib/hooks/use-restaurant', () => ({
  useRestaurant: () => ({
    data: { id: 'r1', name: 'Test Café', onboarding_completed: true },
  }),
}));

const mockUseWeekSchedule = vi.fn();
const mockMutate = vi.fn();

vi.mock('@/lib/hooks/use-schedules', () => ({
  useWeekSchedule: () => mockUseWeekSchedule(),
  useSchedules: () => ({ data: [], status: 'success' }),
  useGenerateSchedule: () => ({ mutate: mockMutate, isPending: false }),
}));

vi.mock('@/lib/hooks/use-analysis', () => ({
  useAnalyzeSchedule: () => ({ mutate: mockMutate, isPending: false, isError: false, data: undefined, reset: vi.fn() }),
}));

vi.mock('@/lib/hooks/use-employees', () => ({
  useEmployees: () => ({ data: EMPLOYEES }),
}));

vi.mock('@/lib/hooks/use-shifts', () => ({
  useCreateShift: () => ({ mutate: mockMutate, isPending: false }),
  useUpdateShift: () => ({ mutate: mockMutate, isPending: false }),
  useDeleteShift: () => ({ mutate: mockMutate, isPending: false }),
}));

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@dnd-kit/core')>();
  return {
    ...actual,
    DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

// ── Fixtures ──────────────────────────────────────────────────

const EMPLOYEES: Employee[] = [
  {
    id: 'e1',
    name: 'Alice Smith',
    role: 'Server',
    is_active: true,
    restaurant_id: 'r1',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'e2',
    name: 'Bob Jones',
    role: 'Cook',
    is_active: true,
    restaurant_id: 'r1',
    created_at: '',
    updated_at: '',
  },
];

const SHIFT: Shift = {
  id: 'sh1',
  schedule_id: 's1',
  employee_id: 'e1',
  shift_date: '2026-04-27',
  start_time: '09:00:00',
  end_time: '17:00:00',
  duration_hours: 8,
  notes: '',
  created_at: '',
  updated_at: '',
};

const SCHEDULE: Schedule = {
  id: 's1',
  week_start: '2026-04-27',
  restaurant_id: 'r1',
  total_shifts: 1,
  total_hours: 8,
  shifts: [SHIFT],
};

// ── Helpers ───────────────────────────────────────────────────

function withSchedule(overrides: Partial<typeof SCHEDULE> = {}) {
  mockUseWeekSchedule.mockReturnValue({
    schedule: { ...SCHEDULE, ...overrides },
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  });
}

function loading() {
  mockUseWeekSchedule.mockReturnValue({
    schedule: undefined,
    isLoading: true,
    error: null,
    refetch: vi.fn(),
  });
}

function errored() {
  mockUseWeekSchedule.mockReturnValue({
    schedule: undefined,
    isLoading: false,
    error: new Error('fetch failed'),
    refetch: vi.fn(),
  });
}

// ── Tests ─────────────────────────────────────────────────────

describe('SchedulesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('loading', () => {
    it('does not render the grid while loading', () => {
      loading();
      renderWithRouter(<SchedulesPage />);
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
    });
  });

  describe('error', () => {
    it('shows an error message', () => {
      errored();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByText(/failed to load schedule/i)).toBeInTheDocument();
    });

    it('shows a retry button', () => {
      errored();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('grid', () => {
    it('renders a row for each active employee', () => {
      withSchedule({ shifts: [] });
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
    });

    it('renders the 7 day column headers', () => {
      withSchedule({ shifts: [] });
      renderWithRouter(<SchedulesPage />);
      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      days.forEach((d) => expect(screen.getByText(d)).toBeInTheDocument());
    });

    it('renders a shift card for an existing shift', () => {
      withSchedule();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByRole('button', { name: /edit shift/i })).toBeInTheDocument();
    });
  });

  describe('shift modal', () => {
    it('opens the add shift modal when an empty cell is clicked', async () => {
      withSchedule({ shifts: [] });
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);

      const addBtn = screen.getAllByRole('button', { name: /add shift for/i })[0];
      await user.click(addBtn);

      expect(screen.getByRole('dialog', { name: /add shift/i })).toBeInTheDocument();
    });

    it('opens the edit shift modal when a shift card is clicked', async () => {
      withSchedule();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);

      await user.click(screen.getByRole('button', { name: /edit shift/i }));
      expect(screen.getByRole('dialog', { name: /edit shift/i })).toBeInTheDocument();
    });

    it('closes the shift modal on cancel', async () => {
      withSchedule({ shifts: [] });
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);

      await user.click(screen.getAllByRole('button', { name: /add shift for/i })[0]);
      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('delete shift', () => {
    it('opens the confirm modal when delete is clicked on a shift', async () => {
      withSchedule();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);

      const shiftCard = screen.getByRole('button', { name: /edit shift/i });
      await user.hover(shiftCard);
      const deleteBtn = screen.getByRole('button', { name: /delete shift/i });
      await user.click(deleteBtn);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/permanently removed/i)).toBeInTheDocument();
    });
  });

  describe('week navigation', () => {
    it('renders prev and next week buttons', () => {
      withSchedule({ shifts: [] });
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByRole('button', { name: /previous week/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next week/i })).toBeInTheDocument();
    });

    it('shows the "Today" button when not on the current week', () => {
      withSchedule({ shifts: [] });
      renderWithRouter(<SchedulesPage />, { initialEntries: ['/schedules?week=2025-01-06'] });
      expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    });
  });
});
