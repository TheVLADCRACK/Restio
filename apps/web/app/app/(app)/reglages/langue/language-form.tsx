'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Info } from 'lucide-react';
import { Toast } from '@/components/toast';
import { setLocaleAction } from '@/i18n/actions';
import type { Locale } from '@/i18n/locale';
import { formCard, Section } from '../_components/settings-form';

const option = 'flex min-h-[60px] cursor-pointer items-center gap-3 rounded-md border border-line bg-surface px-4 py-2.5 hover:border-line-strong has-checked:border-ink has-checked:shadow-[0_0_0_1px_var(--color-ink)]';

export function LanguageForm({ value, deviceLocale }: { value: string; deviceLocale: Locale }) {
  const t = useTranslations('settingsPages.language');
  const tc = useTranslations('common');
  const router = useRouter();
  const [selected, setSelected] = useState(value);
  const [saved, setSaved] = useState(0);
  const [pending, start] = useTransition();

  function change(next: string) {
    setSelected(next);
    start(async () => {
      await setLocaleAction(next);
      setSaved((count) => count + 1);
      router.refresh();
    });
  }

  const row = (code: string, name: string, hint?: string) => (
    <label className={option}>
      <input type="radio" name="language" value={code} checked={selected === code} disabled={pending} onChange={() => change(code)} className="size-5 shrink-0 accent-ink" />
      <span className="min-w-0 flex-1">
        <b className="block text-base">{name}</b>
        {hint && <span className="block text-sm text-text-2">{hint}</span>}
      </span>
    </label>
  );

  return (
    <div className={formCard}>
      {saved > 0 && !pending && <Toast key={saved} tone="success">{t('saved')}</Toast>}
      <Section title={t('section')}>
        <div role="radiogroup" aria-label={t('section')} className="grid gap-2">
          {row('device', t('device'), t('current', { name: tc(`languages.${deviceLocale}`) }))}
          {row('fr', tc('languages.fr'))}
          {row('en', tc('languages.en'))}
        </div>
        <p className="flex gap-2.5 rounded-md bg-ground px-3.5 py-3 text-sm text-text-2">
          <Info aria-hidden="true" className="mt-px size-[18px] shrink-0 text-ink" strokeWidth={1.75} />
          {t('info')}
        </p>
      </Section>
    </div>
  );
}
