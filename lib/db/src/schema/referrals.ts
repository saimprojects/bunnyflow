import { pgTable, serial, integer, text, timestamp, pgEnum, boolean } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const referralStatusEnum = pgEnum("referral_status", ["pending", "purchased"]);
export const withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected", "paid"]);
export const withdrawalMethodEnum = pgEnum("withdrawal_method", ["binance", "easypaisa", "bank_transfer"]);

export const referralsTable = pgTable("referrals", {
  id: serial("id").primaryKey(),
  referrerId: integer("referrer_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  referredUserId: integer("referred_user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  status: referralStatusEnum("status").notNull().default("pending"),
  planPurchased: text("plan_purchased"),
  tokensAwarded: integer("tokens_awarded").notNull().default(0),
  rewarded: boolean("rewarded").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  rewardedAt: timestamp("rewarded_at"),
});

export const tokenTransactionsTable = pgTable("token_transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  amount: integer("amount").notNull(),
  reason: text("reason").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const withdrawalRequestsTable = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  tokenAmount: integer("token_amount").notNull(),
  usdAmount: text("usd_amount").notNull(),
  method: withdrawalMethodEnum("method").notNull(),
  accountDetails: text("account_details").notNull(),
  status: withdrawalStatusEnum("status").notNull().default("pending"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  processedAt: timestamp("processed_at"),
});

export type Referral = typeof referralsTable.$inferSelect;
export type TokenTransaction = typeof tokenTransactionsTable.$inferSelect;
export type WithdrawalRequest = typeof withdrawalRequestsTable.$inferSelect;
