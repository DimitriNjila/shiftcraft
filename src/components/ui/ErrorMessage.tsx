import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorMessage({ message = 'Something went wrong', onRetry }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 gap-3 text-center">
      <AlertCircle size={32} className="text-tertiary-fixed-dim" />
      <div className="title-sm text-on-surface">{message}</div>
      {onRetry && (
        <button className="btn btn-ghost mt-1" onClick={onRetry}>
          <RefreshCw size={14} />
          Try again
        </button>
      )}
    </div>
  );
}
