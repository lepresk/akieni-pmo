import { asc, eq } from 'drizzle-orm';

import { db } from '@/lib/db';
import { clients, employees, projects } from '@/lib/db/schema';
import { canMargin, type Role } from '@/lib/rbac';

/** Data reads for the project portfolio. Server-only (owns Drizzle queries). */

export interface PortfolioRow {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly clientName: string;
  readonly segment: string;
  readonly model: string;
  readonly pmName: string;
  readonly budgetDays: number;
  readonly spentDays: number;
  /** Internal cost ratio - only present when the role may see margin. */
  readonly costLoad: number | null;
}

export async function getPortfolio(
  role: Role,
  employeeId: string | null,
): Promise<readonly PortfolioRow[]> {
  const rows = await db
    .select({
      id: projects.id,
      code: projects.code,
      name: projects.name,
      segment: projects.segment,
      model: projects.model,
      budgetDays: projects.budgetDays,
      spentDays: projects.spentDays,
      costLoad: projects.costLoad,
      clientName: clients.name,
      pmName: employees.fullName,
      pmId: projects.pmEmployeeId,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .leftJoin(employees, eq(projects.pmEmployeeId, employees.id))
    .orderBy(asc(projects.code));

  // Row-level scope: a PM only sees the projects they lead.
  const scoped = role === 'pm' && employeeId ? rows.filter((row) => row.pmId === employeeId) : rows;
  const showMargin = canMargin(role);

  return scoped.map((row) => ({
    id: row.id,
    code: row.code,
    name: row.name,
    clientName: row.clientName ?? '-',
    segment: row.segment,
    model: row.model,
    pmName: row.pmName ?? '-',
    budgetDays: row.budgetDays,
    spentDays: row.spentDays,
    costLoad: showMargin && row.costLoad !== null ? Number(row.costLoad) : null,
  }));
}
