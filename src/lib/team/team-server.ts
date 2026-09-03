import { asc, avg, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import { db } from '@/lib/db';
import { departments, employees, planLoad } from '@/lib/db/schema';
import { canSalary, type Role } from '@/lib/rbac';

/** Data reads for the team directory. Server-only. */

export interface TeamRow {
  readonly id: string;
  readonly name: string;
  readonly departmentName: string;
  readonly managerName: string;
  readonly seniority: string | null;
  readonly avgLoad: number | null;
  /** Gross salary - only present when the role may see compensation. */
  readonly salaryGross: number | null;
}

export async function getTeam(role: Role, employeeId: string | null): Promise<readonly TeamRow[]> {
  const manager = alias(employees, 'manager');

  const rows = await db
    .select({
      id: employees.id,
      name: employees.fullName,
      seniority: employees.seniority,
      salaryGross: employees.salaryGross,
      managerId: employees.managerId,
      departmentName: departments.name,
      managerName: manager.fullName,
    })
    .from(employees)
    .leftJoin(departments, eq(employees.departmentId, departments.id))
    .leftJoin(manager, eq(employees.managerId, manager.id))
    .orderBy(asc(employees.fullName));

  const loadRows = await db
    .select({ employeeId: planLoad.employeeId, average: avg(planLoad.pct) })
    .from(planLoad)
    .groupBy(planLoad.employeeId);
  const loadById = new Map(
    loadRows.map((row) => [row.employeeId, Math.round(Number(row.average))]),
  );

  // Row-level scope: a manager only sees their direct reports.
  const scoped =
    role === 'manager' && employeeId ? rows.filter((row) => row.managerId === employeeId) : rows;
  const showSalary = canSalary(role);

  return scoped.map((row) => ({
    id: row.id,
    name: row.name,
    departmentName: row.departmentName ?? '-',
    managerName: row.managerName ?? '-',
    seniority: row.seniority,
    avgLoad: loadById.get(row.id) ?? null,
    salaryGross: showSalary ? row.salaryGross : null,
  }));
}
