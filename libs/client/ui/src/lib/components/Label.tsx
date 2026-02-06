import type { LabelHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement> & {
  variant?: 'default' | 'inline';
};

export const Label = ({
  variant = 'default',
  className,
  ...rest
}: LabelProps) => (
  <label
    className={cn(
      variant === 'inline'
        ? 'text-sm font-semibold text-slate-500 md:flex md:h-10 md:items-center dark:text-foreground/60'
        : 'text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-foreground/50',
      className,
    )}
    {...rest}
  />
);

export default Label;
