import { asc, desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { notificationRules, notifications, users } from '@/lib/db/schema';
import { getSession } from '@/lib/session';

/** Data reads for the notifications screen. Server-only. */

export interface NotificationView {
  readonly id: string;
  readonly title: string;
  readonly body: string;
  readonly channel: string;
  readonly href: string | null;
  readonly readAt: Date | null;
  readonly createdAt: Date;
}

export interface NotificationRuleView {
  readonly id: string;
  readonly key: string;
  readonly label: string;
  readonly enabled: boolean;
}

/** Resolve the demo/SSO user row for the active session role. */
export async function resolveSessionUserId(): Promise<string | null> {
  const { role } = await getSession();
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.role, role)).limit(1);
  return row?.id ?? null;
}

/** Deterministic UTC timestamp label for notification feed rows. */
export function formatNotificationTime(createdAt: Date): string {
  const iso = createdAt.toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`;
}

export async function listNotifications(): Promise<readonly NotificationView[]> {
  const userId = await resolveSessionUserId();
  if (!userId) return [];

  const rows = await db
    .select({
      id: notifications.id,
      title: notifications.title,
      body: notifications.body,
      channel: notifications.channel,
      href: notifications.href,
      readAt: notifications.readAt,
      createdAt: notifications.createdAt,
    })
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));

  return rows;
}

export async function listNotificationRules(): Promise<readonly NotificationRuleView[]> {
  const userId = await resolveSessionUserId();
  if (!userId) return [];

  const rows = await db
    .select({
      id: notificationRules.id,
      key: notificationRules.key,
      label: notificationRules.label,
      enabled: notificationRules.enabled,
    })
    .from(notificationRules)
    .where(eq(notificationRules.userId, userId))
    .orderBy(asc(notificationRules.key));

  return rows;
}
