import { asc, avg, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { writeAuditLog } from '@/lib/audit/audit-server';
import { db } from '@/lib/db';
import { departments, employees, planLoad } from '@/lib/db/schema';
import { canSalary, type Role } from '@/lib/rbac';
import { getSession } from '@/lib/session';

/** Data reads for a single employee record. Server-only. */

export interface EmployeeDetail {
  readonly id: string;
  readonly name: string;
  readonly initials: string;
  readonly departmentName: string;
  readonly managerName: string;
  readonly seniority: string | null;
  readonly avgLoad: number | null;
  readonly weeks: readonly { readonly code: string; readonly pct: number }[];
  /** Sensitive - only present for Finance/RH/Direction. */
  readonly salaryGross: number | null;
  readonly referenceTjm: number | null;
}

/** Resolve the employee to show: the given id, otherwise the first employee. */
export async function resolveEmployeeId(preferred: string | null): Promise<string | null> {
  if (preferred) return preferred;
  const [first] = await db
    .select({ id: employees.id })
    .from(employees)
    .orderBy(asc(employees.fullName))
    .limit(1);
  return first?.id ?? null;
}

export async function getEmployeeDetail(id: string, role: Role): Promise<EmployeeDetail | null> {
  const manager = alias(employees, 'manager');

  const [row] = await db
    .select({
      id: employees.id,
      name: employees.fullName,
      initials: employees.initials,
      seniority: employees.seniority,
      salaryGross: employees.salaryGross,
      referenceTjm: employees.referenceTjm,
      departmentName: departments.name,
      managerName: manager.fullName,
    })
    .from(employees)
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .leftJoin(manager, eq(employees.managerId, manager.id))
    .where(eq(employees.id, id))
    .limit(1);

  if (!row) return null;

  const weeks = await db
    .select({ code: planLoad.weekCode, pct: planLoad.pct })
    .from(planLoad)
    .where(eq(planLoad.employeeId, id))
    .orderBy(asc(planLoad.weekIndex));

  const [loadRow] = await db
    .select({ average: avg(planLoad.pct) })
    .from(planLoad)
    .where(eq(planLoad.employeeId, id));

  const showSalary = canSalary(role);

  if (showSalary) {
    const session = await getSession();
    await writeAuditLog({
      who: session.user.name,
      role,
      action: 'salary.read',
      target: `employee:${row.id}`,
      sensitive: true,
    });
  }

  return {
    id: row.id,
    name: row.name,
    initials: row.initials ?? '--',
    departmentName: row.departmentName ?? '-',
    managerName: row.managerName ?? '-',
    seniority: row.seniority,
    avgLoad: loadRow?.average ? Math.round(Number(loadRow.average)) : null,
    weeks: weeks.map((week) => ({ code: week.code, pct: week.pct })),
    salaryGross: showSalary ? row.salaryGross : null,
    referenceTjm: showSalary ? row.referenceTjm : null,
  };
}
