import { db, exercises } from "@repo/db";
import { workoutSets, workoutSessions } from "@repo/db";
import { eq, and, asc, desc } from "drizzle-orm";
import { recalculatePrsForExercise } from "./pr-engine";

// ── Set Update ─────────────────────────────────────────────────────────────────

export async function updateSet(
  setId: string,
  payload: { weightKg?: number; reps?: number; setType?: string },
  userId: string
) {
  const [existing] = await db
    .select({ exerciseId: workoutSets.exerciseId, weightKg: workoutSets.weightKg })
    .from(workoutSets)
    .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
    .where(and(eq(workoutSets.id, setId), eq(workoutSessions.userId, userId)));

  if (!existing) return null;

  const weightChanged = payload.weightKg !== undefined && payload.weightKg !== existing.weightKg;

  const updateData: Partial<typeof workoutSets.$inferInsert> = {};
  if (payload.weightKg !== undefined) updateData.weightKg = payload.weightKg;
  if (payload.reps !== undefined) updateData.reps = payload.reps;
  if (payload.setType !== undefined) updateData.setType = payload.setType;

  await db.update(workoutSets).set(updateData).where(eq(workoutSets.id, setId));

  if (weightChanged) {
    await recalculatePrsForExercise(userId, existing.exerciseId);
  }

  const [updated] = await db
    .select({
      id: workoutSets.id,
      sessionId: workoutSets.sessionId,
      exerciseId: workoutSets.exerciseId,
      exerciseName: exercises.name,
      setNumber: workoutSets.setNumber,
      weightKg: workoutSets.weightKg,
      reps: workoutSets.reps,
      setType: workoutSets.setType,
      isPr: workoutSets.isPr,
      sequenceOrder: workoutSets.sequenceOrder,
    })
    .from(workoutSets)
    .innerJoin(exercises, eq(workoutSets.exerciseId, exercises.id))
    .where(eq(workoutSets.id, setId));

  return updated;
}

// ── Set Deletion ────────────────────────────────────────────────────────────────

export async function deleteSet(setId: string, userId: string): Promise<boolean> {
  const [existing] = await db
    .select({ exerciseId: workoutSets.exerciseId })
    .from(workoutSets)
    .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
    .where(and(eq(workoutSets.id, setId), eq(workoutSessions.userId, userId)));

  if (!existing) return false;

  await db.delete(workoutSets).where(eq(workoutSets.id, setId));
  await recalculatePrsForExercise(userId, existing.exerciseId);

  return true;
}
