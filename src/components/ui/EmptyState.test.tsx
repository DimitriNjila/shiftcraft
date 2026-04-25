import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('renders the title', () => {
    render(<EmptyState title="No employees yet" />);
    expect(screen.getByText('No employees yet')).toBeInTheDocument();
  });

  it('renders description when provided', () => {
    render(<EmptyState title="No data" description="Add something to get started" />);
    expect(screen.getByText('Add something to get started')).toBeInTheDocument();
  });

  it('does not render description when omitted', () => {
    render(<EmptyState title="No data" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renders an action node when provided', () => {
    render(
      <EmptyState
        title="Empty"
        action={<button>Add item</button>}
      />,
    );
    expect(screen.getByRole('button', { name: 'Add item' })).toBeInTheDocument();
  });

  it('renders an icon node when provided', () => {
    render(
      <EmptyState title="Empty" icon={<span data-testid="test-icon" />} />,
    );
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});
