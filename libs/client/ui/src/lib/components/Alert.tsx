import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantStyles: Record<AlertVariant, string> = {
  neutral:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-border dark:bg-card dark:text-foreground/70',
  info:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  danger:
    'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
};

export const Alert = ({
  variant = 'neutral',
  className,
  role = 'alert',
  ...rest
}: AlertProps) => (
  <div
    role={role}
    className={cn('rounded-2xl border px-4 py-3 text-sm', variantStyles[variant], className)}
    {...rest}
  />
);

export default Alert;
