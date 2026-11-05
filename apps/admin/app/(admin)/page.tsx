import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { requireAdmin } from '@/lib/auth/session';
import { getOverview } from '@/lib/admin/queries';
import { card, fmt, Kpi, PageHead, RestaurantRowsMobile, RestaurantTable } from './_components/ui';

export const metadata: Metadata = { title: 'Vue d’ensemble' };

export default async function AdminHome() {
  await requireAdmin();
  const o = await getOverview();
  const today = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const label = today.charAt(0).toUpperCase() + today.slice(1);
  const trend = o.ordersLastWeek > 0 ? Math.round(((o.ordersToday - o.ordersLastWeek) / o.ordersLastWeek) * 100) : null;
  return (
    <>
      <PageHead title="Vue d’ensemble" subtitle={`${label} · toute la plateforme`} />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-6">
        <Kpi title="Restaurants actifs" value={fmt(o.active)} foot={`Sur ${fmt(o.total)} inscrits`} delta={o.new7 > 0 ? `+${fmt(o.new7)} en 7 j` : undefined} />
        <Kpi title="Commandes aujourd’hui" value={fmt(o.ordersToday)} foot="Toutes devises" delta={trend !== null ? `${trend >= 0 ? '+' : ''}${trend} %` : undefined} />
        <Kpi title="Nouveaux comptes" value={fmt(o.accounts7)} foot="7 derniers jours" side={<span className="tabular">{fmt(o.unverified)} non vérifié{o.unverified > 1 ? 's' : ''}</span>} />
        <Kpi ink title="Inactifs depuis 7 j" value={fmt(o.inactive7)} foot="À accompagner" side={<b className="text-surface tabular">dont {fmt(o.emptyMenus)} menu{o.emptyMenus > 1 ? 's' : ''} vide{o.emptyMenus > 1 ? 's' : ''}</b>} />
      </div>
      <section className={`${card} hidden overflow-hidden !p-0 lg:block`}>
        <div className="flex items-center gap-2 border-b border-line px-5 py-4">
          <h3 className="text-lg font-bold">Derniers restaurants inscrits</h3>
          <Link href="/restaurants" className="ml-auto inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold hover:bg-sunken">
            Tous les restaurants
            <ArrowRight aria-hidden="true" className="size-[18px]" strokeWidth={1.75} />
          </Link>
        </div>
        <RestaurantTable rows={o.recent} />
      </section>
      <section className="lg:hidden">
        <div className="flex items-baseline justify-between pb-2.5 pt-2">
          <h3 className="text-lg font-bold">Derniers inscrits</h3>
          <Link href="/restaurants" className="text-sm font-bold underline decoration-line-strong underline-offset-[3px]">Tout voir</Link>
        </div>
        <RestaurantRowsMobile rows={o.recent.slice(0, 4)} />
      </section>
    </>
  );
}
