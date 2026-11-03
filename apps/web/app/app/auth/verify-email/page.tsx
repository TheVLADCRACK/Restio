import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { WebAuthShell } from '../_components/web-auth-shell';
import { getPendingEmail } from '@/lib/auth/pending-email';
import { AuthLink } from '../_components/auth-link';
import { VerifyEmailForm } from './verify-email-form';

export const metadata: Metadata = { title: 'Vérifier votre adresse' };

export default async function VerifyEmailPage() {
  // Sans adresse en attente, aucun code ne peut être vérifié (même règle que l'action).
  const email = await getPendingEmail();
  if (!email) redirect('/auth/sign-in');
  return (
    <WebAuthShell dish="grill"
      title="Vérifiez votre adresse"
      description={
        <p>
          Nous avons envoyé un code à 6 chiffres à <strong className="font-bold text-ink wrap-anywhere">{email}</strong>. Pensez à regarder dans les courriers indésirables.
        </p>
      }
      footer={
        <>
          Pas la bonne adresse ? <AuthLink href="/auth/sign-up">Recommencer</AuthLink>
        </>
      }
    >
      <VerifyEmailForm />
    </WebAuthShell>
  );
}
