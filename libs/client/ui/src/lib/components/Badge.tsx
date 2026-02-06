import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type BadgeVariant = 'success' | 'danger' | 'warning' | 'neutral';

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantStyles: Record<BadgeVariant, string> = {
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  danger:
    'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  warning:
    'border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
  neutral:
    'border-slate-200 bg-slate-50 text-slate-600 dark:border-border dark:bg-card dark:text-foreground/70',
};

export const Badge = ({
  variant = 'neutral',
  className,
  ...rest
}: BadgeProps) => (
  <span
    className={cn(
      'inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.25em]',
      variantStyles[variant],
      className,
    )}
    {...rest}
  />
);

export default Badge;
