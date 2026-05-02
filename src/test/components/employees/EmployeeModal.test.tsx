import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeModal } from '@/components/employees/EmployeeModal';
import type { Employee } from '@/lib/types/employee';

const BASE_EMPLOYEE: Employee = {
  id: 'emp-1',
  name: 'Elena Kovač',
  role: 'Server',
  salary: 32000,
  max_hours_per_week: 38,
  is_active: true,
  restaurant_id: 'rest-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const BASE_PROPS = {
  restaurantId: 'rest-1',
  isPending: false,
  onSubmit: vi.fn(),
  onClose: vi.fn(),
};

describe('EmployeeModal — create mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows "Add to your team" heading', () => {
    render(<EmployeeModal {...BASE_PROPS} />);
    expect(screen.getByText('Add to your team')).toBeInTheDocument();
  });

  it('shows "Add employee" submit button', () => {
    render(<EmployeeModal {...BASE_PROPS} />);
    expect(screen.getByRole('button', { name: /add employee/i })).toBeInTheDocument();
  });

  it('shows an inline error when name is empty on submit', async () => {
    render(<EmployeeModal {...BASE_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /add employee/i }));
    expect(screen.getByText('Name is required')).toBeInTheDocument();
    expect(BASE_PROPS.onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit with correct data when valid', async () => {
    render(<EmployeeModal {...BASE_PROPS} />);
    await userEvent.type(screen.getByLabelText(/full name/i), 'Jordan Reyes');
    await userEvent.click(screen.getByRole('button', { name: /cook/i }));
    await userEvent.click(screen.getByRole('button', { name: /add employee/i }));
    expect(BASE_PROPS.onSubmit).toHaveBeenCalledWith({
      name: 'Jordan Reyes',
      role: 'Cook',
      restaurantId: 'rest-1',
      salary: 30000,
      maxHoursPerWeek: 40,
    });
  });

  it('calls onClose when Cancel is clicked', async () => {
    render(<EmployeeModal {...BASE_PROPS} />);
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when the overlay is clicked', async () => {
    render(<EmployeeModal {...BASE_PROPS} />);
    // The modal-overlay is the outermost div; click it to dismiss
    await userEvent.click(document.querySelector('.modal-overlay')!);
    expect(BASE_PROPS.onClose).toHaveBeenCalledOnce();
  });
});

describe('EmployeeModal — edit mode', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows "Update details" heading', () => {
    render(<EmployeeModal {...BASE_PROPS} employee={BASE_EMPLOYEE} />);
    expect(screen.getByText('Update details')).toBeInTheDocument();
  });

  it('pre-fills the name field with the existing value', () => {
    render(<EmployeeModal {...BASE_PROPS} employee={BASE_EMPLOYEE} />);
    expect(screen.getByLabelText(/full name/i)).toHaveValue('Elena Kovač');
  });

  it('shows "Save changes" submit button', () => {
    render(<EmployeeModal {...BASE_PROPS} employee={BASE_EMPLOYEE} />);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('calls onSubmit with updated data', async () => {
    render(<EmployeeModal {...BASE_PROPS} employee={BASE_EMPLOYEE} />);
    const input = screen.getByLabelText(/full name/i);
    await userEvent.clear(input);
    await userEvent.type(input, 'Elena K.');
    await userEvent.click(screen.getByRole('button', { name: /save changes/i }));
    expect(BASE_PROPS.onSubmit).toHaveBeenCalledWith({
      name: 'Elena K.',
      role: 'Server',
      restaurantId: 'rest-1',
      salary: 32000,
      maxHoursPerWeek: 38,
    });
  });
});

describe('EmployeeModal — pending state', () => {
  it('disables the submit button and shows loading label when isPending', () => {
    render(<EmployeeModal {...BASE_PROPS} isPending />);
    expect(screen.getByRole('button', { name: /adding…/i })).toBeDisabled();
  });
});
