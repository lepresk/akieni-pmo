'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/lib/audit/audit-server';
import { formatDateLabelFr } from '@/lib/calendar/date-label-fr';
import { db } from '@/lib/db';
import { leaves } from '@/lib/db/schema';
import { createLeaveInputSchema, type LeaveActionResult } from '@/lib/leaves/leaves-schemas';
import { canApproveLeave } from '@/lib/rbac';
import { getSession } from '@/lib/session';

export async function approveLeave(formData: FormData): Promise<void> {
  const { role, user } = await getSession();
  if (!canApproveLeave(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const [row] = await db
    .select({ id: leaves.id, personName: leaves.personName, type: leaves.type })
    .from(leaves)
    .where(eq(leaves.id, id))
    .limit(1);
  if (!row) return;
  await db.update(leaves).set({ status: 'validated' }).where(eq(leaves.id, row.id));
  await writeAuditLog({
    who: user.name,
    role,
    action: 'leave.approve',
    target: `${row.personName} · ${row.type}`,
    sensitive: false,
  });
  revalidatePath('/conges');
}

export async function refuseLeave(formData: FormData): Promise<void> {
  const { role, user } = await getSession();
  if (!canApproveLeave(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const [row] = await db
    .select({ id: leaves.id, personName: leaves.personName, type: leaves.type })
    .from(leaves)
    .where(eq(leaves.id, id))
    .limit(1);
  if (!row) return;
  await db.update(leaves).set({ status: 'rejected' }).where(eq(leaves.id, row.id));
  await writeAuditLog({
    who: user.name,
    role,
    action: 'leave.refuse',
    target: `${row.personName} · ${row.type}`,
    sensitive: false,
  });
  revalidatePath('/conges');
}

/** Self-service leave request created by the current user (status pending). */
export async function createLeave(formData: FormData): Promise<LeaveActionResult> {
  const { user, employeeId } = await getSession();

  if (!employeeId) {
    return {
      ok: false,
      code: 'leave.unauthorized',
      message: 'No employee linked to the current session.',
    };
  }

  const parsed = createLeaveInputSchema.safeParse({
    type: String(formData.get('type') ?? 'Congé payé'),
    fromDate: String(formData.get('fromDate') ?? '').trim(),
    toDate: String(formData.get('toDate') ?? '').trim(),
    days: Number(formData.get('days') ?? 0),
    note: String(formData.get('note') ?? '').trim() || undefined,
  });

  if (!parsed.success) {
    return { ok: false, code: 'leave.invalid', message: 'Invalid leave request.' };
  }

  const input = parsed.data;
  await db.insert(leaves).values({
    employeeId,
    personName: user.name,
    type: input.type,
    fromDate: input.fromDate,
    toDate: input.toDate,
    fromLabel: formatDateLabelFr(input.fromDate),
    toLabel: formatDateLabelFr(input.toDate),
    days: input.days,
    status: 'pending',
    note: input.note ?? null,
  });
  revalidatePath('/conges');
  return { ok: true };
}

/** Form-action adapter (Next.js form actions must return void). */
export async function createLeaveForm(formData: FormData): Promise<void> {
  await createLeave(formData);
}
