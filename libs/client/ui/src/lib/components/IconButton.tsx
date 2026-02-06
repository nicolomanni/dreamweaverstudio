import type { ElementType, ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { PolymorphicProps } from '../utils/polymorphic';

export type IconButtonVariant = 'outline' | 'ghost' | 'danger' | 'warn';
export type IconButtonSize = 'sm' | 'md';

export type IconButtonProps<T extends ElementType = 'button'> = PolymorphicProps<
  T,
  {
    variant?: IconButtonVariant;
    size?: IconButtonSize;
    className?: string;
    children?: ReactNode;
  }
>;

const baseStyles =
  'inline-flex items-center justify-center rounded-full border transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles: Record<IconButtonVariant, string> = {
  outline:
    'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground/70',
  ghost:
    'border border-transparent text-slate-600 hover:bg-slate-100 dark:text-foreground/70 dark:hover:bg-card/80',
  danger:
    'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
  warn:
    'border-amber-200 bg-amber-50 text-amber-500 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-200',
};

const sizeStyles: Record<IconButtonSize, string> = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
};

export const IconButton = <T extends ElementType = 'button'>(
  props: IconButtonProps<T>,
) => {
  const {
    as,
    variant = 'ghost',
    size = 'md',
    className,
    children,
    ...rest
  } = props;
  const Component = (as ?? 'button') as ElementType;
  const isButton = Component === 'button';

  return (
    <Component
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...(isButton
        ? { type: (rest as IconButtonProps<'button'>).type ?? 'button' }
        : null)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default IconButton;
