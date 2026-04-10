import { pgTable, serial, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";

export const geminiSessionsTable = pgTable("gemini_sessions", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  cookiesJson: text("cookies_json").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  addedBy: integer("added_by"),
});

export type GeminiSession = typeof geminiSessionsTable.$inferSelect;
