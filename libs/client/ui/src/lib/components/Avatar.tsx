import type { HTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type AvatarProps = HTMLAttributes<HTMLDivElement> & {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg';
};

const sizeStyles = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-8 w-8 text-xs',
  lg: 'h-10 w-10 text-sm',
};

export const Avatar = ({
  src,
  alt,
  fallback,
  size = 'md',
  className,
  ...rest
}: AvatarProps) => (
  <div
    className={cn(
      'flex items-center justify-center overflow-hidden rounded-full',
      sizeStyles[size],
      className,
    )}
    {...rest}
  >
    {src ? (
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    ) : (
      <span
        className={cn(
          'flex h-full w-full items-center justify-center border border-border bg-gradient-to-br from-primary/60 to-secondary/60 font-semibold text-black',
        )}
      >
        {fallback}
      </span>
    )}
  </div>
);

export default Avatar;
