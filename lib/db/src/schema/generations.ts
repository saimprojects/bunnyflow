import { pgTable, serial, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const generationTypeEnum = pgEnum("generation_type", ["video", "image"]);
export const generationStatusEnum = pgEnum("generation_status", ["pending", "processing", "completed", "failed"]);
export const modelEnum = pgEnum("model", ["veo3", "veo3_fast", "imagen4", "nano_banana", "nano_banana_pro"]);
export const aspectRatioEnum = pgEnum("aspect_ratio", ["landscape", "portrait", "square"]);

export const generationsTable = pgTable("generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  type: generationTypeEnum("type").notNull(),
  model: modelEnum("model").notNull(),
  prompt: text("prompt").notNull(),
  status: generationStatusEnum("status").notNull().default("pending"),
  resultUrl: text("result_url"),
  thumbnailUrl: text("thumbnail_url"),
  creditsUsed: integer("credits_used").notNull(),
  aspectRatio: aspectRatioEnum("aspect_ratio").notNull().default("landscape"),
  duration: integer("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertGenerationSchema = createInsertSchema(generationsTable).omit({ id: true, createdAt: true });
export type InsertGeneration = z.infer<typeof insertGenerationSchema>;
export type Generation = typeof generationsTable.$inferSelect;
