import { db } from "@repo/db";
import { workoutSets, workoutSessions } from "@repo/db";
import { eq, and, ne, desc, sum } from "drizzle-orm";

/**
 * Compares total volume (weight × reps) for each exercise in the given session
 * vs the user's most recent previous session containing that same exercise.
 *
 * Logs to console when progressive overload is detected.
 * Returns a map of exerciseId → { current, previous, isOverload }
 */
export async function detectProgressiveOverload(
  sessionId: string,
  userId: string
): Promise<Map<string, { current: number; previous: number; isOverload: boolean }>> {
  const results = new Map<string, { current: number; previous: number; isOverload: boolean }>();

  // 1. Get current session sets grouped by exercise
  const currentSets = await db
    .select()
    .from(workoutSets)
    .where(eq(workoutSets.sessionId, sessionId));

  // Aggregate current volume per exercise
  const currentVolumes = new Map<string, number>();
  for (const s of currentSets) {
    const vol = (currentVolumes.get(s.exerciseId) ?? 0) + s.weightKg * s.reps;
    currentVolumes.set(s.exerciseId, vol);
  }

  // 2. For each exercise in the session, find the last previous session
  for (const [exerciseId, currentVol] of currentVolumes) {
    const lastSet = await db
      .select({ sessionId: workoutSets.sessionId })
      .from(workoutSets)
      .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSets.exerciseId, exerciseId),
          ne(workoutSets.sessionId, sessionId)
        )
      )
      .orderBy(desc(workoutSessions.startTime))
      .limit(1);

    if (lastSet.length === 0 || !lastSet[0]) continue; // No previous data
    const prevSession = lastSet[0];

    const prevSets = await db
      .select()
      .from(workoutSets)
      .where(
        and(
          eq(workoutSets.sessionId, prevSession.sessionId),
          eq(workoutSets.exerciseId, exerciseId)
        )
      );

    const previousVol = prevSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
    const isOverload = currentVol > previousVol;

    results.set(exerciseId, { current: currentVol, previous: previousVol, isOverload });

    if (isOverload) {
      console.log(
        `🔥 OVERLOAD DETECTED: exercise ${exerciseId} — ${currentVol.toFixed(1)}kg vol vs ${previousVol.toFixed(1)}kg`
      );
    }
  }

  return results;
}
