import type { Metadata } from 'next';
import Link from 'next/link';
import { Lock, LogOut, ShieldCheck, User } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { adminSignOutAction } from '@/lib/auth/actions';
import { requireAdmin } from '@/lib/auth/session';
import { env } from '@/lib/env';
import { PageHead } from '../_components/ui';

export const metadata: Metadata = { title: 'Réglages' };

const section = 'grid gap-3.5 rounded-lg border border-line bg-surface p-4 lg:gap-4 lg:rounded-none lg:border-0 lg:border-t lg:p-6 lg:first:border-t-0';

export default async function AdminSettingsPage() {
  const admin = await requireAdmin();
  const others = env().ADMIN_ALLOWED_EMAILS;
  return (
    <>
      <PageHead title="Réglages" subtitle="Votre compte d’administration" />
      <div className="grid max-w-[760px] gap-4 lg:block lg:overflow-hidden lg:rounded-lg lg:border lg:border-line lg:bg-surface">
        <section className={section}>
          <h3 className="text-[0.9375rem] font-bold lg:text-[1.0625rem]">Votre compte</h3>
          <dl className="grid grid-cols-[140px_minmax(0,1fr)] gap-x-4 gap-y-2.5 text-[0.9375rem]">
            <dt className="text-text-2">E-mail</dt>
            <dd className="min-w-0 truncate font-medium">{admin.email}</dd>
          </dl>
          <div>
            <Link href="/auth/first-access" className={buttonClass({ size: 'sm' })}>
              <Lock aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
              Changer le mot de passe
            </Link>
          </div>
        </section>
        <section className={section}>
          <h3 className="text-[0.9375rem] font-bold lg:text-[1.0625rem]">Administrateurs</h3>
          <div>
            {others.map((email) => (
              <div key={email} className="flex items-center gap-3 border-t border-line py-3 first:border-t-0 first:pt-0">
                <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-sm bg-sunken">
                  <User className="size-5" strokeWidth={1.75} />
                </span>
                <b className="min-w-0 truncate font-medium">{email}{email === admin.email ? ' (vous)' : ''}</b>
              </div>
            ))}
          </div>
          <p className="flex gap-2.5 rounded-md bg-ground px-3.5 py-3 text-sm text-text-2">
            <ShieldCheck aria-hidden="true" className="mt-px size-[18px] shrink-0 text-ink" strokeWidth={1.75} />
            La liste des administrateurs est fixée dans la configuration du serveur. Elle ne se modifie pas depuis cette page.
          </p>
        </section>
        <section className={`${section} lg:hidden`}>
          <form action={adminSignOutAction}>
            <button type="submit" className="flex w-full cursor-pointer items-center gap-3 text-left font-bold text-status-danger">
              <span aria-hidden="true" className="grid size-9 place-items-center rounded-sm bg-status-danger-bg">
                <LogOut className="size-[18px]" strokeWidth={1.75} />
              </span>
              Se déconnecter
            </button>
          </form>
        </section>
      </div>
    </>
  );
}
