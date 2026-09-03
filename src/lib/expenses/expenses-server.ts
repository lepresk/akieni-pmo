import { asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';

/** Data reads for the expense register. Server-only. */

export interface ExpenseView {
  readonly id: string;
  readonly nature: 'achat' | 'mission';
  readonly projectName: string;
  readonly sub: string | null;
  readonly poste: string | null;
  readonly label: string;
  readonly supplier: string | null;
  readonly amount: number;
  readonly state: 'engage' | 'facture' | 'paye';
  readonly billable: boolean;
  readonly dateLabel: string | null;
}

export interface ExpenseData {
  readonly rows: readonly ExpenseView[];
  readonly kpis: {
    readonly engage: number;
    readonly facture: number;
    readonly paye: number;
    readonly refacturable: number;
  };
}

export async function getExpenses(): Promise<ExpenseData> {
  const rows = await db.select().from(expenses).orderBy(asc(expenses.dateLabel));

  const sum = (predicate: (row: ExpenseView) => boolean, list: readonly ExpenseView[]): number =>
    list.filter(predicate).reduce((total, row) => total + row.amount, 0);

  const views: ExpenseView[] = rows.map((row) => ({
    id: row.id,
    nature: row.nature,
    projectName: row.projectName,
    sub: row.sub,
    poste: row.poste,
    label: row.label,
    supplier: row.supplier,
    amount: row.amount,
    state: row.state,
    billable: row.billable,
    dateLabel: row.dateLabel,
  }));

  return {
    rows: views,
    kpis: {
      engage: sum((r) => r.state === 'engage', views),
      facture: sum((r) => r.state === 'facture', views),
      paye: sum((r) => r.state === 'paye', views),
      refacturable: sum((r) => r.billable, views),
    },
  };
}
