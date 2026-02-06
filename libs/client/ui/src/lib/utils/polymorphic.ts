import type { ComponentPropsWithoutRef, ElementType } from 'react';

type PropsOf<T extends ElementType> = ComponentPropsWithoutRef<T>;

type MergeProps<T extends ElementType, Props> = Props &
  Omit<PropsOf<T>, keyof Props | 'as'>;

export type PolymorphicProps<T extends ElementType, Props = object> = MergeProps<
  T,
  Props & { as?: T }
>;
