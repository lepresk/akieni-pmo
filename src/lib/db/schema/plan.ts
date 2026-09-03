import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { employees } from './organization';

/**
 * Weekly planned load per employee (percentage of capacity), used for chargeability and
 * the capacity plan. One row per employee per ISO week.
 */
export const planLoad = pgTable('plan_load', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id')
    .references(() => employees.id, { onDelete: 'cascade' })
    .notNull(),
  weekCode: varchar('week_code', { length: 8 }).notNull(),
  weekIndex: integer('week_index').notNull(),
  pct: integer('pct').notNull(),
});
