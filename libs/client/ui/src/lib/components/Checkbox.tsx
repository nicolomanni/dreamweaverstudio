import { forwardRef } from 'react';
import { cn } from '../utils/cn';

export type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary dark:border-border',
        className,
      )}
      {...rest}
    />
  ),
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
