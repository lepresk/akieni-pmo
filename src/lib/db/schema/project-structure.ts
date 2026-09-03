import { integer, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

import { projects } from './projects';

/** Sub-projects (lots) of a program. Simple projects have none. */
export const projectNodes = pgTable('project_nodes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  pmName: varchar('pm_name', { length: 160 }),
  budgetDays: integer('budget_days').notNull().default(0),
  position: integer('position').notNull().default(0),
});

/** Contractual budget envelopes per scope: project level (sub null) or a sub-project. */
export const projectEnvelopes = pgTable('project_envelopes', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  sub: varchar('sub', { length: 160 }),
  mo: integer('mo').notNull().default(0),
  achats: integer('achats').notNull().default(0),
  mission: integer('mission').notNull().default(0),
});

/** Planned activities under a cost center, dated in weeks, with progress. */
export const activities = pgTable('activities', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  sub: varchar('sub', { length: 160 }),
  poste: varchar('poste', { length: 120 }).notNull(),
  name: varchar('name', { length: 200 }).notNull(),
  responsible: varchar('responsible', { length: 160 }),
  fromWeek: integer('from_week').notNull().default(0),
  toWeek: integer('to_week').notNull().default(0),
  days: integer('days').notNull().default(0),
  progress: integer('progress').notNull().default(0),
});

/** Resources assigned to a project (or sub-project). */
export const assignments = pgTable('assignments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  sub: varchar('sub', { length: 160 }),
  employeeName: varchar('employee_name', { length: 160 }).notNull(),
  allocationPct: integer('allocation_pct').notNull().default(0),
  projectTjm: integer('project_tjm'),
  seniority: varchar('seniority', { length: 40 }),
});

/** Budget amendments (avenants): revise an envelope after approval. */
export const amendments = pgTable('amendments', {
  id: uuid('id').defaultRandom().primaryKey(),
  projectId: uuid('project_id')
    .references(() => projects.id, { onDelete: 'cascade' })
    .notNull(),
  ref: varchar('ref', { length: 20 }).notNull(),
  target: varchar('target', { length: 20 }).notNull(),
  poste: varchar('poste', { length: 120 }),
  reason: varchar('reason', { length: 240 }).notNull(),
  days: integer('days').notNull().default(0),
  amount: integer('amount').notNull().default(0),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
  asker: varchar('asker', { length: 160 }),
  dateLabel: varchar('date_label', { length: 40 }),
});
