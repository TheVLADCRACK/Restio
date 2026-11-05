import type { Metadata } from 'next';
import Link from 'next/link';
import { requireAdmin } from '@/lib/auth/session';
import { getRestaurants, type RestaurantFilter } from '@/lib/admin/queries';
import { card, fmt, PageHead, Pager, pageOf, RestaurantRowsMobile, RestaurantTable, SearchForm, searchOf, tab, tabCount } from '../_components/ui';

export const metadata: Metadata = { title: 'Restaurants' };

type Props = { searchParams: Promise<{ q?: string | string[]; statut?: string | string[]; page?: string | string[] }> };
const FILTERS: { key: RestaurantFilter; label: string }[] = [
  { key: 'all', label: 'Tous' },
  { key: 'active', label: 'Actifs' },
  { key: 'empty', label: 'Menu vide' },
  { key: 'suspended', label: 'Suspendus' },
];

export default async function RestaurantsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const filter = FILTERS.find((f) => f.key === params.statut)?.key ?? 'all';
  const search = searchOf(params.q);
  const page = pageOf(params.page);
  const { rows, counts } = await getRestaurants(filter, search, page);
  const url = (next: { statut?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    const statut = next.statut ?? filter;
    if (statut !== 'all') query.set('statut', statut);
    if (next.page && next.page > 1) query.set('page', String(next.page));
    const value = query.toString();
    return value ? `/restaurants?${value}` : '/restaurants';
  };
  const tabs = (
    <div role="tablist" aria-label="Filtrer" className="flex gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {FILTERS.map((f) => (
        <Link key={f.key} role="tab" aria-selected={filter === f.key} href={url({ statut: f.key, page: 1 })} className={tab}>
          {f.label} <em className={tabCount}>{fmt(counts[f.key])}</em>
        </Link>
      ))}
    </div>
  );
  const hidden = filter !== 'all' ? { statut: filter } : undefined;
  const total = counts[filter];
  return (
    <>
      <PageHead title="Restaurants" subtitle={`${fmt(counts.all)} restaurants inscrits`} />
      <section className={`${card} hidden overflow-hidden !p-0 lg:block`}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <SearchForm placeholder="Nom, ville ou propriétaire" value={search} hidden={hidden} />
          {tabs}
        </div>
        {rows.length > 0 ? <RestaurantTable rows={rows} /> : <p className="px-5 py-10 text-center text-[0.9375rem] text-text-2">Aucun restaurant ne correspond.</p>}
        <Pager page={page} total={total} href={(next) => url({ page: next })} />
      </section>
      <div className="grid gap-3 lg:hidden">
        <SearchForm placeholder="Nom, ville ou propriétaire" value={search} hidden={hidden} />
        {tabs}
        {rows.length > 0 ? <RestaurantRowsMobile rows={rows} /> : <p className="py-10 text-center text-[0.9375rem] text-text-2">Aucun restaurant ne correspond.</p>}
      </div>
    </>
  );
}
