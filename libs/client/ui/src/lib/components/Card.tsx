import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { PolymorphicProps } from '../utils/polymorphic';

export type CardVariant = 'default' | 'muted';

export type CardProps<T extends ElementType = 'div'> = PolymorphicProps<
  T,
  {
    variant?: CardVariant;
    className?: string;
    children?: ReactNode;
  }
>;

const cardStyles: Record<CardVariant, string> = {
  default:
    'rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-border dark:bg-card',
  muted:
    'rounded-2xl border border-slate-200 bg-slate-50 dark:border-border dark:bg-background',
};

export const Card = <T extends ElementType = 'div'>(props: CardProps<T>) => {
  const { as, variant = 'default', className, children, ...rest } = props;
  const Component = (as ?? 'div') as ElementType;

  return (
    <Component className={cn(cardStyles[variant], className)} {...rest}>
      {children}
    </Component>
  );
};

export type CardSectionProps = HTMLAttributes<HTMLDivElement> & {
  size?: 'default' | 'compact' | 'sm';
};

export const CardHeader = ({
  size = 'default',
  className,
  ...rest
}: CardSectionProps) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-6 py-4 dark:border-border',
      size === 'compact' && 'px-6 py-3',
      className,
    )}
    {...rest}
  />
);

export const CardBody = ({
  size = 'default',
  className,
  ...rest
}: CardSectionProps) => (
  <div
    className={cn(
      size === 'sm' ? 'p-5' : 'p-6',
      size === 'compact' && 'px-6 py-3',
      className,
    )}
    {...rest}
  />
);

export const CardFooter = ({
  size = 'default',
  className,
  ...rest
}: CardSectionProps) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-between gap-3 rounded-b-2xl border-t border-slate-200 px-6 py-4 dark:border-border',
      size === 'compact' && 'px-6 py-3',
      className,
    )}
    {...rest}
  />
);

export default Card;
