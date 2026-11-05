'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ChevronDown, Globe } from 'lucide-react';
import { cn } from '@restio/ui/cn';
import { setLocaleAction } from '@/i18n/actions';
import { LOCALES } from '@/i18n/locale';

/**
 * Sélecteur de langue de la planche (bouton fantôme globe + langue + chevron).
 * Un <select> natif transparent recouvre le bouton : liste système accessible au clavier et au toucher.
 */
export function LanguageSelect({ className, short }: { className?: string; short?: boolean }) {
  const locale = useLocale();
  const t = useTranslations('common');
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(value: string) {
    startTransition(async () => {
      await setLocaleAction(value);
      router.refresh();
    });
  }

  return (
    <span
      className={cn(
        'relative inline-flex h-10 items-center gap-2 rounded-full px-3 text-sm font-bold text-ink transition-colors focus-within:outline-2 focus-within:outline-ink hover:bg-sunken',
        pending && 'opacity-60',
        className,
      )}
    >
      <Globe aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
      {short ? locale.toUpperCase() : t(`languages.${locale as (typeof LOCALES)[number]}`)}
      {!short && <ChevronDown aria-hidden="true" className="size-4" strokeWidth={2} />}
      <select
        aria-label={t('language')}
        value={locale}
        disabled={pending}
        onChange={(event) => change(event.target.value)}
        className="absolute inset-0 cursor-pointer appearance-none opacity-0"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code}>
            {t(`languages.${code}`)}
          </option>
        ))}
      </select>
    </span>
  );
}
