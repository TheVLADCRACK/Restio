import type { Metadata } from 'next';
import Link from 'next/link';
import { Alert } from '@restio/ui/components/alert';
import { AdminAuthShell } from '../admin-auth-shell';
import { AdminSignInForm } from './sign-in-form';

export const metadata: Metadata = { title: 'Connexion' };

export default async function AdminSignInPage({ searchParams }: { searchParams: Promise<{ password?: string | string[] }> }) {
  const { password } = await searchParams;
  return (
    <AdminAuthShell
      title="Administration"
      description="Accès réservé à l’équipe Restio."
      footer={<Link href="/auth/first-access">Premier accès ou mot de passe oublié</Link>}
    >
      {password === '1' && (
        <Alert tone="success">
          Mot de passe enregistré
          <span className="block text-[0.8125rem] text-on-dark-2">Connectez-vous avec votre nouveau mot de passe.</span>
        </Alert>
      )}
      <AdminSignInForm />
    </AdminAuthShell>
  );
}
