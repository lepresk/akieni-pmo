import { avg } from 'drizzle-orm';

import { db } from '@/lib/db';
import { planLoad, projects } from '@/lib/db/schema';
import { canMargin, type Role } from '@/lib/rbac';

/** Aggregated reads for the reporting screen. Server-only. */

export interface ReportingData {
  readonly charge: {
    readonly average: number;
    readonly overbooked: number;
    readonly optimal: number;
    readonly under: number;
    readonly bench: number;
  };
  readonly marginPortfolio: number | null;
  readonly budget: { readonly budgetDays: number; readonly spentDays: number };
}

export async function getReporting(role: Role): Promise<ReportingData> {
  const loadRows = await db
    .select({ employeeId: planLoad.employeeId, average: avg(planLoad.pct) })
    .from(planLoad)
    .groupBy(planLoad.employeeId);
  const averages = loadRows.map((row) => Number(row.average));

  const charge = {
    average: averages.length
      ? Math.round(averages.reduce((s, v) => s + v, 0) / averages.length)
      : 0,
    overbooked: averages.filter((v) => v > 100).length,
    optimal: averages.filter((v) => v >= 85 && v <= 100).length,
    under: averages.filter((v) => v >= 60 && v < 85).length,
    bench: averages.filter((v) => v < 60).length,
  };

  const projs = await db
    .select({
      budgetDays: projects.budgetDays,
      spentDays: projects.spentDays,
      costLoad: projects.costLoad,
      model: projects.model,
    })
    .from(projects);

  const billable = projs.filter((p) => p.model !== 'non_billable' && p.costLoad !== null);
  const marginPortfolio = canMargin(role)
    ? billable.length
      ? Math.round(
          (billable.reduce((s, p) => s + (1 - Number(p.costLoad)), 0) / billable.length) * 100,
        )
      : 0
    : null;

  const budget = {
    budgetDays: projs.reduce((s, p) => s + p.budgetDays, 0),
    spentDays: projs.reduce((s, p) => s + p.spentDays, 0),
  };

  return { charge, marginPortfolio, budget };
}
