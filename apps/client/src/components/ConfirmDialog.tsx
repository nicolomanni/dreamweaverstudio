import { AlertTriangle, X } from 'lucide-react';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'warning' | 'neutral';
  onConfirm: () => void;
  onCancel: () => void;
};

const toneStyles = {
  danger:
    'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  neutral:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-border dark:bg-card dark:text-foreground/70',
};

const confirmButtonStyles = {
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 dark:bg-rose-500/90 dark:hover:bg-rose-500',
  warning:
    'bg-amber-500 text-white hover:bg-amber-600 dark:bg-amber-500/90 dark:hover:bg-amber-500',
  neutral:
    'bg-primary text-white hover:bg-primary/90',
};

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'warning',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-border dark:bg-card">
        <div className="flex items-start gap-3 px-5 py-4">
          <span
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${toneStyles[tone]}`}
          >
            <AlertTriangle className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h3
              id="confirm-dialog-title"
              className="text-sm font-semibold text-slate-900 dark:text-foreground"
            >
              {title}
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-foreground/60">
              {description}
            </p>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close dialog"
            className="text-slate-400 transition-colors hover:text-slate-600 dark:text-foreground/40 dark:hover:text-foreground/70"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 transition-colors hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground/70 dark:hover:bg-background"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition-colors ${confirmButtonStyles[tone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
