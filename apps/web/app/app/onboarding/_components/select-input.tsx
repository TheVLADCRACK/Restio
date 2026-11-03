import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@restio/ui/cn';

export type SelectInputProps = SelectHTMLAttributes<HTMLSelectElement>;

// Select natif (fiable au doigt et au lecteur d'écran sur mobile), habillé comme TextInput.
export function SelectInput({ className, children, ...props }: SelectInputProps) {
  return (
    <div className="relative min-w-0">
      <select
        className={cn(
          'h-12 w-full min-w-0 cursor-pointer appearance-none truncate rounded-md border border-line-strong bg-surface pl-3.5 pr-11 text-base text-ink transition-[border-color,box-shadow] duration-150 hover:border-[#B5B5B0]',
          'focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none',
          'aria-invalid:border-status-danger aria-invalid:shadow-[0_0_0_3px_rgba(192,38,28,.12)]',
          'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-text-3',
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute right-3.5 top-1/2 size-5 -translate-y-1/2 text-text-2" />
    </div>
  );
}
