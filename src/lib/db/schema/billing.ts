import { pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

/** Pre-invoices generated from validated time (régie) or accepted milestones (forfait). */
export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  ref: varchar('ref', { length: 40 }).notNull().unique(),
  projectName: varchar('project_name', { length: 200 }).notNull(),
  clientName: varchar('client_name', { length: 160 }).notNull(),
  model: varchar('model', { length: 20 }).notNull(),
  quantityLabel: varchar('quantity_label', { length: 40 }).notNull(),
  amountLabel: varchar('amount_label', { length: 40 }).notNull(),
  status: varchar('status', { length: 40 }).notNull(),
});
