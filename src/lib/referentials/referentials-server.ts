import { asc, countDistinct, desc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { costCenterCatalog, costCenters, holidays, rateGrid } from '@/lib/db/schema';

/** Data reads for the Referentials screen. Server-only (owns Drizzle queries). */

export interface RateRow {
  readonly seniority: string;
  readonly costPerDay: number;
  readonly sellPerDay: number;
  readonly effectiveFrom: string;
  readonly isCurrent: boolean;
}

export async function getRateGrid(): Promise<readonly RateRow[]> {
  return db
    .select({
      seniority: rateGrid.seniority,
      costPerDay: rateGrid.costPerDay,
      sellPerDay: rateGrid.sellPerDay,
      effectiveFrom: rateGrid.effectiveFrom,
      isCurrent: rateGrid.isCurrent,
    })
    .from(rateGrid)
    .orderBy(desc(rateGrid.isCurrent), asc(rateGrid.effectiveFrom));
}

export interface CostCenterRow {
  readonly label: string;
  readonly billable: boolean;
  readonly usage: number;
}

export async function getCostCenterCatalog(): Promise<readonly CostCenterRow[]> {
  const catalog = await db
    .select({ label: costCenterCatalog.label, billable: costCenterCatalog.billable })
    .from(costCenterCatalog)
    .orderBy(asc(costCenterCatalog.label));

  const usageRows = await db
    .select({ label: costCenters.label, projects: countDistinct(costCenters.projectId) })
    .from(costCenters)
    .groupBy(costCenters.label);

  const usageByLabel = new Map(usageRows.map((row) => [row.label, Number(row.projects)]));

  return catalog.map((row) => ({
    label: row.label,
    billable: row.billable,
    usage: usageByLabel.get(row.label) ?? 0,
  }));
}

export interface HolidayRow {
  readonly label: string;
  readonly observedOn: string;
}

export async function getHolidays(): Promise<readonly HolidayRow[]> {
  return db
    .select({ label: holidays.label, observedOn: holidays.observedOn })
    .from(holidays)
    .orderBy(asc(holidays.observedOn));
}
