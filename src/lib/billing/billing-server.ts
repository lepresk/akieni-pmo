import { asc } from 'drizzle-orm';

import { db } from '@/lib/db';
import { invoices } from '@/lib/db/schema';

/** Data reads for invoicing. Server-only. */

export interface InvoiceRow {
  readonly id: string;
  readonly ref: string;
  readonly projectName: string;
  readonly clientName: string;
  readonly model: string;
  readonly quantityLabel: string;
  readonly amountLabel: string;
  readonly status: string;
}

export async function getInvoices(): Promise<readonly InvoiceRow[]> {
  return db
    .select({
      id: invoices.id,
      ref: invoices.ref,
      projectName: invoices.projectName,
      clientName: invoices.clientName,
      model: invoices.model,
      quantityLabel: invoices.quantityLabel,
      amountLabel: invoices.amountLabel,
      status: invoices.status,
    })
    .from(invoices)
    .orderBy(asc(invoices.ref));
}
