import type { ButtonHTMLAttributes } from 'react';
import { cn } from '@restio/ui/cn';

const variants = {
  primary: 'border-lime bg-lime text-ink hover:border-lime-pressed hover:bg-lime-pressed',
  dark: 'border-ink bg-ink text-surface hover:border-ink-2 hover:bg-ink-2',
  secondary: 'border-line-strong bg-surface text-ink hover:bg-sunken',
  ghost: 'border-transparent bg-transparent px-3 text-ink hover:bg-sunken',
  danger: 'border-status-danger bg-status-danger text-surface',
} as const;

const sizes = {
  md: 'h-12 px-5 text-base',
  sm: 'h-10 px-4 text-sm',
} as const;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  block?: boolean;
  /** Bloque le bouton (anti double envoi) et affiche le spinner. */
  loading?: boolean;
  /** Libellé pendant le chargement, ex. « Envoi… ». Par défaut : le libellé normal. */
  loadingText?: string;
};

export function Button({ variant = 'secondary', size = 'md', block, loading = false, loadingText, disabled, type = 'button', className, children, ...props }: ButtonProps) {
  // En chargement, le bouton garde sa couleur (planche) mais ne reçoit plus de clic.
  const inert = disabled && !loading;
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-full border font-bold transition-[background-color,border-color,transform] duration-150 active:scale-[.98]',
        sizes[size],
        variants[variant],
        block && 'w-full',
        loading && 'cursor-progress',
        inert && 'cursor-not-allowed border-sunken bg-sunken text-text-3 hover:border-sunken hover:bg-sunken active:scale-100',
        className,
      )}
      {...props}
    >
      {loading && <span aria-hidden="true" className="size-[18px] shrink-0 animate-spin rounded-full border-2 border-current border-r-transparent" />}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}
