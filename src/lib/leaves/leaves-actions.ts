'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { leaves } from '@/lib/db/schema';
import { canApproveLeave } from '@/lib/rbac';
import { getSession } from '@/lib/session';

export async function approveLeave(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canApproveLeave(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await db.update(leaves).set({ status: 'validated' }).where(eq(leaves.id, id));
  revalidatePath('/conges');
}

export async function refuseLeave(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canApproveLeave(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;
  await db.update(leaves).set({ status: 'rejected' }).where(eq(leaves.id, id));
  revalidatePath('/conges');
}

/** Self-service leave request created by the current user (status pending). */
export async function createLeave(formData: FormData): Promise<void> {
  const { user } = await getSession();
  const type = String(formData.get('type') ?? 'Congé payé');
  const from = String(formData.get('from') ?? '').trim();
  const to = String(formData.get('to') ?? '').trim();
  const days = Number(formData.get('days') ?? 0);
  const note = String(formData.get('note') ?? '').trim();
  if (!from || !to || days <= 0) return;

  await db.insert(leaves).values({
    personName: user.name,
    type,
    fromLabel: from,
    toLabel: to,
    days,
    status: 'pending',
    note: note || null,
  });
  revalidatePath('/conges');
}
