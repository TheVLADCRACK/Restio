import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '../_components/empty-state';
import { PageHeader } from '../_components/page-header';

export const metadata: Metadata = { title: 'Menu' };

export default function MenuPage() {
  return (
    <>
      <PageHeader title="Menu" subtitle="Vos catégories et vos plats." />
      <div className="mt-6 rounded-lg border border-line bg-surface md:mt-8">
        <EmptyState icon={BookOpen} title="Votre menu se construira ici">
          Vous ajouterez vos catégories et vos plats, avec photo et prix, et indiquerez en un geste ce qui est épuisé.
        </EmptyState>
      </div>
    </>
  );
}
