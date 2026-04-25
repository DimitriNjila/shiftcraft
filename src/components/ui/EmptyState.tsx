import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center gap-3">
      {icon && (
        <div className="w-12 h-12 rounded-lg bg-surface-container grid place-items-center text-on-surface-faint mb-1">
          {icon}
        </div>
      )}
      <div className="title-md text-on-surface">{title}</div>
      {description && (
        <p className="body-sm text-on-surface-muted max-w-[320px]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
