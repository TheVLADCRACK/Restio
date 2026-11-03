import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth/session';
import { Alert } from '@restio/ui/components/alert';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { AuthLink } from '../_components/auth-link';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Connexion' };
export const dynamic = 'force-dynamic';

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reset?: string | string[]; verified?: string | string[] }> }) {
  const { reset, verified } = await searchParams;
  const user = await getSessionUser();
  if (user?.emailVerified) redirect('/');
  return (
    <AuthShell
      title="Connexion"
      description="Retrouvez vos commandes et votre menu."
      footer={
        <>
          Pas encore de compte ? <AuthLink href="/auth/sign-up">Créer un compte</AuthLink>
        </>
      }
    >
      {verified === '1' && (
        <Alert tone="success" className="mb-6">
          Adresse vérifiée. Connectez-vous pour créer votre restaurant.
        </Alert>
      )}
      {reset === '1' && (
        <Alert tone="success" className="mb-6">
          Mot de passe modifié, connectez-vous.
        </Alert>
      )}
      <SignInForm />
    </AuthShell>
  );
}
