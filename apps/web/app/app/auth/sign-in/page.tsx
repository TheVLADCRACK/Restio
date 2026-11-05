import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { getSessionUser } from '@/lib/auth/session';
import { Toast } from '@/components/toast';
import { WebAuthShell } from '../_components/web-auth-shell';
import { AuthLink } from '../_components/auth-link';
import { SignInForm } from './sign-in-form';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth.signIn'))('metaTitle') };
}
export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reset?: string | string[]; verified?: string | string[] }> }) {
  const { reset, verified } = await searchParams;
  const user = await getSessionUser();
  if (user?.emailVerified) redirect('/');
  const t = await getTranslations('auth.signIn');
  return (
    <WebAuthShell
      title={t('title')}
      description={t('description')}
      footer={
        <>
          {t('noAccount')} <AuthLink href="/auth/sign-up">{t('createAccount')}</AuthLink>
        </>
      }
    >
      {verified === '1' && <Toast tone="success">{t('verified')}</Toast>}
      {reset === '1' && <Toast tone="success">{t('reset')}</Toast>}
      <SignInForm />
    </WebAuthShell>
  );
}
