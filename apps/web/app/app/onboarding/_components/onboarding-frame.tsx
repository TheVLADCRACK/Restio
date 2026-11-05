import Image from 'next/image';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { signOutAction } from '@/lib/auth/actions';

/** Planche « Création » : barre haute et carte de 560 px sur ordinateur, retour et progression sur mobile. */
export async function OnboardingFrame({ step, label, back, title, description, children }: { step: 1 | 2; label: string; back: string; title: string; description: string; children: ReactNode }) {
  const t = await getTranslations('onboarding');
  const tc = await getTranslations('common');
  const bars = (off: string) => (
    <>
      <i className="h-1.5 rounded-full bg-ink" />
      <i className={`h-1.5 rounded-full ${step > 1 ? 'bg-ink' : off}`} />
    </>
  );
  return (
    <div className="min-h-dvh bg-surface md:bg-ground md:pb-10">
      <div className="hidden items-center gap-4 px-10 py-6 md:flex">
        <span className="flex h-10 items-center gap-2.5 px-2">
          <Image src="/brand/restio-mark-ink.png" alt="" width={30} height={30} />
          <b className="text-[1.3125rem] font-bold tracking-[-0.02em]">Restio</b>
        </span>
        <div role="img" aria-label={t('step', { step, total: 2 })} className="ml-auto grid w-60 grid-cols-2 gap-1">
          {bars('bg-line-strong')}
        </div>
        <span className="text-sm font-medium text-text-2">{t('stepShort', { step, total: 2, label })}</span>
        <form action={signOutAction}>
          <button type="submit" className="h-10 cursor-pointer rounded-full px-4 text-sm font-bold hover:bg-sunken">
            {t('signOut')}
          </button>
        </form>
      </div>
      <div className="flex items-center gap-3 pb-2 pl-1.5 pr-3 pt-[max(4px,env(safe-area-inset-top))] md:hidden">
        <Link href={back} aria-label={tc('back')} className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-sunken">
          <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
        </Link>
        <div role="img" aria-label={t('step', { step, total: 2 })} className="grid flex-1 grid-cols-2 gap-1">
          {bars('bg-sunken')}
        </div>
        <span className="whitespace-nowrap text-sm font-medium text-text-2 tabular">{step} / 2</span>
      </div>
      <main className="mx-auto grid max-w-[560px] gap-4 px-4 pb-8 pt-2 md:mt-6 md:gap-[18px] md:rounded-xl md:border md:border-line md:bg-surface md:p-8">
        <div>
          <h1 className="text-[1.625rem] font-bold leading-[1.15] tracking-[-0.02em] md:text-[1.875rem]">{title}</h1>
          <p className="mt-1.5 text-[0.9375rem] text-text-2 md:text-base">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
