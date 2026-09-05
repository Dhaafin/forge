import * as dotenv from "dotenv";
import { join } from "path";

dotenv.config({ path: join(__dirname, "../../../.env.local") });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { users, exercises } from "./schema";
import { eq } from "drizzle-orm";

const SAMPLE_EXERCISES = [
  { name: "Bench Press", targetMuscle: "Chest" },
  { name: "Incline Dumbbell Press", targetMuscle: "Chest" },
  { name: "Cable Fly", targetMuscle: "Chest" },
  { name: "Deadlift", targetMuscle: "Back" },
  { name: "Pull Up", targetMuscle: "Back" },
  { name: "Barbell Row", targetMuscle: "Back" },
  { name: "Lat Pulldown", targetMuscle: "Back" },
  { name: "Barbell Squat", targetMuscle: "Legs" },
  { name: "Leg Press", targetMuscle: "Legs" },
  { name: "Romanian Deadlift", targetMuscle: "Legs" },
  { name: "Leg Curl", targetMuscle: "Legs" },
  { name: "Overhead Press", targetMuscle: "Shoulders" },
  { name: "Lateral Raise", targetMuscle: "Shoulders" },
  { name: "Front Raise", targetMuscle: "Shoulders" },
  { name: "Barbell Curl", targetMuscle: "Arms" },
  { name: "Tricep Pushdown", targetMuscle: "Arms" },
  { name: "Skull Crusher", targetMuscle: "Arms" },
  { name: "Hammer Curl", targetMuscle: "Arms" },
  { name: "Plank", targetMuscle: "Core" },
  { name: "Cable Crunch", targetMuscle: "Core" },
  { name: "Standing Calf Raise", targetMuscle: "Calves" },
] as const;

async function seed() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  // ── Schema DDL (idempotent) ────────────────────────────────────────
  console.log("Ensuring schema is up to date...");

  await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE`;
  await sql`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`;

  await sql`
    CREATE TABLE IF NOT EXISTS exercises (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(150) NOT NULL UNIQUE,
      target_muscle VARCHAR(50) NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS workout_sessions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title VARCHAR(200),
      start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
      end_time TIMESTAMPTZ,
      duration_minutes INTEGER
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS workout_sets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      session_id UUID NOT NULL REFERENCES workout_sessions(id) ON DELETE CASCADE,
      exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE RESTRICT,
      set_number INTEGER NOT NULL,
      weight_kg REAL NOT NULL,
      reps INTEGER NOT NULL,
      set_type VARCHAR(20) NOT NULL DEFAULT 'normal',
      is_pr BOOLEAN NOT NULL DEFAULT false,
      sequence_order INTEGER NOT NULL
    )
  `;

  // ── Seed User ────────────────────────────────────────────────────────
  console.log("Seeding user...");
  const existing = await db.select().from(users).where(eq(users.username, "dhaafinm")).limit(1);

  if (existing.length > 0) {
    console.log("User 'dhaafinm' already exists — skipping.");
  } else {
    await db.insert(users).values({
      username: "dhaafinm",
      name: "Dhaafin Makhalingga",
      passwordHash: "dhaafin5758",
    });
    console.log("User 'dhaafinm' created!");
  }

  // ── Seed Exercises ─────────────────────────────────────────────────
  console.log("Seeding exercises...");
  let inserted = 0;
  for (const ex of SAMPLE_EXERCISES) {
    const found = await db.select().from(exercises).where(eq(exercises.name, ex.name)).limit(1);
    if (found.length === 0) {
      await db.insert(exercises).values({ name: ex.name, targetMuscle: ex.targetMuscle });
      inserted++;
    }
  }
  console.log(`${inserted} new exercise(s) seeded (${SAMPLE_EXERCISES.length - inserted} already existed).`);
  console.log("Seed complete ✓");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
