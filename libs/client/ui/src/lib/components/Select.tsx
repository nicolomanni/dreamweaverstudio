import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type SelectProps = Omit<
  React.SelectHTMLAttributes<HTMLSelectElement>,
  'size'
> & {
  size?: 'sm' | 'md';
  error?: boolean;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ size = 'md', error = false, className, ...rest }, ref) => (
    <select
      ref={ref}
      className={cn(
        'h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 pr-10 text-sm text-slate-700 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:placeholder-slate-400 disabled:border-slate-300 disabled:opacity-60 dark:border-border dark:bg-background dark:text-foreground dark:disabled:bg-slate-900 dark:disabled:text-foreground/30 dark:disabled:border-slate-700',
        size === 'sm' && 'h-8 px-3 text-xs',
        error &&
          'border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-500 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100',
        className,
      )}
      {...rest}
    />
  ),
);

Select.displayName = 'Select';

export default Select;
