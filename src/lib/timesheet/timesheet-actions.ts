'use server';

import { eq } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { employees, expenses, submissions } from '@/lib/db/schema';
import { getWeekSnapshot, submissionWeekLabel } from '@/lib/calendar/week-display';
import { getSession } from '@/lib/session';

interface PostedLine {
  readonly project: string;
  readonly poste: string;
  readonly hours: number;
}

/** Create a weekly submission for the current user from the entry grid. */
export async function submitTimesheet(formData: FormData): Promise<void> {
  const { user, employeeId } = await getSession();

  let parsed: PostedLine[] = [];
  try {
    const raw = JSON.parse(String(formData.get('rows') ?? '[]')) as unknown;
    if (Array.isArray(raw)) {
      parsed = raw
        .filter((item): item is PostedLine => typeof item === 'object' && item !== null)
        .map((item) => ({
          project: String((item as PostedLine).project ?? ''),
          poste: String((item as PostedLine).poste ?? ''),
          hours: Number((item as PostedLine).hours ?? 0),
        }));
    }
  } catch {
    return;
  }

  const lines = parsed
    .filter((line) => line.project && line.hours > 0)
    .map((line) => ({
      project: line.project,
      poste: line.poste,
      task: 'Saisie',
      hours: line.hours,
    }));

  const hours = lines.reduce((sum, line) => sum + line.hours, 0);
  if (hours <= 0) return;
  const billable = lines
    .filter((line) => !line.project.startsWith('Interne'))
    .reduce((sum, line) => sum + line.hours, 0);

  let managerName = '-';
  if (employeeId) {
    const manager = alias(employees, 'manager');
    const [row] = await db
      .select({ managerName: manager.fullName })
      .from(employees)
      .leftJoin(manager, eq(employees.managerId, manager.id))
      .where(eq(employees.id, employeeId))
      .limit(1);
    managerName = row?.managerName ?? '-';
  }

  await db.insert(submissions).values({
    employeeId,
    personName: user.name,
    department: user.department,
    managerName,
    weekLabel: String(formData.get('weekLabel') || submissionWeekLabel(getWeekSnapshot())),
    hours,
    billable,
    status: 'pending',
    motif: null,
    flags: [],
    lines,
  });

  revalidatePath('/saisie');
  revalidatePath('/validations');
}

/** Self-service mission expense declared by the current user (accounting controls it later). */
export async function declareMissionExpense(formData: FormData): Promise<void> {
  const label = String(formData.get('label') ?? '').trim();
  const amount = Number(formData.get('amount') ?? 0);
  const projectName = String(formData.get('projectName') ?? '').trim();
  if (!label || amount <= 0 || !projectName) return;

  await db.insert(expenses).values({
    nature: 'mission',
    projectName,
    sub: '—',
    poste: String(formData.get('poste') ?? '').trim() || null,
    label,
    supplier: 'Frais internes',
    amount,
    state: 'engage',
    billable: formData.get('billable') === 'on',
    dateLabel: String(formData.get('date') ?? '').trim() || null,
  });
  revalidatePath('/depenses');
  revalidatePath('/saisie');
}
