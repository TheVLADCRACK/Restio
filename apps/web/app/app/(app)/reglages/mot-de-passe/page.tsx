import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { SettingsShell } from '../_components/settings-shell';
import { PasswordForm } from './password-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('settingsPages.password'))('title') };
}

export default async function PasswordPage() {
  await requireMembership();
  const t = await getTranslations('settingsPages.password');
  return (
    <SettingsShell title={t('title')} subtitle={t('subtitle')}>
      <PasswordForm />
    </SettingsShell>
  );
}
