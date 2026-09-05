import { db } from "@repo/db";
import { workoutSets, workoutSessions } from "@repo/db";
import { eq, and, asc } from "drizzle-orm";

/**
 * Recalculates the `is_pr` flag for all sets of a given exercise
 * belonging to a user, in chronological order.
 *
 * A set is marked as PR if its weight_kg is strictly greater than
 * the highest weight seen in all *previous* sets of the same exercise.
 */
export async function recalculatePrsForExercise(
  userId: string,
  exerciseId: string
): Promise<void> {
  // Fetch all sets for this user + exercise in chronological order
  const allSets = await db
    .select({
      id: workoutSets.id,
      weightKg: workoutSets.weightKg,
      isPr: workoutSets.isPr,
      sessionId: workoutSets.sessionId,
      sequenceOrder: workoutSets.sequenceOrder,
      startTime: workoutSessions.startTime,
    })
    .from(workoutSets)
    .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
    .where(
      and(
        eq(workoutSessions.userId, userId),
        eq(workoutSets.exerciseId, exerciseId)
      )
    )
    .orderBy(asc(workoutSessions.startTime), asc(workoutSets.sequenceOrder));

  let highestWeight = 0;

  for (const set of allSets) {
    const shouldBePr = set.weightKg > highestWeight;
    if (shouldBePr) highestWeight = set.weightKg;

    // Only update if the flag needs to change (avoid unnecessary DB writes)
    if (set.isPr !== shouldBePr) {
      await db
        .update(workoutSets)
        .set({ isPr: shouldBePr })
        .where(eq(workoutSets.id, set.id));
    }
  }
}
