import { pgTable, uuid, varchar, integer, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const workoutSessions = pgTable("workout_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 200 }),
  startTime: timestamp("start_time", { mode: "date" }).defaultNow().notNull(),
  endTime: timestamp("end_time", { mode: "date" }),
  durationMinutes: integer("duration_minutes"),
});
