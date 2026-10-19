/**
 * Aggregate validated timesheet hours into project spent days (hours / 8).
 */

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { normalizeSubmissionLine, sumLineHours } from '@/lib/timesheet/normalize-submission-line';

const HOURS_PER_DAY = 8;

/** Map project display name -> spent days from validated submissions. */
export async function sumValidatedDaysByProjectName(): Promise<ReadonlyMap<string, number>> {
  const rows = await db
    .select({ lines: submissions.lines })
    .from(submissions)
    .where(eq(submissions.status, 'validated'));

  const totals = new Map<string, number>();
  for (const row of rows) {
    for (const raw of row.lines) {
      const line = normalizeSubmissionLine(raw);
      if (!line) continue;
      const days = sumLineHours(line) / HOURS_PER_DAY;
      totals.set(line.project, (totals.get(line.project) ?? 0) + days);
    }
  }
  return totals;
}
