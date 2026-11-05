import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WebAuthShell } from '../_components/web-auth-shell';
import { BackLink, MobileBack } from '../_components/auth-steps';
import { ForgotPasswordForm } from './forgot-password-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth.forgot'))('metaTitle') };
}

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth.forgot');
  return (
    <WebAuthShell title={t('title')} description={t('description')} mobileTop={<MobileBack href="/auth/sign-in" />} eyebrow={<BackLink href="/auth/sign-in" label={t('back')} />}>
      <ForgotPasswordForm />
    </WebAuthShell>
  );
}
