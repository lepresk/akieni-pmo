'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/lib/audit/audit-server';
import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { canValidate } from '@/lib/rbac';
import { getSession } from '@/lib/session';
import { recomputeSubmissionFlags } from '@/lib/validations/submission-flags';

export async function validateSubmission(formData: FormData): Promise<void> {
  const { role, user } = await getSession();
  if (!canValidate(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const [row] = await db
    .select({
      id: submissions.id,
      personName: submissions.personName,
      weekLabel: submissions.weekLabel,
      hours: submissions.hours,
      lines: submissions.lines,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  if (!row) return;

  const flags = [...recomputeSubmissionFlags(row.hours, row.lines)];
  await db
    .update(submissions)
    .set({ status: 'validated', motif: null, flags })
    .where(eq(submissions.id, row.id));
  await writeAuditLog({
    who: user.name,
    role,
    action: 'timesheet.validate',
    target: `${row.personName} · ${row.weekLabel}`,
    sensitive: false,
  });
  revalidatePath('/validations');
}

export async function rejectSubmission(formData: FormData): Promise<void> {
  const { role, user } = await getSession();
  if (!canValidate(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const motif = String(formData.get('motif') ?? '').trim() || 'Rejeté par le manager.';

  const [row] = await db
    .select({
      id: submissions.id,
      personName: submissions.personName,
      weekLabel: submissions.weekLabel,
      hours: submissions.hours,
      lines: submissions.lines,
    })
    .from(submissions)
    .where(eq(submissions.id, id))
    .limit(1);
  if (!row) return;

  const flags = [...recomputeSubmissionFlags(row.hours, row.lines)];
  await db
    .update(submissions)
    .set({ status: 'rejected', motif, flags })
    .where(eq(submissions.id, row.id));
  await writeAuditLog({
    who: user.name,
    role,
    action: 'timesheet.reject',
    target: `${row.personName} · ${row.weekLabel}`,
    sensitive: false,
  });
  revalidatePath('/validations');
}

/** Validate every pending week in the current scope (manager team or all). */
export async function validateAll(): Promise<void> {
  const { role, user } = await getSession();
  if (!canValidate(role)) return;

  const pending =
    role === 'manager'
      ? await db
          .select({
            id: submissions.id,
            personName: submissions.personName,
            weekLabel: submissions.weekLabel,
            hours: submissions.hours,
            lines: submissions.lines,
          })
          .from(submissions)
          .where(and(eq(submissions.status, 'pending'), eq(submissions.managerName, user.name)))
      : await db
          .select({
            id: submissions.id,
            personName: submissions.personName,
            weekLabel: submissions.weekLabel,
            hours: submissions.hours,
            lines: submissions.lines,
          })
          .from(submissions)
          .where(eq(submissions.status, 'pending'));

  for (const row of pending) {
    const flags = [...recomputeSubmissionFlags(row.hours, row.lines)];
    await db
      .update(submissions)
      .set({ status: 'validated', motif: null, flags })
      .where(eq(submissions.id, row.id));
    await writeAuditLog({
      who: user.name,
      role,
      action: 'timesheet.validate',
      target: `${row.personName} · ${row.weekLabel}`,
      sensitive: false,
    });
  }
  revalidatePath('/validations');
}
