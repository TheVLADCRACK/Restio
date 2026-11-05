import Image, { getImageProps } from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { BellRing, Check, MessageSquareText } from 'lucide-react';
import { AuthShell, type AuthShellProps } from '@restio/ui/components/auth-shell';
import { LanguageSelect } from '@/components/language-select';
import { env } from '@/lib/env';

const PHOTOS = {
  bowl: { mobile: { src: '/images/auth/dish-bowl-800.webp', width: 800, height: 1200 }, desktop: { src: '/images/auth/dish-bowl-1400.webp', width: 1400, height: 2100 } },
  grill: { mobile: { src: '/images/auth/dish-grill-800.webp', width: 800, height: 533 }, desktop: { src: '/images/auth/dish-grill-1400.webp', width: 1400, height: 933 } },
} as const;

export type AuthDish = keyof typeof PHOTOS;

// Direction artistique : un seul <img>, la variante 1400 px n'est chargée qu'à partir de 1024 px.
export function AuthPhoto({ dish }: { dish: AuthDish }) {
  const { mobile, desktop } = PHOTOS[dish];
  const common = { alt: '', quality: 70 };
  const { props: { srcSet: desktopSet } } = getImageProps({ ...common, ...desktop, sizes: '50vw' });
  const { props: { srcSet: mobileSet, ...img } } = getImageProps({ ...common, ...mobile, sizes: '100vw', loading: 'eager', fetchPriority: 'high' });
  return (
    <picture>
      <source media="(min-width: 1024px)" srcSet={desktopSet} sizes="50vw" />
      <source srcSet={mobileSet} sizes="100vw" />
      {/* eslint-disable-next-line jsx-a11y/alt-text -- alt vide fourni par getImageProps (photo décorative) */}
      <img {...img} />
    </picture>
  );
}

async function AuthPromise() {
  const t = await getTranslations('auth.promise');
  return (
    <div className="grid gap-[18px]">
      <p className="max-w-[18ch] text-[2.125rem] font-bold leading-[1.12] tracking-[-0.025em]">{t('title')}</p>
      <ul className="grid gap-2.5 text-base">
        {(['point1', 'point2', 'point3'] as const).map((key) => (
          <li key={key} className="flex items-center gap-2.5">
            <span aria-hidden="true" className="grid size-[22px] shrink-0 place-items-center rounded-full bg-lime text-ink">
              <Check className="size-4" strokeWidth={2.5} />
            </span>
            {t(key)}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Planche « Connexion bureau » : notification puis ticket #42, purement illustratifs. */
async function AuthFloat() {
  const t = await getTranslations('auth.demo');
  const money = new Intl.NumberFormat(await getLocale());
  const lines = [
    { q: 2, name: t('dish1'), price: 9000 },
    { q: 1, name: t('dish2'), price: 1000 },
  ];
  return (
    <div aria-hidden="true" className="contents">
      <div className="flex items-center gap-3 rounded-md bg-ink py-3 pl-4 pr-3.5 text-surface shadow-[var(--shadow-floating)]">
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime text-ink">
          <BellRing className="size-4" strokeWidth={2.25} />
        </span>
        <p className="text-[0.9375rem]">
          {t('notifTitle')}
          <span className="block text-[0.8125rem] text-on-dark-2">{t('notifMeta')}</span>
        </p>
      </div>
      <div className="grid gap-3 rounded-lg bg-surface p-4 text-ink shadow-[var(--shadow-floating)]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="tabular text-xl font-bold leading-[1.3] tracking-[-0.01em]">#42</p>
            <p className="mt-0.5 text-sm text-text-2">{t('ticketMeta')}</p>
          </div>
          <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-status-new-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-new">
            <BellRing className="size-[15px]" strokeWidth={2} />
            {t('statusNew')}
          </span>
        </div>
        <ul className="grid gap-1 text-[0.9375rem]">
          {lines.map((line) => (
            <li key={line.name} className="flex gap-2.5">
              <span className="min-w-6 font-bold">{line.q}×</span>
              {line.name}
              <span className="ml-auto whitespace-nowrap text-text-2 tabular">{money.format(line.price)} FCFA</span>
            </li>
          ))}
        </ul>
        <p className="flex gap-2 rounded-sm bg-ground px-2.5 py-2 text-sm text-text-2">
          <MessageSquareText className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
          {t('note')}
        </p>
        <p className="flex justify-between border-t border-dashed border-line-strong pt-2.5 font-bold">
          {t('total')}
          <span className="tabular">{money.format(10000)} FCFA</span>
        </p>
        <div className="grid grid-cols-4 gap-1">
          <i className="h-1.5 rounded-full bg-lime shadow-[inset_0_0_0_1.5px_var(--color-ink)]" />
          <i className="h-1.5 rounded-full bg-sunken" />
          <i className="h-1.5 rounded-full bg-sunken" />
          <i className="h-1.5 rounded-full bg-sunken" />
        </div>
      </div>
    </div>
  );
}

async function AuthHelp() {
  const url = env().WHATSAPP_COMMUNITY_URL;
  if (!url) return null;
  const t = await getTranslations('common');
  return (
    <p>
      {t('help')}{' '}
      <a href={url} target="_blank" rel="noopener noreferrer" className="font-bold text-ink hover:underline">
        {t('whatsappCommunity')}
        <span className="sr-only"> {t('newTab')}</span>
      </a>
    </p>
  );
}

// Sur l'hôte app.*, le proxy réécrit /brand/… vers /app/brand/… : le symbole passe donc par next/image.
export const renderMark = (tone: 'ink' | 'white', size: number) => <Image src={`/brand/restio-mark-${tone}.png`} alt="" width={size} height={size} style={{ width: size, height: size }} />;

/** AuthShell de l'application restaurateur : photo de plat, cartes, promesse, langue et aide. */
export function WebAuthShell({ dish = 'bowl', ...props }: Omit<AuthShellProps, 'media' | 'promise' | 'float' | 'topRight' | 'help' | 'renderMark'> & { dish?: AuthDish }) {
  return (
    <AuthShell
      {...props}
      media={<AuthPhoto dish={dish} />}
      float={<AuthFloat />}
      promise={<AuthPromise />}
      topRight={<LanguageSelect />}
      help={<AuthHelp />}
      renderMark={renderMark}
    />
  );
}
