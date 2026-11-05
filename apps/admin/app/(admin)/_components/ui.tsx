import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, CircleCheck, CirclePause, Hourglass, Search, TrendingUp } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { cn } from '@restio/ui/cn';
import type { RestaurantRow, RestaurantStatusKey } from '@/lib/admin/queries';
import { PAGE_SIZE } from '@/lib/admin/queries';

const number = new Intl.NumberFormat('fr-FR');
export const fmt = (value: number) => number.format(value);
export const shortDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(date);
export const longDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
export const clock = (date: Date) => new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
export function relativeDay(date: Date | null): string {
  if (!date) return '—';
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return 'Aujourd’hui';
  const yesterday = new Date(now.getTime() - 86_400_000);
  return date.toDateString() === yesterday.toDateString() ? 'Hier' : shortDate(date);
}
export const providerLabel = (providers: string) => (providers.includes('google') ? (providers.includes('credential') ? 'E-mail et Google' : 'Google') : 'E-mail');
export const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('') || '?';

export const card = 'min-w-0 rounded-lg border border-line bg-surface p-5';
export const tab = 'group inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line-strong bg-surface px-3.5 text-sm font-bold aria-selected:border-ink aria-selected:bg-ink aria-selected:text-surface';
export const tabCount = 'grid h-[22px] min-w-[22px] place-items-center rounded-full bg-sunken px-1.5 text-xs not-italic tabular group-aria-selected:bg-lime group-aria-selected:text-ink';

export function PageHead({ title, subtitle, actions, crumb }: { title: string; subtitle?: string; actions?: ReactNode; crumb?: { href: string; label: string } }) {
  return (
    <>
      <div className="-mx-4 -mt-2 grid h-[calc(52px+env(safe-area-inset-top))] grid-cols-[48px_minmax(0,1fr)_48px] items-center px-1 pt-[env(safe-area-inset-top)] lg:hidden">
        <span>
          {crumb && (
            <Link href={crumb.href} aria-label="Retour" className="grid size-12 place-items-center rounded-full hover:bg-sunken">
              <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.75} />
            </Link>
          )}
        </span>
        <h1 className="truncate text-center text-[1.0625rem] font-bold">{title}</h1>
      </div>
      <header className="hidden min-h-14 items-center gap-4 lg:flex">
        <div className="min-w-0">
          {crumb && (
            <nav aria-label="Fil d’Ariane" className="mb-1 flex items-center gap-1 text-sm text-text-2">
              <Link href={crumb.href} className="hover:text-ink">{crumb.label}</Link>
              <ChevronRight aria-hidden="true" className="size-4" strokeWidth={1.75} />
              <span aria-current="page">{title}</span>
            </nav>
          )}
          <h2 className="text-[1.875rem] font-bold leading-[1.15] tracking-[-0.02em]">{title}</h2>
          {subtitle && <p className="mt-1 text-[0.9375rem] text-text-2 tabular">{subtitle}</p>}
        </div>
        {actions && <div className="ml-auto flex items-center gap-2">{actions}</div>}
      </header>
    </>
  );
}

export function Kpi({ title, value, unit, foot, side, ink, delta }: { title: string; value: string; unit?: string; foot: string; side?: ReactNode; ink?: boolean; delta?: string }) {
  return (
    <article className={cn('flex min-w-0 flex-col gap-3 rounded-lg border p-4 lg:gap-3.5 lg:p-5 lg:pb-4', ink ? 'border-ink bg-ink text-surface' : 'border-line bg-surface')}>
      <h3 className={cn('flex min-h-6 items-center text-[0.8125rem] font-medium leading-tight lg:min-h-11 lg:text-[0.9375rem]', ink ? 'text-on-dark-2' : 'text-text-2')}>{title}</h3>
      <p className="flex flex-wrap items-baseline gap-x-1.5 text-[1.375rem] font-bold leading-none tracking-[-0.03em] lg:text-[2.25rem]">
        <span className="tabular">{value}</span>
        {unit && <small className={cn('text-[0.8125rem] font-medium tracking-normal lg:text-lg', ink ? 'text-on-dark-2' : 'text-text-3')}>{unit}</small>}
      </p>
      <div className={cn('mt-auto hidden min-h-6 items-center justify-between gap-2 whitespace-nowrap border-t pt-3 text-sm lg:flex', ink ? 'border-ink-2 text-on-dark-2' : 'border-line text-text-2')}>
        <span className="truncate">{foot}</span>
        {delta ? (
          <span className="inline-flex items-center gap-1 font-bold text-status-ok tabular">
            <TrendingUp aria-hidden="true" className="size-4" strokeWidth={1.75} />
            {delta}
          </span>
        ) : (
          side
        )}
      </div>
      {delta && <em className="text-xs font-bold not-italic text-status-ok tabular lg:hidden">{delta}</em>}
    </article>
  );
}

const STATUS: Record<RestaurantStatusKey, { label: string; icon: typeof CircleCheck; className: string }> = {
  ok: { label: 'Actif', icon: CircleCheck, className: 'bg-status-ok-bg text-status-ok' },
  cfg: { label: 'Menu vide', icon: Hourglass, className: 'bg-status-new-bg text-status-new' },
  stop: { label: 'Suspendu', icon: CirclePause, className: 'bg-status-danger-bg text-status-danger' },
};

export function StatusBadge({ status }: { status: RestaurantStatusKey }) {
  const { label, icon: Icon, className } = STATUS[status];
  return (
    <span className={cn('inline-flex h-7 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full pl-2 pr-2.5 text-[0.8125rem] font-bold', className)}>
      <Icon aria-hidden="true" className="size-[15px]" strokeWidth={2} />
      {label}
    </span>
  );
}

const mono = (name: string) => (
  <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-[12px] bg-ink text-lg font-black text-lime">
    {name.trim().charAt(0).toUpperCase()}
  </span>
);

export function RestaurantTable({ rows }: { rows: RestaurantRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[0.9375rem]">
        <thead>
          <tr className="border-b border-line bg-ground text-left text-[0.8125rem] text-text-2 [&>th]:whitespace-nowrap [&>th]:px-5 [&>th]:py-2.5 [&>th]:font-medium">
            <th>Restaurant</th>
            <th>Ville</th>
            <th>Propriétaire</th>
            <th className="text-right">Plats</th>
            <th className="text-right">Commandes 30 j</th>
            <th>Statut</th>
            <th>Inscrit</th>
            <th><span className="sr-only">Ouvrir</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.slug} className="border-b border-line last:border-b-0 [&>td]:px-5 [&>td]:py-3">
              <td>
                <div className="flex min-w-0 items-center gap-3">
                  {mono(row.name)}
                  <div className="min-w-0">
                    <b className="block font-bold">{row.name}</b>
                    <span className="block text-[0.8125rem] text-text-2">@{row.slug}</span>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap">{row.city} <span className="text-sm text-text-2">{row.country}</span></td>
              <td>{row.owner}</td>
              <td className="text-right tabular">{row.dishes}</td>
              <td className="text-right tabular">{fmt(row.orders30)}</td>
              <td><StatusBadge status={row.status} /></td>
              <td className="whitespace-nowrap text-sm text-text-2 tabular">{shortDate(row.createdAt)}</td>
              <td>
                <Link href={`/restaurants/${row.slug}`} aria-label={`Ouvrir ${row.name}`} className="grid size-10 place-items-center rounded-full hover:bg-sunken">
                  <ChevronRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RestaurantRowsMobile({ rows }: { rows: RestaurantRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {rows.map((row) => (
        <Link key={row.slug} href={`/restaurants/${row.slug}`} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
          {mono(row.name)}
          <div className="min-w-0 flex-1">
            <b className="block truncate text-[0.9375rem]">{row.name}</b>
            <span className="block truncate text-[0.8125rem] text-text-2 tabular">{row.city} · {row.dishes} plat{row.dishes > 1 ? 's' : ''} · {fmt(row.orders30)} cmd. 30 j</span>
          </div>
          {row.status !== 'ok' && <StatusBadge status={row.status} />}
          <ChevronRight aria-hidden="true" className="size-[18px] shrink-0 text-text-3" strokeWidth={1.75} />
        </Link>
      ))}
    </div>
  );
}

export function SearchForm({ placeholder, value, hidden }: { placeholder: string; value: string; hidden?: Record<string, string> }) {
  return (
    <form role="search" className="relative block w-full lg:w-80">
      {Object.entries(hidden ?? {}).map(([name, v]) => <input key={name} type="hidden" name={name} value={v} />)}
      <label>
        <span className="sr-only">{placeholder}</span>
        <Search aria-hidden="true" className="absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-text-3" strokeWidth={1.75} />
        <input type="search" name="q" defaultValue={value} placeholder={placeholder} maxLength={80} className="h-11 w-full rounded-full border border-line-strong bg-surface pl-[42px] pr-4 text-base placeholder:text-text-3 focus:border-ink focus:shadow-[0_0_0_3px_rgba(15,15,15,.12)] focus:outline-none" />
      </label>
    </form>
  );
}

export function Pager({ page, total, href }: { page: number; total: number; href: (page: number) => string }) {
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const disabled = 'pointer-events-none opacity-50';
  return (
    <div className="flex items-center justify-end gap-2 border-t border-line px-5 py-3 text-sm text-text-2">
      <span className="mr-auto tabular">{from} à {to} sur {fmt(total)}</span>
      <Link href={href(page - 1)} aria-disabled={page <= 1} className={buttonClass({ size: 'sm', className: page <= 1 ? disabled : undefined })}>
        <ChevronLeft aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
        Précédent
      </Link>
      <Link href={href(page + 1)} aria-disabled={to >= total} className={buttonClass({ size: 'sm', className: to >= total ? disabled : undefined })}>
        Suivant
        <ChevronRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
      </Link>
    </div>
  );
}

export const pageOf = (value: string | string[] | undefined) => {
  const page = typeof value === 'string' ? Number.parseInt(value, 10) : 1;
  return Number.isSafeInteger(page) && page > 0 ? page : 1;
};
export const searchOf = (value: string | string[] | undefined) => (typeof value === 'string' ? value.trim().slice(0, 80) : '');
