import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { LOCALE_COOKIE, isLocale, resolveLocale } from '@/i18n/locale';
import { requireMembership } from '@/lib/auth/session';
import { SettingsShell } from '../_components/settings-shell';
import { LanguageForm } from './language-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.language'))('title') };
}

export default async function LanguagePage() {
  await requireMembership();
  const [t, locale, store, requestHeaders] = await Promise.all([getTranslations('settingsPages.language'), getLocale(), cookies(), headers()]);
  const chosen = store.get(LOCALE_COOKIE)?.value;
  const deviceLocale = resolveLocale(undefined, requestHeaders.get('accept-language'));
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <LanguageForm value={isLocale(chosen) ? chosen : 'device'} deviceLocale={deviceLocale} key={locale} />
    </SettingsShell>
  );
}
