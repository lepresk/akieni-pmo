import { boolean, pgTable, text, timestamp, unique, uuid, varchar } from 'drizzle-orm/pg-core';

import { users } from './organization';

/** In-app (and channel-tagged) notification for a user. */
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  body: text('body').notNull(),
  channel: varchar('channel', { length: 40 }).notNull(),
  href: varchar('href', { length: 240 }),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

/** Per-user notification preference toggle. */
export const notificationRules = pgTable(
  'notification_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    key: varchar('key', { length: 80 }).notNull(),
    label: varchar('label', { length: 160 }).notNull(),
    enabled: boolean('enabled').notNull().default(true),
  },
  (table) => [unique('notification_rules_user_key').on(table.userId, table.key)],
);
