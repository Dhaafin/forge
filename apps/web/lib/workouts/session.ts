import { db, exercises } from "@repo/db";
import { workoutSets, workoutSessions } from "@repo/db";
import { eq, and, ne, asc, desc, ilike, or } from "drizzle-orm";
import { recalculatePrsForExercise } from "./pr-engine";
import { detectProgressiveOverload } from "./progressive-overload";

// ── Types ──────────────────────────────────────────────────────────────────

export type WorkoutSetInput = {
  exerciseId: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  setType?: string;
  sequenceOrder: number;
};

export type WorkoutSetUpdateInput = WorkoutSetInput & {
  id?: string; // if provided → update existing; omitted → create new
};

export type CreateSessionPayload = {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  sets: WorkoutSetInput[];
};

export type UpdateSessionPayload = {
  title?: string;
  startTime?: Date;
  endTime?: Date;
  durationMinutes?: number;
  sets?: WorkoutSetUpdateInput[];
};

// ── Session Creation ────────────────────────────────────────────────────────

export async function createSession(payload: CreateSessionPayload, userId: string) {
  const sessionStart = payload.startTime ?? new Date();

  let sessionEnd: Date;
  let duration: number;

  if (payload.endTime) {
    sessionEnd = payload.endTime;
    const calcDuration = Math.round((sessionEnd.getTime() - sessionStart.getTime()) / 60000);
    duration = payload.durationMinutes ?? Math.max(0, calcDuration);
  } else {
    duration = payload.durationMinutes ?? 0;
    sessionEnd = new Date(sessionStart.getTime() + duration * 60000);
  }

  // 1. Create session
  const [session] = await db
    .insert(workoutSessions)
    .values({ userId, title: payload.title, startTime: sessionStart, endTime: sessionEnd, durationMinutes: duration })
    .returning();

  // 2. Evaluate PRs and insert sets
  for (const s of payload.sets) {
    // Find highest weight for this exercise across all past sessions (not current)
    const pastSets = await db
      .select({ weightKg: workoutSets.weightKg })
      .from(workoutSets)
      .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
      .where(
        and(
          eq(workoutSessions.userId, userId),
          eq(workoutSets.exerciseId, s.exerciseId),
          ne(workoutSets.sessionId, session.id)
        )
      )
      .orderBy(desc(workoutSets.weightKg))
      .limit(1);

    const highestPastWeight = pastSets[0]?.weightKg ?? null;
    const isPr = highestPastWeight === null || s.weightKg > highestPastWeight;

    await db.insert(workoutSets).values({
      sessionId: session.id,
      exerciseId: s.exerciseId,
      setNumber: s.setNumber,
      weightKg: s.weightKg,
      reps: s.reps,
      setType: s.setType ?? "normal",
      isPr,
      sequenceOrder: s.sequenceOrder,
    });
  }

  // 3. Detect progressive overload (non-blocking, best-effort)
  try {
    await detectProgressiveOverload(session.id, userId);
  } catch (e) {
    console.warn("⚠️ Progressive overload detection failed:", e);
  }

  return getSessionById(session.id);
}

// ── Session Update ───────────────────────────────────────────────────────────

export async function updateSession(
  sessionId: string,
  payload: UpdateSessionPayload,
  userId: string
) {
  const affectedExerciseIds = new Set<string>();

  // 1. Update session metadata
  const updateData: Partial<typeof workoutSessions.$inferInsert> = {};
  if (payload.title !== undefined) updateData.title = payload.title;
  if (payload.startTime !== undefined) updateData.startTime = payload.startTime;
  if (payload.endTime !== undefined) updateData.endTime = payload.endTime;
  if (payload.durationMinutes !== undefined) updateData.durationMinutes = payload.durationMinutes;

  if (Object.keys(updateData).length > 0) {
    await db.update(workoutSessions).set(updateData).where(eq(workoutSessions.id, sessionId));
  }

  // 2. Differential set sync
  if (payload.sets !== undefined) {
    const existingSets = await db
      .select()
      .from(workoutSets)
      .where(eq(workoutSets.sessionId, sessionId));

    const existingMap = new Map(existingSets.map((s) => [s.id, s]));
    const incomingIds = new Set<string>();

    for (const s of payload.sets) {
      if (s.id) {
        // Update existing set
        const existing = existingMap.get(s.id);
        if (!existing) throw new Error(`Set ID ${s.id} does not belong to this session`);

        incomingIds.add(s.id);
        affectedExerciseIds.add(existing.exerciseId);
        if (s.exerciseId !== existing.exerciseId) affectedExerciseIds.add(s.exerciseId);

        await db
          .update(workoutSets)
          .set({
            exerciseId: s.exerciseId,
            setNumber: s.setNumber,
            weightKg: s.weightKg,
            reps: s.reps,
            setType: s.setType ?? "normal",
            sequenceOrder: s.sequenceOrder,
          })
          .where(eq(workoutSets.id, s.id));
      } else {
        // Insert new set
        affectedExerciseIds.add(s.exerciseId);
        await db.insert(workoutSets).values({
          sessionId,
          exerciseId: s.exerciseId,
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          setType: s.setType ?? "normal",
          isPr: false,
          sequenceOrder: s.sequenceOrder,
        });
      }
    }

    // Delete sets not present in payload
    for (const [id, set] of existingMap) {
      if (!incomingIds.has(id)) {
        affectedExerciseIds.add(set.exerciseId);
        await db.delete(workoutSets).where(eq(workoutSets.id, id));
      }
    }
  }

  // Also recalc PRs if start_time changed (all exercise ids in session)
  if (payload.startTime !== undefined) {
    const remainingSets = await db
      .select({ exerciseId: workoutSets.exerciseId })
      .from(workoutSets)
      .where(eq(workoutSets.sessionId, sessionId));
    remainingSets.forEach((s) => affectedExerciseIds.add(s.exerciseId));
  }

  // 3. Recalculate PRs for all affected exercises
  for (const exerciseId of affectedExerciseIds) {
    await recalculatePrsForExercise(userId, exerciseId);
  }

  return getSessionById(sessionId);
}

// ── Session Deletion ──────────────────────────────────────────────────────────

export async function deleteSession(sessionId: string, userId: string) {
  const sessionSets = await db
    .select({ exerciseId: workoutSets.exerciseId })
    .from(workoutSets)
    .where(eq(workoutSets.sessionId, sessionId));

  const exerciseIds = [...new Set(sessionSets.map((s) => s.exerciseId))];

  await db.delete(workoutSessions).where(eq(workoutSessions.id, sessionId));

  for (const exerciseId of exerciseIds) {
    await recalculatePrsForExercise(userId, exerciseId);
  }
}

// ── Session Query ──────────────────────────────────────────────────────────────

export async function getSessionById(sessionId: string) {
  const [session] = await db
    .select()
    .from(workoutSessions)
    .where(eq(workoutSessions.id, sessionId));

  if (!session) return null;

  const sets = await db
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
    .where(eq(workoutSets.sessionId, sessionId))
    .orderBy(asc(workoutSets.sequenceOrder));

  return { ...session, sets };
}
