import { pgTable, serial, text, integer, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const planEnum = pgEnum("plan", ["free", "basic", "pro", "starter", "ultra", "unlimited"]);

export const PLAN_CREDITS: Record<string, number> = {
  free: 500,
  basic: 5000,
  starter: 25000,
  ultra: 45000,
  unlimited: 999999,
  pro: 10000,
};

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  plan: planEnum("plan").notNull().default("free"),
  credits: integer("credits").notNull().default(500),
  creditsTotal: integer("credits_total").notNull().default(500),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastActiveAt: timestamp("last_active_at"),
  planStartDate: timestamp("plan_start_date"),
  planExpiresAt: timestamp("plan_expires_at"),
  referralCode: text("referral_code").unique(),
  referredBy: integer("referred_by"),
  tokens: integer("tokens").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
