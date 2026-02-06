import type { ButtonHTMLAttributes, HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type TabsListProps = HTMLAttributes<HTMLDivElement>;

export const TabsList = ({ className, ...rest }: TabsListProps) => (
  <div
    role="tablist"
    className={cn('flex flex-wrap items-center gap-4 pb-2', className)}
    {...rest}
  />
);

export type TabProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const Tab = ({
  active = false,
  className,
  type = 'button',
  ...rest
}: TabProps) => (
  <button
    type={type}
    role="tab"
    aria-selected={active}
    tabIndex={active ? 0 : -1}
    className={cn(
      'border-b-2 pb-2 text-xs font-semibold uppercase tracking-[0.25em] transition-colors',
      active
        ? 'border-primary text-primary'
        : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-foreground/60 dark:hover:text-foreground',
      className,
    )}
    {...rest}
  />
);

export default TabsList;
