import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert } from '@restio/ui/components/alert';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { AdminSignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Connexion' };

export default async function AdminSignInPage({ searchParams }: { searchParams: Promise<{ password?: string | string[] }> }) {
  const { password } = await searchParams;
  return (
    <AuthShell
      title="Administration"
      description="Accès réservé à l’équipe Restio."
      footer={<Link href="/auth/first-access" className="font-bold underline underline-offset-4">Premier accès ou mot de passe oublié</Link>}
    >
      {password === '1' && (
        <Alert tone="success" className="mb-6">
          Mot de passe enregistré, connectez-vous.
        </Alert>
      )}
      <AdminSignInForm />
    </AuthShell>
  );
}
