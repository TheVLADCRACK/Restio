import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { WebAuthShell } from '../_components/web-auth-shell';
import { AuthLink } from '../_components/auth-link';
import { DesktopSteps, MobileSteps } from '../_components/auth-steps';
import { SignUpForm } from './sign-up-form';
import { Welcome } from './welcome';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('auth.signUp'))('metaTitle') };
}

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ step?: string | string[] }> }) {
  const { step } = await searchParams;
  const t = await getTranslations('auth.signUp');
  const shell = (
    <WebAuthShell
      dish="grill"
      title={t('title')}
      description={t('description')}
      mobileTop={<MobileSteps current={1} back="/auth/sign-up" />}
      eyebrow={<DesktopSteps current={1} />}
      footer={
        <>
          {t('hasAccount')} <AuthLink href="/auth/sign-in">{t('signIn')}</AuthLink>
        </>
      }
    >
      <SignUpForm />
    </WebAuthShell>
  );
  if (step === 'email') return shell;
  // Sans étape : accueil sur mobile, formulaire directement sur ordinateur.
  return (
    <>
      <div className="lg:hidden">
        <Welcome />
      </div>
      <div className="max-lg:hidden">{shell}</div>
    </>
  );
}
