import type { Metadata } from 'next';
import { getLocale, getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { getMenu } from '@/lib/menu/queries';
import { publicMenuUrl } from '../_components/public-menu';
import { MenuWorkspace } from './menu-workspace';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('menu'))('metaTitle') };
}

export default async function MenuPage() {
  const { restaurantId } = await requireMembership();
  const menu = await getMenu(restaurantId, await getLocale());
  return <MenuWorkspace menu={menu} previewHref={publicMenuUrl(menu.slug).href} />;
}
