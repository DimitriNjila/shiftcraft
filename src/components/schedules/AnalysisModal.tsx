import { X, RefreshCw, Sparkles } from "lucide-react";
import type { AxiosError } from "axios";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type {
  AnalyzeScheduleResponse,
  AnalysisScore,
} from "@/lib/types/schedule";

// ── Score badge ───────────────────────────────────────────────

const SCORE_STYLES: Record<
  AnalysisScore,
  { label: string; bg: string; text: string }
> = {
  good: {
    label: "Good",
    bg: "var(--color-primary-fixed)",
    text: "var(--color-primary)",
  },
  fair: {
    label: "Fair",
    bg: "var(--color-warning-container)",
    text: "var(--color-warning)",
  },
  poor: {
    label: "Poor",
    bg: "var(--color-tertiary-fixed)",
    text: "#8b1d18",
  },
};

function ScoreBadge({ score }: { score: AnalysisScore }) {
  const s = SCORE_STYLES[score] ?? SCORE_STYLES.fair;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5 label-md font-semibold"
      style={{ background: s.bg, color: s.text, fontSize: 11 }}
    >
      {s.label}
    </span>
  );
}

// ── Score card ────────────────────────────────────────────────

function ScoreCard({
  label,
  score,
  details,
}: {
  label: string;
  score: AnalysisScore;
  details: string;
}) {
  return (
    <div className="card flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="label-md font-semibold text-on-surface">{label}</p>
        <ScoreBadge score={score} />
      </div>
      <p className="body-sm text-on-surface-muted leading-relaxed">{details}</p>
    </div>
  );
}

// ── Error helpers ─────────────────────────────────────────────

function errorMessage(error: AxiosError<{ detail?: string }> | null): {
  message: string;
  retryable: boolean;
} {
  const status = error?.response?.status;
  if (status === 503)
    return { message: "AI analysis is not available", retryable: false };
  if (status === 502)
    return { message: "Analysis failed — please try again", retryable: true };
  return {
    message: error?.response?.data?.detail ?? "Analysis failed — please try again",
    retryable: true,
  };
}

// ── Modal ─────────────────────────────────────────────────────

interface AnalysisModalProps {
  data: AnalyzeScheduleResponse | undefined;
  isPending: boolean;
  isError: boolean;
  error: AxiosError<{ detail?: string }> | null;
  onRetry: () => void;
  onClose: () => void;
}

export function AnalysisModal({
  data,
  isPending,
  isError,
  error,
  onRetry,
  onClose,
}: AnalysisModalProps) {
  const err = isError ? errorMessage(error) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel w-full max-w-2xl max-h-[85vh] flex flex-col"
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
          <button
            type="button"
            onClick={onClose}
            className="btn-icon btn-ghost"
            aria-label="Close"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {/* Loading */}
          {isPending && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <LoadingSpinner size={24} />
              <p className="body-sm text-on-surface-muted">
                Analysing your schedule…
              </p>
            </div>
          )}

          {/* Error */}
          {err && !isPending && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <p className="body-md text-on-surface-muted">{err.message}</p>
              {err.retryable && (
                <button
                  type="button"
                  onClick={onRetry}
                  className="btn btn-secondary gap-2 text-sm"
                >
                  <RefreshCw size={14} />
                  Retry
                </button>
              )}
            </div>
          )}

          {/* Results */}
          {data && !isPending && (
            <div className="flex flex-col gap-5">
              {/* Summary */}
              <div className="rounded-xl bg-surface-low px-4 py-3.5">
                <p className="body-sm text-on-surface leading-relaxed">
                  {data.summary}
                </p>
              </div>

              {/* Score cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ScoreCard
                  label="Fairness"
                  score={data.fairness.score}
                  details={data.fairness.details}
                />
                <ScoreCard
                  label="Coverage"
                  score={data.coverage.score}
                  details={data.coverage.details}
                />
                <ScoreCard
                  label="Workload"
                  score={data.workload.score}
                  details={data.workload.details}
                />
              </div>

              {/* Patterns */}
              {data.patterns.length > 0 && (
                <div>
                  <h3 className="title-sm mb-2.5">Patterns noticed</h3>
                  <ul className="flex flex-col gap-1.5">
                    {data.patterns.map((p, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-on-surface-faint shrink-0 mt-[7px]" />
                        <span className="body-sm text-on-surface-muted leading-relaxed">
                          {p}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {data.recommendations.length > 0 && (
                <div>
                  <h3 className="title-sm mb-2.5">Recommendations</h3>
                  <ol className="flex flex-col gap-1.5">
                    {data.recommendations.map((r, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="label-md font-semibold text-primary shrink-0 w-4 text-right mt-px">
                          {i + 1}.
                        </span>
                        <span className="body-sm text-on-surface-muted leading-relaxed">
                          {r}
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
