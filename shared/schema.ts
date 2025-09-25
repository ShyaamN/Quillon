import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const essays = pgTable("essays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  collegeTarget: text("college_target").default("Common App"),
  essayType: text("essay_type").notNull().default("Personal Statement"),
  wordCount: integer("word_count").default(0),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const extracurricularActivities = pgTable("extracurricular_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  activityName: text("activity_name").notNull(),
  description: text("description").notNull(),
  role: text("role").notNull(),
  duration: text("duration").notNull(),
  impact: text("impact").notNull(),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const insertEssaySchema = createInsertSchema(essays).omit({
  id: true,
  lastModified: true,
});

export const insertExtracurricularSchema = createInsertSchema(extracurricularActivities).omit({
  id: true,
  lastModified: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEssay = z.infer<typeof insertEssaySchema>;
export type Essay = typeof essays.$inferSelect;
export type InsertExtracurricular = z.infer<typeof insertExtracurricularSchema>;
export type ExtracurricularActivity = typeof extracurricularActivities.$inferSelect;
