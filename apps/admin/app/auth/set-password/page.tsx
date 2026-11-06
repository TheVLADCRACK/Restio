import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AdminAuthShell } from '../admin-auth-shell';
import { getPendingEmail } from '@/lib/auth/pending-email';
import { SetPasswordForm } from './set-password-form';

export const metadata: Metadata = { title: 'Choisir le mot de passe' };

export default async function SetPasswordPage() {
  const email = await getPendingEmail();
  if (!email) redirect('/auth/first-access');
  return (
    <AdminAuthShell title="Choisir le mot de passe" description={<>Code envoyé à {email}.</>} footer={<Link href="/auth/first-access">Changer d’adresse</Link>}>
      <SetPasswordForm />
    </AdminAuthShell>
  );
}
