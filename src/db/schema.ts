// src/db/schema.ts
import { pgTable, serial, text, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Single source of truth application data store in Cloud SQL
export const appStore = pgTable('app_store', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // e.g. 'main_database'
  data: jsonb('data').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
