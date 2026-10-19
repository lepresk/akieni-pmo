'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/lib/audit/audit-server';
import { formatDateLabelFr } from '@/lib/calendar/date-label-fr';
import { db } from '@/lib/db';
import { expenses } from '@/lib/db/schema';
import {
  advanceExpenseInputSchema,
  createExpenseInputSchema,
  type ExpenseActionResult,
} from '@/lib/expenses/expenses-schemas';
import { canExpense } from '@/lib/rbac';
import { getSession } from '@/lib/session';

/** Record a project expense. Restricted to roles allowed to keep the expense register. */
export async function createExpense(formData: FormData): Promise<ExpenseActionResult> {
  const { role, user } = await getSession();
  if (!canExpense(role)) {
    return {
      ok: false,
      code: 'expense.unauthorized',
      message: 'Expense entry is restricted.',
    };
  }

  const natureRaw = String(formData.get('nature') ?? 'achat');
  const stateRaw = String(formData.get('state') ?? 'engage');
  const expenseDateRaw = String(formData.get('expenseDate') ?? formData.get('date') ?? '').trim();
  const expenseDate = /^\d{4}-\d{2}-\d{2}$/.test(expenseDateRaw) ? expenseDateRaw : undefined;

  const parsed = createExpenseInputSchema.safeParse({
    nature: natureRaw === 'mission' ? 'mission' : 'achat',
    projectName: String(formData.get('projectName') ?? '').trim(),
    sub: String(formData.get('sub') ?? '').trim() || undefined,
    poste: String(formData.get('poste') ?? '').trim() || undefined,
    label: String(formData.get('label') ?? '').trim(),
    supplier: String(formData.get('supplier') ?? '').trim() || undefined,
    amount: Number(formData.get('amount') ?? 0),
    billable: formData.get('billable') === 'on',
    expenseDate,
  });

  if (!parsed.success) {
    return { ok: false, code: 'expense.invalid', message: 'Invalid expense payload.' };
  }

  const input = parsed.data;
  const state = stateRaw === 'facture' || stateRaw === 'paye' ? stateRaw : 'engage';
  const sub = input.sub && input.sub !== '-' ? input.sub : null;
  const dateLabel = input.expenseDate
    ? formatDateLabelFr(input.expenseDate)
    : String(formData.get('date') ?? '').trim() || null;

  await db.insert(expenses).values({
    nature: input.nature,
    projectName: input.projectName,
    sub,
    poste: input.poste ?? null,
    label: input.label,
    supplier: input.supplier ?? null,
    amount: input.amount,
    state,
    billable: input.billable,
    expenseDate: input.expenseDate ?? null,
    dateLabel,
  });

  await writeAuditLog({
    who: user.name,
    role,
    action: 'expense.create',
    target: `${input.projectName} · ${input.label}`,
    sensitive: true,
  });
  revalidatePath('/depenses');
  return { ok: true };
}

/** Form-action adapter (Next.js form actions must return void). */
export async function createExpenseForm(formData: FormData): Promise<void> {
  await createExpense(formData);
}

/** Advance an expense through its lifecycle: engagé -> facturé -> payé. */
export async function advanceExpense(formData: FormData): Promise<ExpenseActionResult> {
  const { role, user } = await getSession();
  if (!canExpense(role)) {
    return {
      ok: false,
      code: 'expense.unauthorized',
      message: 'Expense entry is restricted.',
    };
  }

  const parsed = advanceExpenseInputSchema.safeParse({
    id: String(formData.get('id') ?? ''),
  });
  if (!parsed.success) {
    return { ok: false, code: 'expense.invalid', message: 'Invalid expense id.' };
  }

  const [row] = await db
    .select({ id: expenses.id, state: expenses.state, label: expenses.label })
    .from(expenses)
    .where(eq(expenses.id, parsed.data.id))
    .limit(1);
  if (!row) {
    return { ok: false, code: 'expense.invalid', message: 'Expense not found.' };
  }

  const next = row.state === 'engage' ? 'facture' : row.state === 'facture' ? 'paye' : null;
  if (!next) {
    return { ok: false, code: 'expense.invalid', message: 'Expense is already paid.' };
  }

  await db.update(expenses).set({ state: next }).where(eq(expenses.id, row.id));
  await writeAuditLog({
    who: user.name,
    role,
    action: 'expense.state_change',
    target: `${row.label} · ${row.state} -> ${next}`,
    sensitive: true,
  });
  revalidatePath('/depenses');
  return { ok: true };
}

/** Form-action adapter for advanceExpense. */
export async function advanceExpenseForm(formData: FormData): Promise<void> {
  await advanceExpense(formData);
}
