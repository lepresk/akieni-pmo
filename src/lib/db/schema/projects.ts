import {
  boolean,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { clients } from './clients';
import { projectModel, projectNature, segment } from './enums';
import { employees } from './organization';

/**
 * Project (or program). `costLoad` is the internal cost ratio of sold revenue;
 * project margin = 1 - costLoad. Budget is expressed in man-days.
 */
export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: varchar('code', { length: 32 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  clientId: uuid('client_id').references(() => clients.id),
  segment: segment('segment').notNull(),
  model: projectModel('model').notNull(),
  nature: projectNature('nature').notNull(),
  budgetDays: integer('budget_days').notNull().default(0),
  spentDays: integer('spent_days').notNull().default(0),
  description: text('description'),
  pmEmployeeId: uuid('pm_employee_id').references(() => employees.id),
  costLoad: numeric('cost_load', { precision: 5, scale: 3 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Cost centers attached to a project - the analytical axis time is booked against. */
export const costCenters = pgTable('cost_centers', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  label: varchar('label', { length: 120 }).notNull(),
  billable: boolean('billable').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
