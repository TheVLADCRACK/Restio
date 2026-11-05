import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { getPublicMenu } from '@/lib/public/queries';
import { PublicTop } from '../public-top';
import { OrderRecap } from './order-recap';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('pub.recap'))('metaTitle'), robots: { index: false, follow: false } };
}

export default async function OrderRecapPage({ params }: Props) {
  const { slug } = await params;
  const menu = await getPublicMenu(slug, await getLocale());
  if (!menu) notFound();
  return (
    <>
      <PublicTop name={menu.restaurant.name} logoUrl={menu.restaurant.logoUrl} />
      <OrderRecap menu={menu} />
    </>
  );
}
