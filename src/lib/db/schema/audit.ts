import { boolean, pgTable, uuid, varchar } from 'drizzle-orm/pg-core';

/** Append-only audit log of access to sensitive data and finance/RH mutations. */
export const auditLog = pgTable('audit_log', {
  id: uuid('id').defaultRandom().primaryKey(),
  at: varchar('at', { length: 40 }).notNull(),
  who: varchar('who', { length: 160 }).notNull(),
  role: varchar('role', { length: 60 }).notNull(),
  action: varchar('action', { length: 200 }).notNull(),
  target: varchar('target', { length: 200 }).notNull(),
  sensitive: boolean('sensitive').notNull().default(false),
});
