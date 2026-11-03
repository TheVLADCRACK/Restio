import type { Metadata } from 'next';
import { WebAuthShell } from '../_components/web-auth-shell';
import { AuthLink } from '../_components/auth-link';
import { SignUpForm } from './sign-up-form';

export const metadata: Metadata = { title: 'Créer un compte' };

export default function SignUpPage() {
  return (
    <WebAuthShell dish="grill"
      title="Créer votre compte"
      description="Votre menu QR et vos commandes, au même endroit."
      footer={<AuthLink href="/auth/sign-in">J’ai déjà un compte</AuthLink>}
    >
      <SignUpForm />
    </WebAuthShell>
  );
}
