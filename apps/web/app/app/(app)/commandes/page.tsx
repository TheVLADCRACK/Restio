import type { Metadata } from 'next';
import Link from 'next/link';
import { ReceiptText } from 'lucide-react';
import { buttonClass } from '@restio/ui/components/button';
import { EmptyState } from '../_components/empty-state';
import { PageHeader } from '../_components/page-header';

export const metadata: Metadata = { title: 'Commandes' };

export default function OrdersPage() {
  return (
    <>
      <PageHeader title="Commandes" subtitle="Les commandes de vos tables, étape par étape." />
      <div className="mt-6 rounded-lg border border-line bg-surface md:mt-8">
        <EmptyState
          icon={ReceiptText}
          title="Le suivi des commandes arrive ici"
          action={
            <Link href="/" className={buttonClass()}>
              Voir les commandes à traiter
            </Link>
          }
        >
          Vous accepterez, préparerez et remettrez chaque commande passée depuis votre menu QR, en un geste par étape.
        </EmptyState>
      </div>
    </>
  );
}
