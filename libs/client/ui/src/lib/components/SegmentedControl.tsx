import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SegmentedControlProps = HTMLAttributes<HTMLDivElement>;

export const SegmentedControl = ({ className, ...rest }: SegmentedControlProps) => (
  <div
    role="tablist"
    className={cn(
      'inline-flex w-full flex-wrap overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-border dark:bg-card',
      className,
    )}
    {...rest}
  />
);

export type SegmentedItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  withDivider?: boolean;
};

export const SegmentedItem = ({
  active = false,
  withDivider = false,
  className,
  type = 'button',
  ...rest
}: SegmentedItemProps) => (
  <button
    type={type}
    role="tab"
    aria-selected={active}
    tabIndex={active ? 0 : -1}
    className={cn(
      'flex flex-1 items-center gap-3 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] transition-colors',
      active
        ? 'bg-primary/10 text-primary'
        : 'text-slate-600 hover:bg-slate-50 dark:text-foreground/70 dark:hover:bg-background',
      withDivider && 'border-r border-slate-200 dark:border-border',
      className,
    )}
    {...rest}
  />
);

export default SegmentedControl;
