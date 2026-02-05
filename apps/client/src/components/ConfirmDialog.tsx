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
      <div className="dw-card w-full max-w-md overflow-hidden shadow-2xl">
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
            className="dw-btn-icon dw-btn-icon-sm dw-btn-icon-ghost"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4 dark:border-border">
          <button
            type="button"
            onClick={onCancel}
            className="dw-btn dw-btn-md dw-btn-outline"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`dw-btn dw-btn-md ${confirmButtonStyles[tone]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
