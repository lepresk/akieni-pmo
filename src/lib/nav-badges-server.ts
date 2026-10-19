import { and, count, eq, isNull } from 'drizzle-orm';

import { getWeekSnapshot } from '@/lib/calendar/week-display';
import { db } from '@/lib/db';
import { leaves, notifications, submissions, users } from '@/lib/db/schema';
import { WEEK_STATUS_BADGE_KEY } from '@/lib/navigation';
import { getSession } from '@/lib/session';
import { getSubmissionWeekStatus } from '@/lib/timesheet/submission-week-status';

/** Live counts shown as cyan chips on the sidebar navigation. Server-only. */
export async function getNavBadges(): Promise<Record<string, string>> {
  const { employeeId, role } = await getSession();
  const week = getWeekSnapshot();
  const weekStatus = await getSubmissionWeekStatus(employeeId, week.mondayIso);

  const [pendingSubs] = await db
    .select({ n: count() })
    .from(submissions)
    .where(eq(submissions.status, 'pending'));
  const [pendingLeaves] = await db
    .select({ n: count() })
    .from(leaves)
    .where(eq(leaves.status, 'pending'));

  const [userRow] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.role, role))
    .limit(1);
  let unread = 0;
  if (userRow) {
    const [unreadRow] = await db
      .select({ n: count() })
      .from(notifications)
      .where(and(eq(notifications.userId, userRow.id), isNull(notifications.readAt)));
    unread = Number(unreadRow?.n ?? 0);
  }

  const validations = Number(pendingSubs?.n ?? 0);
  const conges = Number(pendingLeaves?.n ?? 0);

  return {
    saisie: weekStatus === 'missing' ? '!' : '',
    validations: validations > 0 ? String(validations) : '',
    conges: conges > 0 ? String(conges) : '',
    capacite: '',
    notifications: unread > 0 ? String(unread) : '',
    [WEEK_STATUS_BADGE_KEY]: weekStatus,
  };
}
