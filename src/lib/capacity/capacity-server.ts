import { asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { departments, employees, planLoad } from '@/lib/db/schema';

export { resolvePlanWeekLabel } from '@/lib/capacity/plan-week-label';

/** Data reads for the capacity plan (person x week). Server-only. */

export interface PlanRow {
  readonly employeeId: string;
  readonly name: string;
  readonly department: string;
  readonly weeks: readonly { readonly code: string; readonly pct: number }[];
  readonly avg: number;
}

export interface CapacityData {
  readonly weekCodes: readonly string[];
  readonly rows: readonly PlanRow[];
}

/** Distinct ISO week codes from plan_load, ordered by weekIndex. */
export async function getPlanWeekCodes(): Promise<readonly string[]> {
  const rows = await db
    .select({ weekCode: planLoad.weekCode, weekIndex: planLoad.weekIndex })
    .from(planLoad)
    .orderBy(asc(planLoad.weekIndex));

  const codes: string[] = [];
  const seen = new Set<number>();
  for (const row of rows) {
    if (seen.has(row.weekIndex)) continue;
    seen.add(row.weekIndex);
    codes.push(row.weekCode);
  }
  return codes;
}

export async function getPlan(): Promise<CapacityData> {
  const rows = await db
    .select({
      employeeId: planLoad.employeeId,
      weekCode: planLoad.weekCode,
      weekIndex: planLoad.weekIndex,
      pct: planLoad.pct,
      name: employees.fullName,
      department: departments.name,
    })
    .from(planLoad)
    .innerJoin(employees, eq(planLoad.employeeId, employees.id))
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .orderBy(asc(employees.fullName), asc(planLoad.weekIndex));

  const weekCodes: string[] = [];
  const seenWeeks = new Set<number>();
  const byEmployee = new Map<string, PlanRow & { weeks: { code: string; pct: number }[] }>();

  for (const row of rows) {
    if (!seenWeeks.has(row.weekIndex)) {
      seenWeeks.add(row.weekIndex);
      weekCodes.push(row.weekCode);
    }
    let entry = byEmployee.get(row.employeeId);
    if (!entry) {
      entry = {
        employeeId: row.employeeId,
        name: row.name,
        department: row.department ?? '-',
        weeks: [],
        avg: 0,
      };
      byEmployee.set(row.employeeId, entry);
    }
    entry.weeks.push({ code: row.weekCode, pct: row.pct });
  }

  const result: PlanRow[] = [...byEmployee.values()].map((entry) => {
    const total = entry.weeks.reduce((sum, week) => sum + week.pct, 0);
    return { ...entry, avg: entry.weeks.length ? Math.round(total / entry.weeks.length) : 0 };
  });

  return { weekCodes, rows: result };
}
