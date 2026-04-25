import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  fullPage?: boolean;
  size?: number;
}

export function LoadingSpinner({ fullPage = false, size = 24 }: LoadingSpinnerProps) {
  if (fullPage) {
    return (
      <div className="flex items-center justify-center h-full flex-1 text-on-surface-faint">
        <Loader2 size={size} className="spinner" />
      </div>
    );
  }

  return <Loader2 size={size} className="spinner text-on-surface-faint" />;
}
