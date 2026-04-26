import { render } from '@testing-library/react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders the spinner icon', () => {
    const { container } = render(<LoadingSpinner />);
    // Lucide renders an SVG
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders inline by default', () => {
    const { container } = render(<LoadingSpinner />);
    // No full-page wrapper div
    expect(container.firstChild?.nodeName).toBe('svg');
  });

  it('renders a full-page centred wrapper when fullPage=true', () => {
    const { container } = render(<LoadingSpinner fullPage />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.nodeName).toBe('DIV');
    expect(wrapper.querySelector('svg')).toBeInTheDocument();
  });
});
