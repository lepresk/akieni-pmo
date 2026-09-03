import { avg } from 'drizzle-orm';

import { db } from '@/lib/db';
import { planLoad, projects } from '@/lib/db/schema';
import { canInvoice, canMargin, canStaff, canValidate, type Role } from '@/lib/rbac';

/** Data reads for the role-based home queue. Server-only. */

export interface QueueItem {
  readonly key: string;
  readonly label: string;
  readonly detail: string;
  readonly href: string;
  readonly urgent: boolean;
}

export interface Kpi {
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly deltaColor: string;
}

export interface Dashboard {
  readonly queue: readonly QueueItem[];
  readonly kpis: readonly Kpi[];
}

export async function getDashboard(role: Role, employeeId: string | null): Promise<Dashboard> {
  const projs = await db
    .select({
      budgetDays: projects.budgetDays,
      spentDays: projects.spentDays,
      costLoad: projects.costLoad,
      model: projects.model,
    })
    .from(projects);

  const overBudget = projs.filter((p) => p.budgetDays > 0 && p.spentDays / p.budgetDays >= 0.9);

  const loadRows = await db
    .select({ employeeId: planLoad.employeeId, average: avg(planLoad.pct) })
    .from(planLoad)
    .groupBy(planLoad.employeeId);
  const overbooked = loadRows.filter((l) => Number(l.average) > 100);
  const myLoadRow = employeeId ? loadRows.find((l) => l.employeeId === employeeId) : undefined;
  const myLoad = myLoadRow ? Math.round(Number(myLoadRow.average)) : null;

  const billable = projs.filter((p) => p.model !== 'non_billable' && p.costLoad !== null);
  const marginAvg = billable.length
    ? Math.round(
        (billable.reduce((sum, p) => sum + (1 - Number(p.costLoad)), 0) / billable.length) * 100,
      )
    : 0;

  const queue: QueueItem[] = [];
  if (canStaff(role) && overbooked.length > 0) {
    queue.push({
      key: 'overbooked',
      label: `${overbooked.length} personne(s) en surcharge`,
      detail: 'Allocation moyenne supérieure à 100 % sur la période',
      href: '/capacite',
      urgent: true,
    });
  }
  if (['pm', 'pmo', 'finance', 'direction'].includes(role) && overBudget.length > 0) {
    queue.push({
      key: 'over-budget',
      label: `${overBudget.length} projet(s) proche(s) ou au-delà du budget`,
      detail: 'Consommation supérieure ou égale à 90 % du budget',
      href: '/projets',
      urgent: true,
    });
  }
  if (['staff', 'pm', 'manager'].includes(role)) {
    queue.push({
      key: 'timesheet',
      label: "Votre semaine n'est pas soumise",
      detail: 'Saisie attendue avant 18:00 (close of business)',
      href: '/saisie',
      urgent: false,
    });
  }
  if (canValidate(role)) {
    queue.push({
      key: 'validate',
      label: 'File de validation',
      detail: 'Feuilles de temps de votre équipe à valider',
      href: '/validations',
      urgent: false,
    });
  }
  if (canInvoice(role)) {
    queue.push({
      key: 'invoice',
      label: 'Pré-factures à produire',
      detail: 'Temps validés de la période à facturer',
      href: '/facturation',
      urgent: false,
    });
  }

  const kpis: Kpi[] = [
    {
      label: 'Ma chargeabilité',
      value: myLoad !== null ? `${myLoad} %` : '-',
      delta: 'Cible 85 %',
      deltaColor: 'var(--muted)',
    },
    {
      label: 'Projets actifs',
      value: String(projs.length),
      delta: 'portefeuille',
      deltaColor: 'var(--muted)',
    },
    canMargin(role)
      ? {
          label: 'Marge portefeuille',
          value: `${marginAvg} %`,
          delta: 'moyenne',
          deltaColor: 'var(--muted)',
        }
      : {
          label: 'Jours à saisir',
          value: '3',
          delta: 'avant vendredi 18:00',
          deltaColor: '#b3261e',
        },
  ];

  return { queue, kpis };
}
