import type { InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@restio/ui/cn';

export type TextInputProps = InputHTMLAttributes<HTMLInputElement> & {
  /** Icône décorative à gauche du champ (planche : e-mail, mot de passe). */
  icon?: LucideIcon;
};

export function TextInput({ className, type = 'text', icon: Icon, ...props }: TextInputProps) {
  const input = (
    <input
      type={type}
      className={cn(
        'h-12 w-full min-w-0 rounded-md border border-line-strong bg-surface px-3.5 text-base text-ink transition-[border-color,box-shadow] duration-150 placeholder:text-text-3 hover:border-[#B5B5B0]',
        'focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none',
        'aria-invalid:border-status-danger aria-invalid:shadow-[0_0_0_3px_rgba(192,38,28,.12)]',
        'disabled:cursor-not-allowed disabled:bg-sunken disabled:text-text-3',
        Icon && 'pl-11',
        className,
      )}
      {...props}
    />
  );
  if (!Icon) return input;
  return (
    <div className="relative min-w-0">
      <Icon aria-hidden="true" strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-3" />
      {input}
    </div>
  );
}
