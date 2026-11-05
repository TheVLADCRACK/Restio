import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { getPublicMenu } from '@/lib/public/queries';
import { PublicMenuView } from './public-menu-view';
import { PublicTop } from './public-top';

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ table?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const menu = await getPublicMenu(slug, await getLocale());
  if (!menu) return {};
  const { name, description, meta, isIndexable } = menu.restaurant;
  return { title: name, description: description || meta, robots: isIndexable ? undefined : { index: false, follow: false } };
}

// Étiquette de table du QR Code : donnée publique, simple repère pour la salle, jamais une autorisation.
const TABLE = /^[\p{L}\p{N} _-]{1,20}$/u;

export default async function PublicMenuPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { table } = await searchParams;
  const menu = await getPublicMenu(slug, await getLocale());
  if (!menu) notFound();
  return (
    <>
      <PublicTop name={menu.restaurant.name} logoUrl={menu.restaurant.logoUrl} />
      <PublicMenuView menu={menu} table={typeof table === 'string' && TABLE.test(table) ? table : undefined} />
    </>
  );
}
