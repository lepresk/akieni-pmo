import { pgEnum, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

/**
 * Invoice lifecycle codes. French labels live in billing-display.ts only.
 * quantityLabel / amountLabel remain display strings this pass (known debt).
 */
export const invoiceStatus = pgEnum('invoice_status', [
  'draft',
  'validated',
  'issued',
  'cancelled',
]);

export type InvoiceStatus = (typeof invoiceStatus.enumValues)[number];

/** Pre-invoices generated from validated time (regie) or accepted milestones (forfait). */
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  ref: varchar('ref', { length: 40 }).notNull().unique(),
  projectName: varchar('project_name', { length: 200 }).notNull(),
  clientName: varchar('client_name', { length: 160 }).notNull(),
  model: varchar('model', { length: 20 }).notNull(),
  /** Display-only quantity string (not numeric minor units yet). */
  quantityLabel: varchar('quantity_label', { length: 40 }).notNull(),
  /** Display-only amount string (not numeric minor units yet). */
  amountLabel: varchar('amount_label', { length: 40 }).notNull(),
  status: invoiceStatus('status').notNull().default('draft'),
});
