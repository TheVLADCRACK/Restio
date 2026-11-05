import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { SettingsShell } from '../_components/settings-shell';
import { NotificationPrefs } from './notification-prefs';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.notif'))('title') };
}

export default async function NotificationSettingsPage() {
  await requireMembership();
  const t = await getTranslations('settingsPages.notif');
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <NotificationPrefs />
    </SettingsShell>
  );
}
