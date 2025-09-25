import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, index, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth and local auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"), // For local authentication
  authProvider: varchar("auth_provider").default("local"), // 'local' or 'replit'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const signupSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const essays = pgTable("essays", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull().default(""),
  collegeTarget: text("college_target").default("Common App"),
  essayType: text("essay_type").notNull().default("Personal Statement"),
  wordCount: integer("word_count").default(0),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const extracurricularActivities = pgTable("extracurricular_activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  activityName: text("activity_name").notNull(),
  description: text("description").notNull(),
  role: text("role").notNull(),
  duration: text("duration").notNull(),
  impact: text("impact").notNull(),
  lastModified: timestamp("last_modified").defaultNow(),
});

export const insertEssaySchema = createInsertSchema(essays).omit({
  id: true,
  userId: true,
  lastModified: true,
});

export const insertExtracurricularSchema = createInsertSchema(extracurricularActivities).omit({
  id: true,
  userId: true,
  lastModified: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertEssay = z.infer<typeof insertEssaySchema>;
export type Essay = typeof essays.$inferSelect;
export type InsertExtracurricular = z.infer<typeof insertExtracurricularSchema>;
export type ExtracurricularActivity = typeof extracurricularActivities.$inferSelect;
