import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@restio/ui/cn';

// Lien texte des écrans d'auth : cible tactile de 44 px de haut.
export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn('inline-flex min-h-11 items-center font-bold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink', className)}
      {...props}
    />
  );
}
