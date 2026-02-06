import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: boolean;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ error = false, className, ...rest }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:placeholder-slate-400 disabled:border-slate-300 disabled:opacity-60 dark:border-border dark:bg-background dark:text-foreground dark:placeholder:text-foreground/40 dark:disabled:bg-slate-900 dark:disabled:text-foreground/30 dark:disabled:border-slate-700',
        error &&
          'border-rose-300 bg-rose-50 text-rose-700 placeholder-rose-300 focus:border-rose-500 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-100',
        className,
      )}
      {...rest}
    />
  ),
);

Textarea.displayName = 'Textarea';

export default Textarea;
