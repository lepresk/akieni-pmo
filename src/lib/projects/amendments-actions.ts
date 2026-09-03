'use server';

import { and, count, eq, isNull, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { amendments, projectEnvelopes, projects } from '@/lib/db/schema';
import { canEditBudget, canMargin } from '@/lib/rbac';
import { getSession } from '@/lib/session';

type Target = 'mo' | 'achats' | 'mission';

function isTarget(value: string): value is Target {
  return value === 'mo' || value === 'achats' || value === 'mission';
}

/** Create a budget amendment request (status pending). */
export async function createAmendment(formData: FormData): Promise<void> {
  const { role, user } = await getSession();
  if (!canEditBudget(role)) return;

  const projectId = String(formData.get('projectId') ?? '');
  const reason = String(formData.get('reason') ?? '').trim();
  const targetRaw = String(formData.get('target') ?? 'mo');
  if (!projectId || !reason) return;
  const target: Target = isTarget(targetRaw) ? targetRaw : 'mo';

  const [existing] = await db
    .select({ n: count() })
    .from(amendments)
    .where(eq(amendments.projectId, projectId));
  const ref = `AV-${String((existing?.n ?? 0) + 1).padStart(2, '0')}`;

  await db.insert(amendments).values({
    projectId,
    ref,
    target,
    poste: String(formData.get('poste') ?? '').trim() || null,
    reason,
    days: Number(formData.get('days') ?? 0),
    amount: Number(formData.get('amount') ?? 0),
    status: 'pending',
    asker: user.name,
    dateLabel: null,
  });
  revalidatePath(`/projets/${projectId}`);
}

/** Approve an amendment: credits the project budget (man-days) and the target envelope. */
export async function approveAmendment(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canMargin(role)) return; // Finance / Direction
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const [amendment] = await db.select().from(amendments).where(eq(amendments.id, id)).limit(1);
  if (!amendment || amendment.status === 'approved') return;

  await db.update(amendments).set({ status: 'approved' }).where(eq(amendments.id, id));

  if (amendment.days > 0) {
    await db
      .update(projects)
      .set({ budgetDays: sql`${projects.budgetDays} + ${amendment.days}` })
      .where(eq(projects.id, amendment.projectId));
  }

  const scope = and(
    eq(projectEnvelopes.projectId, amendment.projectId),
    isNull(projectEnvelopes.sub),
  );
  if (amendment.target === 'achats') {
    await db
      .update(projectEnvelopes)
      .set({ achats: sql`${projectEnvelopes.achats} + ${amendment.amount}` })
      .where(scope);
  } else if (amendment.target === 'mission') {
    await db
      .update(projectEnvelopes)
      .set({ mission: sql`${projectEnvelopes.mission} + ${amendment.amount}` })
      .where(scope);
  } else {
    await db
      .update(projectEnvelopes)
      .set({ mo: sql`${projectEnvelopes.mo} + ${amendment.amount}` })
      .where(scope);
  }

  revalidatePath(`/projets/${amendment.projectId}`);
}
