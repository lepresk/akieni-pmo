import { and, asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { activities, costCenters, projects, submissions } from '@/lib/db/schema';
import { normalizeSubmissionLine } from '@/lib/timesheet/normalize-submission-line';
import type { TimesheetLineInput } from '@/lib/timesheet/timesheet-schemas';

/** Options for the timesheet entry grid: open projects, their cost centers and activities. */

export interface PosteOption {
  readonly label: string;
  readonly activities: readonly string[];
}

export interface ProjectOption {
  readonly project: string;
  readonly postes: readonly PosteOption[];
}

/**
 * Pending draft lines for an employee week, normalized to day-hours.
 * Returns an empty array when no pending submission exists.
 */
export async function getTimesheetWeekDraft(
  employeeId: string,
  weekStart: string,
): Promise<readonly TimesheetLineInput[]> {
  const [row] = await db
    .select({ lines: submissions.lines })
    .from(submissions)
    .where(
      and(
        eq(submissions.employeeId, employeeId),
        eq(submissions.weekStart, weekStart),
        eq(submissions.status, 'pending'),
      ),
    )
    .limit(1);

  if (!row) return [];

  const draft: TimesheetLineInput[] = [];
  for (const raw of row.lines) {
    const line = normalizeSubmissionLine(raw);
    if (!line) continue;
    draft.push({
      project: line.project,
      poste: line.poste,
      activity: line.activity,
      hours: [
        line.hours[0],
        line.hours[1],
        line.hours[2],
        line.hours[3],
        line.hours[4],
        line.hours[5],
        line.hours[6],
      ],
    });
  }
  return draft;
}

export async function getProjectOptions(): Promise<readonly ProjectOption[]> {
  const centerRows = await db
    .select({ name: projects.name, poste: costCenters.label })
    .from(projects)
    .innerJoin(costCenters, eq(costCenters.projectId, projects.id))
    .orderBy(asc(projects.name), asc(costCenters.label));

  const activityRows = await db
    .select({ name: projects.name, poste: activities.poste, activity: activities.name })
    .from(projects)
    .innerJoin(activities, eq(activities.projectId, projects.id));

  // project -> poste -> Set(activities)
  const map = new Map<string, Map<string, Set<string>>>();
  for (const row of centerRows) {
    const postes = map.get(row.name) ?? new Map<string, Set<string>>();
    if (!postes.has(row.poste)) postes.set(row.poste, new Set<string>());
    map.set(row.name, postes);
  }
  for (const row of activityRows) {
    const postes = map.get(row.name) ?? new Map<string, Set<string>>();
    const acts = postes.get(row.poste) ?? new Set<string>();
    acts.add(row.activity);
    postes.set(row.poste, acts);
    map.set(row.name, postes);
  }

  return [...map.entries()].map(([project, postes]) => ({
    project,
    postes: [...postes.entries()].map(([label, acts]) => ({
      label,
      activities: acts.size > 0 ? [...acts] : ['Saisie'],
    })),
  }));
}
