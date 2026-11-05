import type { Metadata } from 'next';
import Link from 'next/link';
import { Check, MailWarning } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getAccounts } from '@/lib/admin/queries';
import { card, fmt, initials, Kpi, PageHead, Pager, pageOf, providerLabel, relativeDay, SearchForm, searchOf, tab, tabCount } from '../_components/ui';

export const metadata: Metadata = { title: 'Comptes et abonnements' };

type Props = { searchParams: Promise<{ q?: string | string[]; filtre?: string | string[]; page?: string | string[] }> };

export default async function AccountsPage({ searchParams }: Props) {
  await requireAdmin();
  const params = await searchParams;
  const filter = params.filtre === 'non-verifies' ? 'unverified' : 'all';
  const search = searchOf(params.q);
  const page = pageOf(params.page);
  const { rows, totals } = await getAccounts(filter, search, page);
  const url = (next: { filtre?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (search) query.set('q', search);
    const value = next.filtre ?? (filter === 'unverified' ? 'non-verifies' : '');
    if (value) query.set('filtre', value);
    if (next.page && next.page > 1) query.set('page', String(next.page));
    const text = query.toString();
    return text ? `/comptes?${text}` : '/comptes';
  };
  const avatar = (name: string) => <span aria-hidden="true" className="grid size-10 shrink-0 place-items-center rounded-full bg-sunken text-sm font-bold">{initials(name)}</span>;
  const hidden = filter === 'unverified' ? { filtre: 'non-verifies' } : undefined;
  const free = totals.restaurants - totals.paid;
  const freeShare = totals.restaurants > 0 ? new Intl.NumberFormat('fr-FR', { style: 'percent' }).format(free / totals.restaurants) : '—';
  return (
    <>
      <PageHead title="Comptes" subtitle={`${fmt(totals.all)} comptes · ${fmt(totals.restaurants)} restaurants`} />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6">
        <Kpi title="Comptes" value={fmt(totals.all)} foot="Propriétaires" side={<span className="tabular">+{fmt(totals.new7)} en 7 j</span>} />
        <div className="hidden lg:grid"><Kpi title="E-mails non vérifiés" value={fmt(totals.unverified)} foot="Inscription non terminée" /></div>
        <Kpi title="Offre Gratuite" value={fmt(free)} foot="Tous les restaurants" side={<span className="tabular">{freeShare}</span>} />
        <div className="hidden lg:grid"><Kpi title="Offres payantes" value={fmt(totals.paid)} foot="Paiements non activés" /></div>
      </div>
      <section className={`${card} hidden overflow-hidden !p-0 lg:block`}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <SearchForm placeholder="Nom ou e-mail" value={search} hidden={hidden} />
          <div role="tablist" aria-label="Filtrer" className="flex gap-1.5">
            <Link role="tab" aria-selected={filter === 'all'} href={url({ filtre: '', page: 1 })} className={tab}>Tous <em className={tabCount}>{fmt(totals.all)}</em></Link>
            <Link role="tab" aria-selected={filter === 'unverified'} href={url({ filtre: 'non-verifies', page: 1 })} className={tab}>Non vérifiés <em className={tabCount}>{fmt(totals.unverified)}</em></Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[0.9375rem]">
            <thead>
              <tr className="border-b border-line bg-ground text-left text-[0.8125rem] text-text-2 [&>th]:whitespace-nowrap [&>th]:px-5 [&>th]:py-2.5 [&>th]:font-medium">
                <th>Compte</th><th>Restaurant</th><th>E-mail</th><th>Connexion</th><th>Dernière visite</th><th>Offre</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.email} className="border-b border-line last:border-b-0 [&>td]:px-5 [&>td]:py-3">
                  <td>
                    <div className="flex min-w-0 items-center gap-3">
                      {avatar(u.name || u.email)}
                      <div className="min-w-0">
                        <b className="block font-bold">{u.name || '—'}</b>
                        <span className="block text-[0.8125rem] text-text-2">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>{u.restaurant || '—'}</td>
                  <td>
                    {u.verified ? (
                      <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-status-ok-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-ok"><Check aria-hidden="true" className="size-[15px]" strokeWidth={2} />Vérifié</span>
                    ) : (
                      <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-full bg-status-new-bg pl-2 pr-2.5 text-[0.8125rem] font-bold text-status-new"><MailWarning aria-hidden="true" className="size-[15px]" strokeWidth={2} />Non vérifié</span>
                    )}
                  </td>
                  <td className="text-sm text-text-2">{providerLabel(u.provider)}</td>
                  <td className="text-sm text-text-2">{relativeDay(u.lastSeen)}</td>
                  <td><span className="inline-flex h-7 items-center rounded-full bg-status-muted-bg px-2.5 text-[0.8125rem] font-bold text-status-muted">Gratuit</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pager page={page} total={filter === 'unverified' ? totals.unverified : totals.all} href={(next) => url({ page: next })} />
      </section>
      <div className="grid gap-3 lg:hidden">
        <SearchForm placeholder="Nom ou e-mail" value={search} hidden={hidden} />
        <div className="overflow-hidden rounded-lg border border-line bg-surface">
          {rows.map((u) => (
            <div key={u.email} className="flex items-center gap-3 border-t border-line px-3.5 py-3 first:border-t-0">
              {avatar(u.name || u.email)}
              <div className="min-w-0 flex-1">
                <b className="block truncate text-[0.9375rem]">{u.name || u.email}</b>
                <span className="block truncate text-[0.8125rem] text-text-2">{u.restaurant || '—'} · {relativeDay(u.lastSeen)}</span>
              </div>
              {!u.verified && <span className="inline-flex h-7 shrink-0 items-center rounded-full bg-status-new-bg px-2.5 text-[0.8125rem] font-bold text-status-new">Non vérifié</span>}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
