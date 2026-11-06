import type { Metadata } from 'next';
import Link from 'next/link';
import { AdminAuthShell } from '../admin-auth-shell';
import { RequestCodeForm } from './request-code-form';

export const metadata: Metadata = { title: 'Premier accès' };

export default function FirstAccessPage() {
  return (
    <AdminAuthShell title="Premier accès" description="Recevez un code pour choisir votre mot de passe." footer={<Link href="/auth/sign-in">Retour à la connexion</Link>}>
      <RequestCodeForm />
    </AdminAuthShell>
  );
}
