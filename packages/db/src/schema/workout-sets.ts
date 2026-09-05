import { pgTable, uuid, integer, varchar, boolean, real } from "drizzle-orm/pg-core";
import { workoutSessions } from "./workout-sessions";
import { exercises } from "./exercises";

export const SET_TYPES = ["normal", "warmup", "drop", "failure"] as const;
export type SetType = (typeof SET_TYPES)[number];

export const workoutSets = pgTable("workout_sets", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => workoutSessions.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id")
    .notNull()
    .references(() => exercises.id, { onDelete: "restrict" }),
  setNumber: integer("set_number").notNull(),
  weightKg: real("weight_kg").notNull(),
  reps: integer("reps").notNull(),
  setType: varchar("set_type", { length: 20 }).default("normal").notNull(),
  isPr: boolean("is_pr").default(false).notNull(),
  sequenceOrder: integer("sequence_order").notNull(),
});
