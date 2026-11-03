import type { Metadata } from 'next';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { AuthLink } from '../_components/auth-link';
import { SignUpForm } from './sign-up-form';

export const metadata: Metadata = { title: 'Créer un compte' };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Créer votre compte"
      description="Votre menu QR et vos commandes, au même endroit."
      footer={<AuthLink href="/auth/sign-in">J’ai déjà un compte</AuthLink>}
    >
      <SignUpForm />
    </AuthShell>
  );
}
