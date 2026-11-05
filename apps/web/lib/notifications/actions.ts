'use server';

import { revalidatePath } from 'next/cache';
import { and, eq, isNull } from 'drizzle-orm';
import { getLocale } from 'next-intl/server';
import { appSchema } from '@restio/db';
import { requireMembership } from '@/lib/auth/session';
import { db } from '@/lib/db';
import { getNotifications, type NotificationView } from './queries';

const { notifications } = appSchema;

/** Pour le panneau ouvert depuis la cloche : lecture à la demande, pas à chaque page. */
export async function loadNotificationsAction(): Promise<NotificationView[]> {
  const { restaurantId } = await requireMembership();
  return getNotifications(restaurantId, await getLocale());
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const { restaurantId } = await requireMembership();
  await db().update(notifications).set({ readAt: new Date() }).where(and(eq(notifications.restaurantId, restaurantId), isNull(notifications.readAt)));
  revalidatePath('/app', 'layout');
}
