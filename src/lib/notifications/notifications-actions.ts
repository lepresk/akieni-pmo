'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { notificationRules, notifications } from '@/lib/db/schema';
import {
  markNotificationReadSchema,
  setNotificationRuleSchema,
  type MarkNotificationReadInput,
  type NotificationActionResult,
  type SetNotificationRuleInput,
} from '@/lib/notifications/notifications-schemas';
import { resolveSessionUserId } from '@/lib/notifications/notifications-server';

function parseMarkInput(
  input: FormData | MarkNotificationReadInput,
): MarkNotificationReadInput | null {
  if (input instanceof FormData) {
    const parsed = markNotificationReadSchema.safeParse({
      id: String(input.get('id') ?? ''),
    });
    return parsed.success ? parsed.data : null;
  }
  const parsed = markNotificationReadSchema.safeParse(input);
  return parsed.success ? parsed.data : null;
}

/** Mark a notification as read for the current user. */
export async function markNotificationRead(
  input: FormData | MarkNotificationReadInput,
): Promise<NotificationActionResult> {
  const userId = await resolveSessionUserId();
  if (!userId) {
    return {
      ok: false,
      code: 'notification.unauthorized',
      message: 'No user linked to the current session.',
    };
  }

  const data = parseMarkInput(input);
  if (!data) {
    return { ok: false, code: 'notification.invalid', message: 'Invalid notification id.' };
  }

  const [existing] = await db
    .select({ id: notifications.id, readAt: notifications.readAt })
    .from(notifications)
    .where(and(eq(notifications.id, data.id), eq(notifications.userId, userId)))
    .limit(1);

  if (!existing) {
    return {
      ok: false,
      code: 'notification.not_found',
      message: 'Notification not found.',
    };
  }

  if (!existing.readAt) {
    await db.update(notifications).set({ readAt: new Date() }).where(eq(notifications.id, data.id));
  }

  revalidatePath('/notifications');
  return { ok: true };
}

/** Form-action adapter for mark-read. */
export async function markNotificationReadForm(formData: FormData): Promise<void> {
  await markNotificationRead(formData);
}

/** Persist a notification rule toggle for the current user. */
export async function setNotificationRule(
  input: SetNotificationRuleInput,
): Promise<NotificationActionResult> {
  const userId = await resolveSessionUserId();
  if (!userId) {
    return {
      ok: false,
      code: 'notification.unauthorized',
      message: 'No user linked to the current session.',
    };
  }

  const parsed = setNotificationRuleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, code: 'notification.invalid', message: 'Invalid notification rule.' };
  }

  const { id, enabled } = parsed.data;
  const [existing] = await db
    .select({ id: notificationRules.id })
    .from(notificationRules)
    .where(and(eq(notificationRules.id, id), eq(notificationRules.userId, userId)))
    .limit(1);

  if (!existing) {
    return {
      ok: false,
      code: 'notification.not_found',
      message: 'Notification rule not found.',
    };
  }

  await db.update(notificationRules).set({ enabled }).where(eq(notificationRules.id, id));

  revalidatePath('/notifications');
  return { ok: true };
}
