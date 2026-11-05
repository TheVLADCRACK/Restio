import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { WebAuthShell } from '../_components/web-auth-shell';
import { getPendingEmail } from '@/lib/auth/pending-email';
import { AuthLink } from '../_components/auth-link';
import { DesktopSteps, MobileSteps } from '../_components/auth-steps';
import { VerifyEmailForm } from './verify-email-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth.verify'))('metaTitle') };
}

export default async function VerifyEmailPage() {
  // Sans adresse en attente, aucun code ne peut être vérifié (même règle que l'action).
  const email = await getPendingEmail();
  if (!email) redirect('/auth/sign-in');
  const t = await getTranslations('auth.verify');
  return (
    <WebAuthShell
      dish="grill"
      mobileTop={<MobileSteps current={2} back="/auth/sign-up?step=email" />}
      eyebrow={<DesktopSteps current={2} />}
      title={t('title')}
      description={<p>{t.rich('description', { email: () => <strong className="font-bold text-ink wrap-anywhere">{email}</strong> })}</p>}
      footer={<AuthLink href="/auth/sign-up?step=email">{t('changeEmail')}</AuthLink>}
    >
      <VerifyEmailForm />
    </WebAuthShell>
  );
}
