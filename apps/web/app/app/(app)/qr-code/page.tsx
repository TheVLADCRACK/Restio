import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { requireMembership } from '@/lib/auth/session';
import { getUnreadCount } from '@/lib/notifications/queries';
import { getQrSettings } from '@/lib/qr/queries';
import { publicMenuUrl } from '../_components/public-menu';
import { QrImage } from './qr-image';
import { QrWorkspace } from './qr-workspace';

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getTranslations('qr'))('metaTitle') };
}

export default async function QrCodePage() {
  const { restaurantId } = await requireMembership();
  const [settings, unread, t] = await Promise.all([getQrSettings(restaurantId), getUnreadCount(restaurantId), getTranslations('qr')]);
  const { href, label } = publicMenuUrl(settings.slug);
  return (
    <QrWorkspace
      settings={settings}
      href={href}
      address={label}
      unreadCount={unread}
      qr={<QrImage url={href} label={t('qrLabel', { address: label })} className="block h-auto w-full" />}
      miniQr={<QrImage url={href} label="" className="size-full" />}
    />
  );
}
