import type { InputHTMLAttributes } from 'react';
import { cn } from '@restio/ui/cn';

export type PhoneInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'inputMode'> & {
  /** Indicatif affiché devant le numéro, sans « + » (ex. « 237 »). Purement visuel : la saisie n'est jamais modifiée. */
  dialCode?: string;
};

// Le cadre porte bordure, focus et erreur pour que l'indicatif fasse partie du même champ.
export function PhoneInput({ dialCode, className, ...props }: PhoneInputProps) {
  return (
    <div
      className={cn(
        'flex h-12 w-full min-w-0 items-center rounded-md border border-line-strong bg-surface transition-[border-color,box-shadow] duration-150 hover:border-[#B5B5B0]',
        'focus-within:border-ink focus-within:shadow-[0_0_0_3px_rgba(15,15,15,.12)]',
        'has-aria-invalid:border-status-danger has-aria-invalid:shadow-[0_0_0_3px_rgba(192,38,28,.12)]',
        'has-read-only:bg-sunken has-disabled:bg-sunken',
        className,
      )}
    >
      {dialCode && (
        <span aria-hidden="true" className="tabular shrink-0 border-r border-line pl-3.5 pr-3 text-base font-medium text-text-2">
          +{dialCode}
        </span>
      )}
      <input
        type="tel"
        inputMode="tel"
        className="h-full w-full min-w-0 flex-1 rounded-md bg-transparent px-3.5 text-base text-ink placeholder:text-text-3 focus:outline-none read-only:text-text-2 disabled:cursor-not-allowed disabled:text-text-3"
        {...props}
      />
    </div>
  );
}
