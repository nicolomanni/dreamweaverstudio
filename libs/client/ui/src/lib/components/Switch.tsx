import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../utils/cn';

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> & {
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: string;
};

export const Switch = ({
  checked,
  onCheckedChange,
  label,
  className,
  disabled,
  onClick,
  ...rest
}: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={(event) => {
      if (disabled) return;
      onCheckedChange?.(!checked);
      onClick?.(event);
    }}
    className={cn(
      'relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black',
      checked ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700',
      disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      className,
    )}
    {...rest}
  >
    {label ? <span className="sr-only">{label}</span> : null}
    <span
      aria-hidden="true"
      className={cn(
        'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
        checked ? 'translate-x-5' : 'translate-x-0',
      )}
    />
  </button>
);

export default Switch;
