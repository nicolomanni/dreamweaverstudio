import type { ElementType, ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { PolymorphicProps } from '../utils/polymorphic';

export type ButtonVariant = 'primary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps<T extends ElementType = 'button'> = PolymorphicProps<
  T,
  {
    variant?: ButtonVariant;
    size?: ButtonSize;
    className?: string;
    children?: ReactNode;
  }
>;

const baseStyles =
  'inline-flex items-center justify-center gap-2 rounded-full text-xs font-semibold uppercase tracking-[0.25em] transition-colors disabled:cursor-not-allowed disabled:opacity-60';

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary/90',
  outline:
    'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-border dark:bg-card dark:text-foreground/70',
  ghost:
    'text-slate-500 hover:text-slate-700 dark:text-foreground/60 dark:hover:text-foreground',
  danger:
    'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3',
  md: 'h-10 px-4',
  lg: 'h-10 px-5',
};

export const Button = <T extends ElementType = 'button'>(
  props: ButtonProps<T>,
) => {
  const {
    as,
    variant = 'primary',
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
        ? { type: (rest as ButtonProps<'button'>).type ?? 'button' }
        : null)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default Button;
