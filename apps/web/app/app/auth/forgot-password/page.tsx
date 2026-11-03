import type { Metadata } from 'next';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { AuthLink } from '../_components/auth-link';
import { ForgotPasswordForm } from './forgot-password-form';

export const metadata: Metadata = { title: 'Mot de passe oublié' };

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Mot de passe oublié"
      description="Indiquez l’adresse email de votre compte. Nous vous enverrons un code pour choisir un nouveau mot de passe."
      footer={<AuthLink href="/auth/sign-in">Retour à la connexion</AuthLink>}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
