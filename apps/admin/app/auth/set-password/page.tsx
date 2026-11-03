import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { getPendingEmail } from '@/lib/auth/pending-email';
import { SetPasswordForm } from './set-password-form';

export const metadata: Metadata = { title: 'Nouveau mot de passe' };

export default async function SetPasswordPage() {
  if (!(await getPendingEmail())) redirect('/auth/first-access');
  return (
    <AuthShell title="Nouveau mot de passe" description="Si l’adresse est autorisée, un code vient d’être envoyé. Il expire après quelques minutes.">
      <SetPasswordForm />
    </AuthShell>
  );
}
