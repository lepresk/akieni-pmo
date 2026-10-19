/**
 * Resolve whether the employee has a submission for a given ISO week Monday.
 */

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';

export type SubmissionWeekStatus = 'missing' | 'pending' | 'validated' | 'rejected';

export async function getSubmissionWeekStatus(
  employeeId: string | null | undefined,
  weekStart: string,
): Promise<SubmissionWeekStatus> {
  if (!employeeId) return 'missing';

  const [row] = await db
    .select({ status: submissions.status })
    .from(submissions)
    .where(and(eq(submissions.employeeId, employeeId), eq(submissions.weekStart, weekStart)))
    .limit(1);

  if (!row) return 'missing';
  return row.status;
}
