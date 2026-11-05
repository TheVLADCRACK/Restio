import { NextResponse, type NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { z } from 'zod';
import { requireMembership } from '@/lib/auth/session';
import { qrPng, supportPdf } from '@/lib/qr/build';
import { getQrSettings } from '@/lib/qr/queries';
import { publicMenuUrl } from '../../_components/public-menu';

const query = z.object({ format: z.enum(['png', 'pdf']), support: z.enum(['tent', 'sticker', 'poster']).default('poster'), all: z.enum(['1']).optional() });

// Fichiers générés à la demande, uniquement pour le restaurant de la session.
export async function GET(request: NextRequest) {
  const { restaurantId } = await requireMembership();
  const parsed = query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return new NextResponse(null, { status: 400 });
  const { format, support, all } = parsed.data;
  const settings = await getQrSettings(restaurantId);
  const { href } = publicMenuUrl(settings.slug);
  const headers = (type: string, name: string) => ({ 'Content-Type': type, 'Content-Disposition': `attachment; filename="restio-${settings.slug}-${name}"`, 'Cache-Control': 'private, no-store' });

  if (format === 'png') return new NextResponse(new Uint8Array(await qrPng(href)), { headers: headers('image/png', 'qr-code.png') });

  const t = await getTranslations('qr');
  const tableLabel = (name: string) => (/^\d+$/.test(name) ? t('tableNumber', { number: name }) : name);
  const pages = all && settings.tables.length > 0 ? settings.tables.map((name) => ({ url: `${href}?table=${encodeURIComponent(name)}`, label: tableLabel(name) })) : [{ url: href, label: settings.name }];
  const bytes = await supportPdf(support, pages, t('cta'));
  return new NextResponse(new Uint8Array(bytes), { headers: headers('application/pdf', `${support}.pdf`) });
}
