import type { ElementType, ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { PolymorphicProps } from '../utils/polymorphic';

export type HelperTextProps<T extends ElementType = 'p'> = PolymorphicProps<
  T,
  {
    className?: string;
    children?: ReactNode;
  }
>;

export const HelperText = <T extends ElementType = 'p'>(
  props: HelperTextProps<T>,
) => {
  const { as, className, children, ...rest } = props;
  const Component = (as ?? 'p') as ElementType;

  return (
    <Component
      className={cn('text-xs text-slate-500 dark:text-foreground/60', className)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default HelperText;
