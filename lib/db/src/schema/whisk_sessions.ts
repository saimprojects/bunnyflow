import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const whiskSessionsTable = pgTable("whisk_sessions", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  cookiesJson: text("cookies_json").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  addedBy: integer("added_by"),
});

export type WhiskSession = typeof whiskSessionsTable.$inferSelect;
