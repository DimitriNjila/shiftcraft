import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EmployeeCard, EmployeeCardSkeleton } from '@/components/employees/EmployeeCard';
import type { Employee } from '@/lib/types/employee';

const BASE: Employee = {
  id: 'emp-1',
  name: 'Elena Kovač',
  role: 'Server',
  is_active: true,
  restaurant_id: 'rest-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

function setup(overrides: Partial<Employee> = {}) {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  render(
    <EmployeeCard
      employee={{ ...BASE, ...overrides }}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
  );
  return { onEdit, onDelete };
}

describe('EmployeeCard', () => {
  it('renders the employee name', () => {
    setup();
    expect(screen.getByText('Elena Kovač')).toBeInTheDocument();
  });

  it('renders the role', () => {
    setup();
    expect(screen.getByText('Server')).toBeInTheDocument();
  });

  it('shows initials in the avatar', () => {
    setup();
    expect(screen.getByText('EK')).toBeInTheDocument();
  });

  it('shows Active badge when is_active is true', () => {
    setup({ is_active: true });
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('shows Inactive badge when is_active is false', () => {
    setup({ is_active: false });
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('calls onEdit with the employee when the edit button is clicked', async () => {
    const { onEdit } = setup();
    await userEvent.click(screen.getByRole('button', { name: /edit elena kovač/i }));
    expect(onEdit).toHaveBeenCalledWith({ ...BASE });
  });

  it('calls onDelete with the employee when the delete button is clicked', async () => {
    const { onDelete } = setup();
    await userEvent.click(screen.getByRole('button', { name: /delete elena kovač/i }));
    expect(onDelete).toHaveBeenCalledWith({ ...BASE });
  });
});

describe('EmployeeCardSkeleton', () => {
  it('renders without crashing', () => {
    const { container } = render(<EmployeeCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
