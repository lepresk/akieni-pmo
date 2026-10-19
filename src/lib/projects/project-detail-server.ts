import { asc, eq } from 'drizzle-orm';

import { writeAuditLog } from '@/lib/audit/audit-server';
import { getPlanWeekCodes } from '@/lib/capacity/capacity-server';
import { resolvePlanWeekLabel } from '@/lib/capacity/plan-week-label';
import { db } from '@/lib/db';
import {
  activities,
  amendments,
  assignments,
  clients,
  costCenters,
  employees,
  expenses,
  projectEnvelopes,
  projectNodes,
  projects,
  submissions,
} from '@/lib/db/schema';
import { sumValidatedDaysByProjectName } from '@/lib/projects/project-spent';
import { canMargin, type Role } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { normalizeSubmissionLine, sumLineHours } from '@/lib/timesheet/normalize-submission-line';

/** Full read for the project hub, optionally scoped to a sub-project. Server-only. */

export interface NodeView {
  readonly name: string;
  readonly pmName: string | null;
  readonly budgetDays: number;
}
export interface ActivityView {
  readonly id: string;
  readonly poste: string;
  readonly name: string;
  readonly responsible: string | null;
  readonly fromWeekLabel: string;
  readonly toWeekLabel: string;
  readonly days: number;
  readonly progress: number;
}
export interface AssignmentView {
  readonly id: string;
  readonly employeeName: string;
  readonly allocationPct: number;
  readonly projectTjm: number | null;
  readonly seniority: string | null;
}
export interface AmendmentView {
  readonly id: string;
  readonly ref: string;
  readonly target: string;
  readonly poste: string | null;
  readonly reason: string;
  readonly days: number;
  readonly amount: number;
  readonly status: string;
  readonly asker: string | null;
  readonly dateLabel: string | null;
}
export interface TimeLineView {
  readonly person: string;
  readonly poste: string;
  readonly task: string;
  readonly hours: number;
}

export interface ProjectHub {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly clientName: string;
  readonly segment: string;
  readonly model: string;
  readonly nature: string;
  readonly pmName: string;
  readonly description: string | null;
  readonly budgetDays: number;
  readonly spentDays: number;
  readonly costLoad: number | null;
  readonly scope: string | null;
  readonly costCenters: readonly { readonly label: string; readonly billable: boolean }[];
  readonly nodes: readonly NodeView[];
  readonly envelope: { readonly mo: number; readonly achats: number; readonly mission: number };
  readonly spend: { readonly engage: number; readonly facture: number; readonly paye: number };
  readonly activities: readonly ActivityView[];
  readonly assignments: readonly AssignmentView[];
  readonly amendments: readonly AmendmentView[];
  readonly timeLines: readonly TimeLineView[];
  readonly etcDays: number;
}

export async function getProjectHub(
  id: string,
  role: Role,
  scope: string | null,
): Promise<ProjectHub | null> {
  const [row] = await db
    .select({
      id: projects.id,
      code: projects.code,
      name: projects.name,
      segment: projects.segment,
      model: projects.model,
      nature: projects.nature,
      budgetDays: projects.budgetDays,
      description: projects.description,
      costLoad: projects.costLoad,
      clientName: clients.name,
      pmName: employees.fullName,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .leftJoin(employees, eq(projects.pmEmployeeId, employees.id))
    .where(eq(projects.id, id))
    .limit(1);

  if (!row) return null;

  const [
    centers,
    nodeRows,
    envelopeRows,
    actRows,
    resRows,
    amendRows,
    allExpenses,
    allSubs,
    weekCodes,
    spentByName,
  ] = await Promise.all([
    db
      .select({ label: costCenters.label, billable: costCenters.billable })
      .from(costCenters)
      .where(eq(costCenters.projectId, id))
      .orderBy(asc(costCenters.label)),
    db
      .select({
        name: projectNodes.name,
        pmName: projectNodes.pmName,
        budgetDays: projectNodes.budgetDays,
      })
      .from(projectNodes)
      .where(eq(projectNodes.projectId, id))
      .orderBy(asc(projectNodes.position)),
    db
      .select({
        sub: projectEnvelopes.sub,
        mo: projectEnvelopes.mo,
        achats: projectEnvelopes.achats,
        mission: projectEnvelopes.mission,
      })
      .from(projectEnvelopes)
      .where(eq(projectEnvelopes.projectId, id)),
    db.select().from(activities).where(eq(activities.projectId, id)).orderBy(asc(activities.poste)),
    db.select().from(assignments).where(eq(assignments.projectId, id)),
    db.select().from(amendments).where(eq(amendments.projectId, id)),
    db
      .select({
        projectName: expenses.projectName,
        sub: expenses.sub,
        amount: expenses.amount,
        state: expenses.state,
      })
      .from(expenses),
    db.select({ lines: submissions.lines, person: submissions.personName }).from(submissions),
    getPlanWeekCodes(),
    sumValidatedDaysByProjectName(),
  ]);

  const envelope = envelopeRows.find((e) => (scope ? e.sub === scope : e.sub === null)) ??
    envelopeRows.find((e) => e.sub === null) ?? { mo: 0, achats: 0, mission: 0 };

  const scopedExpenses = allExpenses.filter(
    (e) => e.projectName === row.name && (scope ? e.sub === scope : true),
  );
  const spend = {
    engage: scopedExpenses.filter((e) => e.state === 'engage').reduce((s, e) => s + e.amount, 0),
    facture: scopedExpenses.filter((e) => e.state === 'facture').reduce((s, e) => s + e.amount, 0),
    paye: scopedExpenses.filter((e) => e.state === 'paye').reduce((s, e) => s + e.amount, 0),
  };

  const timeLines: TimeLineView[] = [];
  for (const submission of allSubs) {
    for (const raw of submission.lines) {
      const line = normalizeSubmissionLine(raw);
      if (!line || line.project !== row.name) continue;
      timeLines.push({
        person: submission.person,
        poste: line.poste,
        task: line.activity,
        hours: sumLineHours(line),
      });
    }
  }

  const etcDays = actRows.reduce((sum, act) => sum + (act.days * (100 - act.progress)) / 100, 0);
  const spentDays = Math.round(spentByName.get(row.name) ?? 0);
  const showMargin = canMargin(role);

  if (showMargin) {
    const session = await getSession();
    await writeAuditLog({
      who: session.user.name,
      role,
      action: 'margin.read',
      target: `project:${row.id}`,
      sensitive: true,
    });
  }

  return {
    id: row.id,
    code: row.code,
    name: row.name,
    clientName: row.clientName ?? '-',
    segment: row.segment,
    model: row.model,
    nature: row.nature,
    pmName: row.pmName ?? '-',
    description: row.description,
    budgetDays: row.budgetDays,
    spentDays,
    costLoad: showMargin && row.costLoad !== null ? Number(row.costLoad) : null,
    scope,
    costCenters: centers,
    nodes: nodeRows,
    envelope: { mo: envelope.mo, achats: envelope.achats, mission: envelope.mission },
    spend,
    activities: actRows.map((a) => ({
      id: a.id,
      poste: a.poste,
      name: a.name,
      responsible: a.responsible,
      fromWeekLabel: resolvePlanWeekLabel(weekCodes, a.fromWeek),
      toWeekLabel: resolvePlanWeekLabel(weekCodes, a.toWeek),
      days: a.days,
      progress: a.progress,
    })),
    assignments: resRows.map((r) => ({
      id: r.id,
      employeeName: r.employeeName,
      allocationPct: r.allocationPct,
      projectTjm: r.projectTjm,
      seniority: r.seniority,
    })),
    amendments: amendRows.map((a) => ({
      id: a.id,
      ref: a.ref,
      target: a.target,
      poste: a.poste,
      reason: a.reason,
      days: a.days,
      amount: a.amount,
      status: a.status,
      asker: a.asker,
      dateLabel: a.dateLabel,
    })),
    timeLines,
    etcDays: Math.round(etcDays),
  };
}
