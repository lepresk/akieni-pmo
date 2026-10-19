'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { writeAuditLog } from '@/lib/audit/audit-server';
import { issueInvoiceInputSchema, type BillingActionResult } from '@/lib/billing/billing-schemas';
import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';
import { canInvoice } from '@/lib/rbac';
import { getSession } from '@/lib/session';

/** Issue a validated invoice (status -> issued). Restricted to canInvoice roles. */
export async function issueInvoice(raw: unknown): Promise<BillingActionResult> {
  const { role, user } = await getSession();
  if (!canInvoice(role)) {
    return {
      ok: false,
      code: 'billing.unauthorized',
      message: 'Invoicing is restricted to Finance, Direction, and Admin.',
    };
  }

  const parsed = issueInvoiceInputSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, code: 'billing.invalid', message: 'Invalid invoice id.' };
  }

  const [row] = await db
    .select({ id: invoices.id, ref: invoices.ref, status: invoices.status })
    .from(invoices)
    .where(eq(invoices.id, parsed.data.id))
    .limit(1);

  if (!row) {
    return { ok: false, code: 'billing.not_found', message: 'Invoice not found.' };
  }

  if (row.status !== 'validated') {
    return {
      ok: false,
      code: 'billing.invalid',
      message: 'Only a validated invoice can be issued.',
    };
  }

  await db.update(invoices).set({ status: 'issued' }).where(eq(invoices.id, row.id));
  await writeAuditLog({
    who: user.name,
    role,
    action: 'invoice.issue',
    target: row.ref,
    sensitive: true,
  });
  revalidatePath('/facturation');
  return { ok: true };
}

/** Form-action adapter (Next.js form actions must return void). */
export async function issueInvoiceForm(formData: FormData): Promise<void> {
  await issueInvoice({ id: String(formData.get('id') ?? '') });
}
