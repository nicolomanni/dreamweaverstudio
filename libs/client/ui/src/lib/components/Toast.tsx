import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info' | 'neutral';

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
};

const variantStyles: Record<ToastVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  error:
    'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  info:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
  neutral:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-border dark:bg-card dark:text-foreground/70',
};

export const Toast = ({
  variant = 'neutral',
  className,
  children,
  ...rest
}: ToastProps) => (
  <div
    className={cn(
      'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg',
      variantStyles[variant],
      className,
    )}
    {...rest}
  >
    {children}
  </div>
);

export type ToastViewportProps = HTMLAttributes<HTMLDivElement>;

export const ToastViewport = ({ className, ...rest }: ToastViewportProps) => (
  <div
    className={cn(
      'pointer-events-none fixed right-6 top-6 z-50 flex flex-col gap-3',
      className,
    )}
    {...rest}
  />
);

export type ToastDotProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: ToastVariant;
};

const dotStyles: Record<ToastVariant, string> = {
  success: 'bg-emerald-500',
  error: 'bg-rose-500',
  warning: 'bg-amber-500',
  info: 'bg-sky-500',
  neutral: 'bg-slate-400',
};

export const ToastDot = ({
  variant = 'neutral',
  className,
  ...rest
}: ToastDotProps) => (
  <span className={cn('h-2.5 w-2.5 rounded-full', dotStyles[variant], className)} {...rest} />
);

export default Toast;
