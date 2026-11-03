import type { Metadata } from 'next';
import Link from 'next/link';
import { ChartColumn } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { EmptyState } from '../_components/empty-state';
import { PageHeader } from '../_components/page-header';

export const metadata: Metadata = { title: 'Statistiques' };

export default function StatsPage() {
  return (
    <>
      <PageHeader title="Statistiques" subtitle="Vos ventes et vos plats, dans le temps." />
      <div className="mt-6 rounded-lg border border-line bg-surface md:mt-8">
        <EmptyState
          icon={ChartColumn}
          title="Des statistiques détaillées arrivent ici"
          action={
            <Link href="/" className={buttonClass()}>
              Voir les 7 derniers jours
            </Link>
          }
        >
          Ventes, commandes et plats les plus demandés, période par période. L’accueil montre déjà les 7 derniers jours.
        </EmptyState>
      </div>
    </>
  );
}
