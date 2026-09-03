import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { integer, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { seniority, userRole } from './enums';

/** Organizational departments (Dev, PMO, Consulting, Support, Finance, RH, Direction, IT). */
export const departments = pgTable('departments', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 120 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/**
 * Employee record. Compensation fields (referenceTjm, salaryGross) are sensitive and
 * must be filtered server-side for roles outside Finance/RH/Direction (see CLAUDE.md 5).
 * Money is stored in whole XAF (no minor unit).
 */
export const employees = pgTable('employees', {
  id: uuid('id').defaultRandom().primaryKey(),
  initials: varchar('initials', { length: 8 }),
  fullName: varchar('full_name', { length: 160 }).notNull(),
  firstName: varchar('first_name', { length: 80 }),
  departmentId: uuid('department_id').references(() => departments.id),
  seniority: seniority('seniority'),
  managerId: uuid('manager_id').references((): AnyPgColumn => employees.id),
  // Default project TJM (sell rate applied when a project does not override it).
  defaultTjm: integer('default_tjm'),
  // Sensitive: reference TJM and gross monthly salary.
  referenceTjm: integer('reference_tjm'),
  salaryGross: integer('salary_gross'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Application user, keyed by Google Workspace email, carrying a role and linked employee. */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 200 }).notNull().unique(),
  role: userRole('role').notNull(),
  employeeId: uuid('employee_id').references(() => employees.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
