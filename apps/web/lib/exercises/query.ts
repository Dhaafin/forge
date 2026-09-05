import { db, exercises } from "@repo/db";
import { workoutSets, workoutSessions } from "@repo/db";
import { eq, and, ilike, or, asc, desc, count } from "drizzle-orm";

// ── Exercise List Query ─────────────────────────────────────────────────────

export type ExerciseQueryParams = {
  search?: string;
  sortBy?: "name" | "target_muscle";
  order?: "asc" | "desc";
  limit?: number;
  offset?: number;
};

export async function getAllExercises(params: ExerciseQueryParams = {}) {
  const { search, sortBy = "name", order = "asc", limit = 20, offset = 0 } = params;

  const whereClause = search
    ? or(ilike(exercises.name, `%${search}%`), ilike(exercises.targetMuscle, `%${search}%`))
    : undefined;

  const [countResult] = await db
    .select({ total: count() })
    .from(exercises)
    .where(whereClause);

  const total = Number(countResult?.total ?? 0);

  const sortCol = sortBy === "target_muscle" ? exercises.targetMuscle : exercises.name;

  const data = await db
    .select()
    .from(exercises)
    .where(whereClause)
    .orderBy(order === "desc" ? desc(sortCol) : asc(sortCol))
    .limit(limit)
    .offset(offset);

  return { data, total: Number(total) };
}

// ── Exercise History ────────────────────────────────────────────────────────

export type ExerciseHistoryParams = { limit?: number; offset?: number };

/** Estimate 1RM using Epley formula: weight × (1 + reps/30) */
function estimate1RM(weightKg: number, reps: number): number {
  return reps <= 1 ? weightKg : weightKg * (1 + reps / 30);
}

export async function getExerciseHistory(
  exerciseId: string,
  userId: string,
  params: ExerciseHistoryParams = {}
) {
  const { limit = 15, offset = 0 } = params;

  const exercise = await db.select().from(exercises).where(eq(exercises.id, exerciseId)).limit(1);
  if (exercise.length === 0 || !exercise[0]) return null;
  const ex = exercise[0];

  // All-time sets for stats computation
  const allSets = await db
    .select()
    .from(workoutSets)
    .innerJoin(workoutSessions, eq(workoutSets.sessionId, workoutSessions.id))
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSets.exerciseId, exerciseId)));

  if (allSets.length === 0) {
    return {
      exerciseId,
      exerciseName: ex.name,
      targetMuscle: ex.targetMuscle,
      allTimeMaxWeight: 0,
      allTimeMaxVolume: 0,
      estimatedOneRm: 0,
      history: [],
    };
  }

  const sets = allSets.map((r) => r.workout_sets);

  const allTimeMaxWeight = Math.max(...sets.map((s) => s.weightKg));
  const estimatedOneRm = Math.max(...sets.map((s) => estimate1RM(s.weightKg, s.reps)));

  // Volume per session
  const volumeBySession = new Map<string, number>();
  for (const { workout_sets: s } of allSets) {
    volumeBySession.set(
      s.sessionId,
      (volumeBySession.get(s.sessionId) ?? 0) + s.weightKg * s.reps
    );
  }
  const allTimeMaxVolume = Math.max(...volumeBySession.values());

  // Paginated session history
  const sessions = await db
    .selectDistinct({ id: workoutSessions.id, title: workoutSessions.title, startTime: workoutSessions.startTime })
    .from(workoutSessions)
    .innerJoin(workoutSets, eq(workoutSets.sessionId, workoutSessions.id))
    .where(and(eq(workoutSessions.userId, userId), eq(workoutSets.exerciseId, exerciseId)))
    .orderBy(desc(workoutSessions.startTime))
    .limit(limit)
    .offset(offset);

  const history = await Promise.all(
    sessions.map(async (sess) => {
      const sessionSets = await db
        .select()
        .from(workoutSets)
        .where(and(eq(workoutSets.sessionId, sess.id), eq(workoutSets.exerciseId, exerciseId)))
        .orderBy(asc(workoutSets.sequenceOrder));

      const sessionVolume = sessionSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
      const sessionMaxWeight = Math.max(...sessionSets.map((s) => s.weightKg));
      const sessionEstimated1Rm = Math.max(...sessionSets.map((s) => estimate1RM(s.weightKg, s.reps)));

      return {
        sessionId: sess.id,
        sessionTitle: sess.title ?? "Workout Session",
        date: sess.startTime,
        sets: sessionSets.map((s) => ({
          id: s.id,
          setNumber: s.setNumber,
          weightKg: s.weightKg,
          reps: s.reps,
          setType: s.setType,
          isPr: s.isPr,
        })),
        sessionVolume,
        sessionMaxWeight,
        sessionEstimated1Rm: Math.round(sessionEstimated1Rm * 100) / 100,
      };
    })
  );

  return {
    exerciseId,
    exerciseName: ex.name,
    targetMuscle: ex.targetMuscle,
    allTimeMaxWeight,
    allTimeMaxVolume,
    estimatedOneRm: Math.round(estimatedOneRm * 100) / 100,
    history,
  };
}
