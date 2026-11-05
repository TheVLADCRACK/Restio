import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { getRestaurantSettings } from '@/lib/settings/queries';
import { countryOptions, currencyOptions } from '../../../onboarding/_components/options';
import { SettingsShell } from '../_components/settings-shell';
import { InfoForm } from './info-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.info'))('title') };
}

export default async function InformationsPage() {
  const { restaurantId } = await requireMembership();
  const [settings, t, locale] = await Promise.all([getRestaurantSettings(restaurantId), getTranslations('settingsPages.info'), getLocale()]);
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <InfoForm settings={settings} countries={countryOptions(locale).map(({ code, name }) => ({ code, name }))} currencies={currencyOptions(locale)} timezones={Intl.supportedValuesOf('timeZone')} />
    </SettingsShell>
  );
}
