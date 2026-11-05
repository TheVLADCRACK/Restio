import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { ArrowLeft } from 'lucide-react';

/** Mobile : retour et progression (« .su-head »). */
export async function MobileSteps({ current, back }: { current: 1 | 2; back: string }) {
  const t = await getTranslations('auth.signUp');
  const tc = await getTranslations('common');
  return (
    <div className="flex items-center gap-3 pb-2">
      <Link href={back} aria-label={tc('back')} className="grid size-11 shrink-0 place-items-center rounded-full text-ink hover:bg-sunken">
        <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
      </Link>
      <div role="img" aria-label={t('stepLabel', { current, total: 2 })} className="grid flex-1 grid-cols-2 gap-1">
        <i className="h-1.5 rounded-full bg-ink" />
        <i className={`h-1.5 rounded-full ${current > 1 ? 'bg-ink' : 'bg-sunken'}`} />
      </div>
      <span className="whitespace-nowrap text-sm font-medium text-text-2">{t('step', { current, total: 2 })}</span>
    </div>
  );
}

/** Ordinateur : progression au-dessus du titre (« .su-steps »). */
export async function DesktopSteps({ current }: { current: 1 | 2 }) {
  const t = await getTranslations('auth.signUp');
  return (
    <div className="mb-[18px] flex items-center gap-3">
      <div role="img" aria-label={t('stepLabel', { current, total: 2 })} className="grid w-[120px] grid-cols-2 gap-1">
        <i className="h-1.5 rounded-full bg-ink" />
        <i className={`h-1.5 rounded-full ${current > 1 ? 'bg-ink' : 'bg-sunken'}`} />
      </div>
      <span className="text-sm font-medium text-text-2">{t('stepLabel', { current, total: 2 })}</span>
    </div>
  );
}

/** Mobile : simple flèche de retour. */
export async function MobileBack({ href }: { href: string }) {
  const tc = await getTranslations('common');
  return (
    <Link href={href} aria-label={tc('back')} className="grid size-11 place-items-center rounded-full text-ink hover:bg-sunken">
      <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
    </Link>
  );
}

/** Ordinateur : lien de retour au-dessus du titre (« .back-link »). */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-[18px] inline-flex items-center gap-1.5 text-[0.9375rem] font-bold text-ink">
      <ArrowLeft aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
      {label}
    </Link>
  );
}
