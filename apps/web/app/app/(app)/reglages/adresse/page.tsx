import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { getRestaurantSettings } from '@/lib/settings/queries';
import { publicMenuUrl } from '../../_components/public-menu';
import { SettingsShell } from '../_components/settings-shell';
import { AddressForm } from './address-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.address'))('title') };
}

export default async function AddressPage() {
  const { restaurantId } = await requireMembership();
  const [settings, t] = await Promise.all([getRestaurantSettings(restaurantId), getTranslations('settingsPages.address')]);
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <AddressForm slug={settings.slug} isPublished={settings.isPublished} host={env().ROOT_HOST} url={publicMenuUrl(settings.slug).href} />
    </SettingsShell>
  );
}
