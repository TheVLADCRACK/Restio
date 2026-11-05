import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WebAuthShell } from '../_components/web-auth-shell';
import { getPendingEmail } from '@/lib/auth/pending-email';
import { AuthLink } from '../_components/auth-link';
import { BackLink, MobileBack } from '../_components/auth-steps';
import { ResetPasswordForm } from './reset-password-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth.reset'))('metaTitle') };
}

export default async function ResetPasswordPage() {
  // Sans adresse en attente, l'action renverrait de toute façon vers « Mot de passe oublié ».
  const email = await getPendingEmail();
  if (!email) redirect('/auth/forgot-password');
  const t = await getTranslations('auth.reset');
  const tForgot = await getTranslations('auth.forgot');
  return (
    <WebAuthShell
      title={t('title')}
      description={<p>{t.rich('description', { email: () => <strong className="font-bold text-ink wrap-anywhere">{email}</strong> })}</p>}
      mobileTop={<MobileBack href="/auth/forgot-password" />}
      eyebrow={<BackLink href="/auth/sign-in" label={tForgot('back')} />}
      footer={<AuthLink href="/auth/forgot-password">{t('resend')}</AuthLink>}
    >
      <ResetPasswordForm />
    </WebAuthShell>
  );
}
