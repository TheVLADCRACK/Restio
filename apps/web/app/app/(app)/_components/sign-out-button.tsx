'use client';

import { useFormStatus } from 'react-dom';
import { useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';

// Bouton bloqué pendant l'envoi : pas de double déconnexion.
export function SignOutButton() {
  const t = useTranslations('settings');
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending || undefined}
      className="flex min-h-14 w-full items-center gap-3.5 px-3.5 py-2.5 text-left text-status-danger transition-colors hover:bg-ground disabled:cursor-progress"
    >
      <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-sm bg-status-danger-bg">
        <LogOut className="size-[18px]" strokeWidth={1.75} />
      </span>
      <span className="text-base font-bold">{pending ? t('signingOut') : t('signOut')}</span>
    </button>
  );
}
