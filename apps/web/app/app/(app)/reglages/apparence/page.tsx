import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { getRestaurantSettings } from '@/lib/settings/queries';
import { SettingsShell } from '../_components/settings-shell';
import { AppearanceForm } from './appearance-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.appearance'))('title') };
}

export default async function AppearancePage() {
  const { restaurantId } = await requireMembership();
  const [settings, t] = await Promise.all([getRestaurantSettings(restaurantId), getTranslations('settingsPages.appearance')]);
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <AppearanceForm settings={settings} />
    </SettingsShell>
  );
}
