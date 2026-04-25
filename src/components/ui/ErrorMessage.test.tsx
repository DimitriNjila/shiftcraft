import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorMessage } from './ErrorMessage';

describe('ErrorMessage', () => {
  it('renders the default message when none is provided', () => {
    render(<ErrorMessage />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders a custom message', () => {
    render(<ErrorMessage message="Failed to load employees" />);
    expect(screen.getByText('Failed to load employees')).toBeInTheDocument();
  });

  it('does not render a retry button when onRetry is omitted', () => {
    render(<ErrorMessage />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders a retry button when onRetry is provided', () => {
    render(<ErrorMessage onRetry={() => {}} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = vi.fn();
    render(<ErrorMessage onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
