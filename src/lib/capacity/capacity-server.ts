import { asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { departments, employees, planLoad } from '@/lib/db/schema';

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
  const byEmployee = new Map<string, PlanRow & { weeks: { code: string; pct: number }[] }>();

  for (const row of rows) {
    if (!weekCodes.includes(row.weekCode)) weekCodes.push(row.weekCode);
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
