import type { Metadata } from 'next';
import { AuthShell } from '@restio/ui/components/auth-shell';
import { RequestCodeForm } from './request-code-form';

export const metadata: Metadata = { title: 'Premier accès' };

export default function FirstAccessPage() {
  return (
    <AuthShell title="Définir le mot de passe" description="Premier accès ou mot de passe oublié : recevez un code à 6 chiffres par email.">
      <RequestCodeForm />
    </AuthShell>
  );
}
