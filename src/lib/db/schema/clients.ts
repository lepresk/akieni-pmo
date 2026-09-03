import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

/** Client organizations projects are delivered for. */
export const clients = pgTable('clients', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 160 }).notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
