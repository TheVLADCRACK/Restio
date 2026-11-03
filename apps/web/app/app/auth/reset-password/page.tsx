import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WebAuthShell } from '../_components/web-auth-shell';
import { getPendingEmail } from '@/lib/auth/pending-email';
import { AuthLink } from '../_components/auth-link';
import { ResetPasswordForm } from './reset-password-form';

export const metadata: Metadata = { title: 'Nouveau mot de passe' };

export default async function ResetPasswordPage() {
  // Sans adresse en attente, l'action renverrait de toute façon vers « Mot de passe oublié ».
  const email = await getPendingEmail();
  if (!email) redirect('/auth/forgot-password');
  return (
    <WebAuthShell
      title="Nouveau mot de passe"
      description={
        <p>
          Si un compte existe pour <strong className="font-bold text-ink wrap-anywhere">{email}</strong>, un code à 6 chiffres vient d’y être envoyé.
        </p>
      }
      footer={<AuthLink href="/auth/forgot-password">Changer d’adresse</AuthLink>}
    >
      <ResetPasswordForm />
    </WebAuthShell>
  );
}
