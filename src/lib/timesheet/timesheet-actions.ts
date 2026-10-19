'use server';

import { and, eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { revalidatePath } from 'next/cache';

import { getWeekSnapshot, submissionWeekLabel } from '@/lib/calendar/week-display';
import { formatDateLabelFr } from '@/lib/calendar/date-label-fr';
import { db } from '@/lib/db';
import { employees, expenses, submissions } from '@/lib/db/schema';
import { getSession } from '@/lib/session';
import { sumLineHours } from '@/lib/timesheet/normalize-submission-line';
import {
  submitTimesheetInputSchema,
  type TimesheetActionResult,
} from '@/lib/timesheet/timesheet-schemas';

const TIMESHEET_ERROR_FR = {
  'timesheet.invalid': 'Saisie invalide. Vérifiez les projets, postes, activités et heures.',
  'timesheet.empty': 'Aucune heure à soumettre.',
  'timesheet.unauthorized': 'Vous devez être connecté pour soumettre une saisie.',
  'timesheet.period_locked': 'Cette semaine est déjà validée et ne peut plus être modifiée.',
} as const;

export type TimesheetFormState = {
  readonly error: string | null;
};

/** Create or update a pending weekly submission for the current user. */
export async function submitTimesheet(formData: FormData): Promise<TimesheetActionResult> {
  const { user, employeeId } = await getSession();

  if (!employeeId) {
    return {
      ok: false,
      code: 'timesheet.unauthorized',
      message: 'Not authorized to submit a timesheet.',
    };
  }

  let rawRows: unknown;
  try {
    rawRows = JSON.parse(String(formData.get('rows') ?? '[]'));
  } catch {
    return { ok: false, code: 'timesheet.invalid', message: 'Invalid timesheet payload.' };
  }

  const parsed = submitTimesheetInputSchema.safeParse({
    weekStart: String(formData.get('mondayIso') ?? formData.get('weekStart') ?? ''),
    weekLabel: String(formData.get('weekLabel') || submissionWeekLabel(getWeekSnapshot())),
    lines: rawRows,
  });

  if (!parsed.success) {
    return { ok: false, code: 'timesheet.invalid', message: 'Invalid timesheet payload.' };
  }

  const { weekStart, weekLabel, lines } = parsed.data;
  const normalized = lines
    .map((line) => ({
      project: line.project,
      poste: line.poste,
      activity: line.activity,
      hours: line.hours,
    }))
    .filter((line) => sumLineHours(line) > 0);

  const hours = normalized.reduce((sum, line) => sum + sumLineHours(line), 0);
  if (hours <= 0) {
    return { ok: false, code: 'timesheet.empty', message: 'No hours to submit.' };
  }

  const billable = normalized
    .filter((line) => !line.project.startsWith('Interne'))
    .reduce((sum, line) => sum + sumLineHours(line), 0);

  let managerName = '-';
  const manager = alias(employees, 'manager');
  const [row] = await db
    .select({ managerName: manager.fullName })
    .from(employees)
    .leftJoin(manager, eq(employees.managerId, manager.id))
    .where(eq(employees.id, employeeId))
    .limit(1);
  managerName = row?.managerName ?? '-';

  const [existing] = await db
    .select({ id: submissions.id, status: submissions.status })
    .from(submissions)
    .where(and(eq(submissions.employeeId, employeeId), eq(submissions.weekStart, weekStart)))
    .limit(1);

  if (existing?.status === 'validated') {
    return {
      ok: false,
      code: 'timesheet.period_locked',
      message: 'This week is already validated.',
    };
  }

  if (existing) {
    await db
      .update(submissions)
      .set({
        personName: user.name,
        department: user.department,
        managerName,
        weekLabel,
        hours,
        billable,
        status: 'pending',
        motif: null,
        flags: [],
        lines: normalized,
      })
      .where(eq(submissions.id, existing.id));
  } else {
    await db.insert(submissions).values({
      employeeId,
      personName: user.name,
      department: user.department,
      managerName,
      weekStart,
      weekLabel,
      hours,
      billable,
      status: 'pending',
      motif: null,
      flags: [],
      lines: normalized,
    });
  }

  revalidatePath('/saisie');
  revalidatePath('/validations');
  return { ok: true };
}

/** Form-action adapter for useActionState (returns French error copy). */
export async function submitTimesheetForm(
  _prevState: TimesheetFormState,
  formData: FormData,
): Promise<TimesheetFormState> {
  const result = await submitTimesheet(formData);
  if (result.ok) return { error: null };
  return { error: TIMESHEET_ERROR_FR[result.code] };
}

/** Self-service mission expense declared by the current user (accounting controls it later). */
export async function declareMissionExpense(formData: FormData): Promise<void> {
  const label = String(formData.get('label') ?? '').trim();
  const amount = Number(formData.get('amount') ?? 0);
  const projectName = String(formData.get('projectName') ?? '').trim();
  if (!label || amount <= 0 || !projectName) return;

  const expenseDate = String(formData.get('date') ?? '').trim();
  const isoDate = /^\d{4}-\d{2}-\d{2}$/.test(expenseDate) ? expenseDate : null;

  await db.insert(expenses).values({
    nature: 'mission',
    projectName,
    sub: null,
    poste: String(formData.get('poste') ?? '').trim() || null,
    label,
    supplier: 'Frais internes',
    amount,
    state: 'engage',
    billable: formData.get('billable') === 'on',
    expenseDate: isoDate,
    dateLabel: isoDate ? formatDateLabelFr(isoDate) : expenseDate || null,
  });
  revalidatePath('/depenses');
  revalidatePath('/saisie');
}
