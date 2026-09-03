'use server';

import { and, eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { submissions } from '@/lib/db/schema';
import { canValidate } from '@/lib/rbac';
import { getSession } from '@/lib/session';

export async function validateSubmission(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canValidate(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await db
    .update(submissions)
    .set({ status: 'validated', motif: null })
    .where(eq(submissions.id, id));
  revalidatePath('/validations');
}

export async function rejectSubmission(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canValidate(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  const motif = String(formData.get('motif') ?? '').trim() || 'Rejeté par le manager.';
  await db.update(submissions).set({ status: 'rejected', motif }).where(eq(submissions.id, id));
  revalidatePath('/validations');
}

/** Validate every pending week in the current scope (manager team or all). */
export async function validateAll(): Promise<void> {
  const { role, user } = await getSession();
  if (!canValidate(role)) return;

  if (role === 'manager') {
    await db
      .update(submissions)
      .set({ status: 'validated', motif: null })
      .where(and(eq(submissions.status, 'pending'), eq(submissions.managerName, user.name)));
  } else {
    await db
      .update(submissions)
      .set({ status: 'validated', motif: null })
      .where(eq(submissions.status, 'pending'));
  }
  revalidatePath('/validations');
}
