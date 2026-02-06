import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  size?: 'sm' | 'md';
  error?: boolean;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ size = 'md', error = false, className, ...rest }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:placeholder-slate-400 disabled:border-slate-300 disabled:opacity-60 dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-foreground/40 dark:disabled:bg-slate-900 dark:disabled:text-foreground/30 dark:disabled:border-slate-700',
        size === 'sm' && 'h-8 px-3 text-xs',
        error &&
          'border-rose-300 bg-rose-50 text-rose-700 placeholder-rose-300 focus:border-rose-500 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100',
        className,
      )}
      {...rest}
    />
  ),
);

Input.displayName = 'Input';

export default Input;
