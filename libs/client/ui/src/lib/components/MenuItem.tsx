import type { ElementType, ReactNode } from 'react';
import { cn } from '../utils/cn';
import type { PolymorphicProps } from '../utils/polymorphic';

export type MenuItemProps<T extends ElementType = 'button'> = PolymorphicProps<
  T,
  {
    className?: string;
    children?: ReactNode;
  }
>;

export const MenuItem = <T extends ElementType = 'button'>(
  props: MenuItemProps<T>,
) => {
  const { as, className, children, ...rest } = props;
  const Component = (as ?? 'button') as ElementType;
  const isButton = Component === 'button';

  return (
    <Component
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-foreground/80 dark:hover:bg-background/70',
        className,
      )}
      {...(isButton
        ? { type: (rest as MenuItemProps<'button'>).type ?? 'button' }
        : null)}
      {...rest}
    >
      {children}
    </Component>
  );
};

export default MenuItem;
