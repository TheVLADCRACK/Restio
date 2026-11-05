import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Mail } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { AuthPhoto, renderMark } from '../_components/web-auth-shell';
import { GoogleSignIn, OrDivider } from '../_components/google-sign-in';

const legal = 'text-ink underline underline-offset-2';

/** Planche « Accueil mobile » : photo, feuille blanche, « Créer mon restaurant », puis Google ou e-mail. */
export async function Welcome() {
  const t = await getTranslations('auth.welcome');
  const tc = await getTranslations('common');
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <div className="relative h-[clamp(260px,50dvh,420px)] shrink-0 overflow-hidden bg-ink [&_img]:size-full [&_img]:object-cover">
        <AuthPhoto dish="grill" />
        <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,15,15,.55)_0%,rgba(15,15,15,0)_30%)]" />
        <span className="absolute left-3 top-[max(12px,env(safe-area-inset-top))] z-10 flex h-10 items-center gap-2.5 text-surface">
          {renderMark('white', 30)}
          <span className="text-[1.3125rem] font-bold tracking-[-0.02em]">Restio</span>
        </span>
      </div>
      <main className="relative z-10 -mt-7 flex flex-1 flex-col gap-3.5 rounded-t-xl bg-surface px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-[26px] text-center">
        <h1 className="text-[1.625rem] font-bold leading-[1.15] tracking-[-0.02em] text-ink">{t('title')}</h1>
        <p className="-mt-1.5 text-[0.9375rem] text-text-2">{t('description')}</p>
        <Link href="/auth/sign-up?step=email" className={buttonClass({ variant: 'primary', block: true })}>
          {t('create')}
        </Link>
        <OrDivider label={t('orWith')} />
        <div className="grid grid-cols-2 gap-2">
          <GoogleSignIn short />
          <Link href="/auth/sign-up?step=email" className={buttonClass({ variant: 'secondary' })}>
            <Mail aria-hidden="true" className="size-5" strokeWidth={1.75} />
            {t('email')}
          </Link>
        </div>
        <p className="mt-auto pt-4 text-[0.8125rem] text-text-2">
          {t.rich('fine', {
            terms: (chunks) => (
              <Link href="/legal/conditions" target="_blank" rel="noopener" className={legal}>
                {chunks}
                <span className="sr-only"> {tc('newTab')}</span>
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/legal/confidentialite" target="_blank" rel="noopener" className={legal}>
                {chunks}
                <span className="sr-only"> {tc('newTab')}</span>
              </Link>
            ),
          })}
        </p>
      </main>
    </div>
  );
}
