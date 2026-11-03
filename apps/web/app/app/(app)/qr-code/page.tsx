import type { Metadata } from 'next';
import { QrCode } from 'lucide-react';
import { requireMembership } from '@/lib/auth/session';
import { getRestaurantSummary } from '@/lib/dashboard/queries';
import { EmptyState } from '../_components/empty-state';
import { PageHeader } from '../_components/page-header';
import { publicMenuUrl } from '../_components/public-menu';

export const metadata: Metadata = { title: 'QR Code' };

export default async function QrCodePage() {
  const { restaurantId } = await requireMembership();
  const restaurant = await getRestaurantSummary(restaurantId);
  return (
    <>
      <PageHeader title="QR Code" subtitle={<span className="break-all">{publicMenuUrl(restaurant.slug).label}</span>} />
      <div className="mt-6 rounded-lg border border-line bg-surface md:mt-8">
        <EmptyState icon={QrCode} title="Votre QR Code de table arrive ici">
          Vous pourrez télécharger et imprimer le QR Code qui ouvre votre menu, à poser sur chaque table.
        </EmptyState>
      </div>
    </>
  );
}
