'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import { canExpense } from '@/lib/rbac';
import { getSession } from '@/lib/session';

/** Record a project expense. Restricted to roles allowed to keep the expense register. */
export async function createExpense(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canExpense(role)) return;

  const label = String(formData.get('label') ?? '').trim();
  const amount = Number(formData.get('amount') ?? 0);
  const projectName = String(formData.get('projectName') ?? '').trim();
  if (!label || amount <= 0 || !projectName) return;

  const nature = String(formData.get('nature') ?? 'achat') === 'mission' ? 'mission' : 'achat';
  const stateRaw = String(formData.get('state') ?? 'engage');
  const state = stateRaw === 'facture' || stateRaw === 'paye' ? stateRaw : 'engage';

  await db.insert(expenses).values({
    nature,
    projectName,
    sub: String(formData.get('sub') ?? '').trim() || '—',
    poste: String(formData.get('poste') ?? '').trim() || null,
    label,
    supplier: String(formData.get('supplier') ?? '').trim() || null,
    amount,
    state,
    billable: formData.get('billable') === 'on',
    dateLabel: String(formData.get('date') ?? '').trim() || null,
  });
  revalidatePath('/depenses');
}

/** Advance an expense through its lifecycle: engagé -> facturé -> payé. */
export async function advanceExpense(formData: FormData): Promise<void> {
  const { role } = await getSession();
  if (!canExpense(role)) return;
  const id = String(formData.get('id') ?? '');
  if (!id) return;

  const [row] = await db
    .select({ state: expenses.state })
    .from(expenses)
    .where(eq(expenses.id, id))
    .limit(1);
  if (!row) return;
  const next = row.state === 'engage' ? 'facture' : row.state === 'facture' ? 'paye' : null;
  if (!next) return;

  await db.update(expenses).set({ state: next }).where(eq(expenses.id, id));
  revalidatePath('/depenses');
}
