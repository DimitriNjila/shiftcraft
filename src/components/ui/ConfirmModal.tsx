import { AlertTriangle, X } from "lucide-react";

export interface ConfirmModalProps {
  title: string;
  description: string;
  confirmLabel?: string;
  isPending?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  title,
  description,
  confirmLabel = "Confirm",
  isPending = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-panel max-w-sm" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-tertiary-fixed grid place-items-center shrink-0">
              <AlertTriangle size={16} className="text-[#8b1d18]" />
            </div>
            <h2 className="title-lg">{title}</h2>
          </div>
          <button onClick={onCancel} className="btn-icon btn-ghost shrink-0" aria-label="Close">
            <X size={17} />
          </button>
        </div>

        <p className="body-md text-on-surface-muted mb-6 leading-relaxed">{description}</p>

        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="btn btn-secondary flex-1 justify-center py-2.5 text-sm">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger flex-1 justify-center py-2.5 text-sm"
            disabled={isPending}
          >
            {isPending ? "Removing…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
