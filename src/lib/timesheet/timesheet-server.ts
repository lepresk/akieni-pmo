import { asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { activities, costCenters, projects } from '@/lib/db/schema';

/** Options for the timesheet entry grid: open projects, their cost centers and activities. */

export interface PosteOption {
  readonly label: string;
  readonly activities: readonly string[];
}

export interface ProjectOption {
  readonly project: string;
  readonly postes: readonly PosteOption[];
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
