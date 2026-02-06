import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type LoadingBarProps = HTMLAttributes<HTMLDivElement>;

export const LoadingBar = ({ className, ...rest }: LoadingBarProps) => (
  <div className={cn('dw-loading-bar h-full', className)} {...rest} />
);

export default LoadingBar;
