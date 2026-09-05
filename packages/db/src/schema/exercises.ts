import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

export const TARGET_MUSCLES = [
  "Chest",
  "Back",
  "Legs",
  "Shoulders",
  "Arms",
  "Core",
  "Cardio",
  "Full Body",
  "Calves",
] as const;

export type TargetMuscle = (typeof TARGET_MUSCLES)[number];

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 150 }).notNull().unique(),
  targetMuscle: varchar("target_muscle", { length: 50 }).notNull(),
});
