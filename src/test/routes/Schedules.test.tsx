import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithRouter, mockAuthValue } from '@/test/utils';
import SchedulesPage from '@/routes/schedules/index';
import type { Schedule } from '@/lib/types/schedule';

// ── Mocks ─────────────────────────────────────────────────────

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...(actual as object), useNavigate: () => vi.fn() };
});

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockAuthValue,
}));

vi.mock('@/lib/hooks/use-restaurant', () => ({
  useRestaurant: () => ({
    data: { id: 'r1', name: 'Test Café', onboarding_completed: true },
  }),
}));

const mockUseSchedules = vi.fn();
const mockMutate = vi.fn();

vi.mock('@/lib/hooks/use-schedules', () => ({
  useSchedules: () => mockUseSchedules(),
  useCreateSchedule: () => ({ mutate: mockMutate, isPending: false }),
  useDeleteSchedule: () => ({ mutate: mockMutate, isPending: false }),
}));

// ── Fixtures ──────────────────────────────────────────────────

const SCHEDULES: Schedule[] = [
  {
    id: 's1',
    week_start: '2026-03-17',
    restaurant_id: 'r1',
    total_shifts: 12,
    total_hours: 96,
  },
  {
    id: 's2',
    week_start: '2026-03-24',
    restaurant_id: 'r1',
    total_shifts: 8,
    total_hours: 64,
  },
];

// ── Helpers ───────────────────────────────────────────────────

function idle(overrides: Partial<Schedule>[] = []) {
  const data = overrides.length
    ? overrides.map((o, i) => ({ ...SCHEDULES[i], ...o }))
    : SCHEDULES;
  mockUseSchedules.mockReturnValue({ data, isLoading: false, error: null, refetch: vi.fn() });
}

function loading() {
  mockUseSchedules.mockReturnValue({ data: undefined, isLoading: true, error: null, refetch: vi.fn() });
}

function errored() {
  mockUseSchedules.mockReturnValue({
    data: undefined,
    isLoading: false,
    error: new Error('Network error'),
    refetch: vi.fn(),
  });
}

function empty() {
  mockUseSchedules.mockReturnValue({ data: [], isLoading: false, error: null, refetch: vi.fn() });
}

// ── Tests ─────────────────────────────────────────────────────

describe('SchedulesPage', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('loading state', () => {
    it('does not render schedule cards while fetching', () => {
      loading();
      renderWithRouter(<SchedulesPage />);
      expect(screen.queryByRole('button', { name: /view schedule/i })).not.toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('shows an error message', () => {
      errored();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByText(/failed to load schedules/i)).toBeInTheDocument();
    });

    it('shows a retry button', () => {
      errored();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('shows the empty state heading', () => {
      empty();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByText('No schedules yet')).toBeInTheDocument();
    });

    it('shows a create button in the empty state', () => {
      empty();
      renderWithRouter(<SchedulesPage />);
      const buttons = screen.getAllByRole('button', { name: /new schedule/i });
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('with schedules', () => {
    it('renders a card for each schedule', () => {
      idle();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getAllByRole('button', { name: /view schedule/i })).toHaveLength(2);
    });

    it('displays shift and hour counts on each card', () => {
      idle();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByText('12 shifts')).toBeInTheDocument();
      expect(screen.getByText('96h total')).toBeInTheDocument();
    });

    it('does not show the sort toggle with only one schedule', () => {
      mockUseSchedules.mockReturnValue({
        data: [SCHEDULES[0]],
        isLoading: false,
        error: null,
        refetch: vi.fn(),
      });
      renderWithRouter(<SchedulesPage />);
      expect(screen.queryByText(/newest first/i)).not.toBeInTheDocument();
    });

    it('shows the sort toggle when there are multiple schedules', () => {
      idle();
      renderWithRouter(<SchedulesPage />);
      expect(screen.getByText(/newest first/i)).toBeInTheDocument();
    });

    it('toggles sort label when clicked', async () => {
      idle();
      const { user } = { user: userEvent.setup(), ...renderWithRouter(<SchedulesPage />) };
      const sortBtn = screen.getByText(/newest first/i);
      await user.click(sortBtn);
      expect(screen.getByText(/oldest first/i)).toBeInTheDocument();
    });
  });

  describe('create schedule', () => {
    it('opens the create modal when "New schedule" is clicked', async () => {
      idle();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);
      await user.click(screen.getByRole('button', { name: /new schedule/i }));
      expect(screen.getByRole('dialog', { name: /new schedule/i })).toBeInTheDocument();
    });

    it('closes the modal when the close button is clicked', async () => {
      idle();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);
      await user.click(screen.getByRole('button', { name: /new schedule/i }));
      await user.click(screen.getByRole('button', { name: /close/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('closes the modal when the overlay is clicked', async () => {
      idle();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);
      await user.click(screen.getByRole('button', { name: /new schedule/i }));
      const dialog = screen.getByRole('dialog');
      await user.click(dialog.parentElement!);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('delete schedule', () => {
    it('opens the confirm modal when delete is triggered', async () => {
      idle();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);

      const [firstCard] = screen.getAllByRole('button', { name: /view schedule/i });
      await user.hover(firstCard);
      const deleteBtn = within(firstCard.closest('[class*="card"]')!).getByRole('button', {
        name: /delete schedule/i,
      });
      await user.click(deleteBtn);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/permanently delete/i)).toBeInTheDocument();
    });

    it('closes the confirm modal on cancel', async () => {
      idle();
      const user = userEvent.setup();
      renderWithRouter(<SchedulesPage />);

      const [firstCard] = screen.getAllByRole('button', { name: /view schedule/i });
      await user.hover(firstCard);
      const deleteBtn = within(firstCard.closest('[class*="card"]')!).getByRole('button', {
        name: /delete schedule/i,
      });
      await user.click(deleteBtn);

      await user.click(screen.getByRole('button', { name: /cancel/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
