import type { Metadata } from 'next';
import { Alert } from '@restio/ui/components/alert';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { AuthLink } from '../_components/auth-link';
import { SignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Connexion' };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ reset?: string | string[] }> }) {
  const { reset } = await searchParams;
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
      {reset === '1' && (
        <Alert tone="success" className="mb-6">
          Mot de passe modifié, connectez-vous.
        </Alert>
      )}
      <SignInForm />
    </AuthShell>
  );
}
