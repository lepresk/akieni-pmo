import { boolean, date, integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { seniority } from './enums';

/** Global catalog of cost-center labels, with default billability. */
export const costCenterCatalog = pgTable('cost_center_catalog', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: varchar('label', { length: 120 }).notNull().unique(),
  billable: boolean('billable').notNull().default(true),
});

/**
 * Dated rate grid by seniority. `costPerDay` is sensitive (Finance/RH/Direction only).
 * A rate is effective-dated; a change never rewrites already billed periods, so past
 * rows are kept with isCurrent=false.
 */
export const rateGrid = pgTable('rate_grid', {
  id: uuid('id').defaultRandom().primaryKey(),
  seniority: seniority('seniority').notNull(),
  costPerDay: integer('cost_per_day').notNull(),
  sellPerDay: integer('sell_per_day').notNull(),
  effectiveFrom: date('effective_from').notNull(),
  isCurrent: boolean('is_current').notNull().default(true),
});

/** Public holidays used in capacity and chargeability calculations. */
export const holidays = pgTable('holidays', {
  id: uuid('id').defaultRandom().primaryKey(),
  label: varchar('label', { length: 120 }).notNull(),
  observedOn: date('observed_on').notNull(),
});
