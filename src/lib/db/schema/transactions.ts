import {
  boolean,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { employees } from './organization';

/** Shared approval lifecycle for submissions and leave requests. */
export const approvalStatus = pgEnum('approval_status', ['pending', 'validated', 'rejected']);

/** Expense nature: purchases/subcontracting vs mission (travel) costs. */
export const expenseNature = pgEnum('expense_nature', ['achat', 'mission']);

/** Expense lifecycle: committed -> invoiced by supplier -> paid. */
export const expenseState = pgEnum('expense_state', ['engage', 'facture', 'paye']);

/**
 * One timesheet line with Mon..Sun daily hours.
 * Totals on the submission row are derived as the sum of all day cells.
 */
export interface SubmissionLine {
  readonly project: string;
  readonly poste: string;
  readonly activity: string;
  readonly hours: readonly [number, number, number, number, number, number, number];
}

/** A weekly timesheet submitted by an employee for N+1 validation. */
export const submissions = pgTable('submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  personName: varchar('person_name', { length: 160 }).notNull(),
  department: varchar('department', { length: 120 }),
  managerName: varchar('manager_name', { length: 160 }),
  /** ISO Monday YYYY-MM-DD for the submitted week. */
  weekStart: date('week_start').notNull(),
  weekLabel: varchar('week_label', { length: 60 }).notNull(),
  hours: real('hours').notNull(),
  billable: real('billable').notNull(),
  status: approvalStatus('status').notNull().default('pending'),
  motif: text('motif'),
  flags: jsonb('flags').$type<string[]>().notNull().default([]),
  lines: jsonb('lines').$type<SubmissionLine[]>().notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** A leave request (paid leave, sick, unpaid, recovery). */
export const leaves = pgTable('leaves', {
  id: uuid('id').defaultRandom().primaryKey(),
  employeeId: uuid('employee_id').references(() => employees.id, { onDelete: 'set null' }),
  personName: varchar('person_name', { length: 160 }).notNull(),
  type: varchar('type', { length: 60 }).notNull(),
  fromDate: date('from_date').notNull(),
  toDate: date('to_date').notNull(),
  fromLabel: varchar('from_label', { length: 40 }).notNull(),
  toLabel: varchar('to_label', { length: 40 }).notNull(),
  days: real('days').notNull(),
  status: approvalStatus('status').notNull().default('pending'),
  note: text('note'),
});

/** Annual leave balance snapshot per employee (no accrual engine in this pass). */
export const leaveBalances = pgTable(
  'leave_balances',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    employeeId: uuid('employee_id')
      .references(() => employees.id, { onDelete: 'cascade' })
      .notNull(),
    year: integer('year').notNull(),
    acquiredDays: real('acquired_days').notNull(),
    takenDays: real('taken_days').notNull(),
  },
  (table) => [unique('leave_balances_employee_year').on(table.employeeId, table.year)],
);

/** A project expense (purchase or mission cost) tracked through its lifecycle. */
export const expenses = pgTable('expenses', {
  id: uuid('id').defaultRandom().primaryKey(),
  nature: expenseNature('nature').notNull(),
  projectName: varchar('project_name', { length: 200 }).notNull(),
  sub: varchar('sub', { length: 160 }),
  poste: varchar('poste', { length: 120 }),
  label: varchar('label', { length: 200 }).notNull(),
  supplier: varchar('supplier', { length: 160 }),
  amount: integer('amount').notNull(),
  state: expenseState('state').notNull(),
  billable: boolean('billable').notNull().default(false),
  expenseDate: date('expense_date'),
  dateLabel: varchar('date_label', { length: 40 }),
});
