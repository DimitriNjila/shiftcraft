import { X, RefreshCw, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface AnalysisModalProps {
  analysis: string | undefined;
  isPending: boolean;
  isError: boolean;
  onRetry: () => void;
  onClose: () => void;
}

export function AnalysisModal({ analysis, isPending, isError, onRetry, onClose }: AnalysisModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel w-full max-w-2xl max-h-[80vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="AI schedule analysis"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            <div>
              <span className="label-md">AI Analysis</span>
              <h2 className="headline-md mt-0.5">Schedule review</h2>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isPending && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <LoadingSpinner size={24} />
              <p className="body-sm text-on-surface-muted">Analysing your schedule…</p>
            </div>
          )}

          {isError && !isPending && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="body-md text-on-surface-muted">Analysis failed. Please try again.</p>
              <button type="button" onClick={onRetry} className="btn btn-secondary gap-2 text-sm">
                <RefreshCw size={14} />
                Retry
              </button>
            </div>
          )}

          {analysis && !isPending && (
            <p className="body-sm text-on-surface leading-relaxed whitespace-pre-wrap">
              {analysis}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
