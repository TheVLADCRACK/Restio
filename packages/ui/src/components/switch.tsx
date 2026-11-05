import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@restio/ui/cn';

export type SwitchProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'role' | 'aria-checked' | 'onChange'> & { checked: boolean; onCheckedChange: (checked: boolean) => void };

/** Interrupteur de la planche (« .toggle ») : 48 × 28, zone tactile élargie à 44 px. */
export function Switch({ checked, onCheckedChange, className, ...props }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={cn('relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 before:absolute before:-inset-y-2 before:inset-x-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink', checked ? 'bg-ink' : 'bg-line-strong', className)}
      {...props}
    >
      <span aria-hidden="true" className={cn('absolute left-[3px] top-[3px] size-[22px] rounded-full shadow-[var(--shadow-rest)] transition-transform duration-200', checked ? 'translate-x-5 bg-lime' : 'bg-surface')} />
    </button>
  );
}
