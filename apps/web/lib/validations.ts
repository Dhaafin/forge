import { z } from 'zod';

// ── Auth Schemas ─────────────────────────────────────────────────────────────

export const LoginSchema = z.object({
  username: z.string().min(1, 'Username is required').trim(),
  password: z.string().min(1, 'Password is required'),
});

// ── Exercise Schemas ─────────────────────────────────────────────────────────

export const ExerciseQuerySchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['name', 'target_muscle']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CreateExerciseSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100).trim(),
  targetMuscle: z.string().min(1, 'Target muscle is required').max(100).trim(),
});

export const UpdateExerciseSchema = CreateExerciseSchema;

// ── Workout Set Schemas ──────────────────────────────────────────────────────

export const WorkoutSetInputSchema = z.object({
  id: z.string().optional(),
  exerciseId: z.string().min(1, 'exerciseId is required'),
  setNumber: z.number().int().positive('setNumber must be a positive integer'),
  weightKg: z.number().min(0, 'weightKg must be greater than or equal to 0'),
  reps: z.number().int().positive('reps must be a positive integer'),
  setType: z.string().default('normal'),
  sequenceOrder: z.number().int().min(0).default(0),
});

export const UpdateWorkoutSetSchema = z.object({
  weightKg: z.number().min(0, 'weightKg must be greater than or equal to 0').optional(),
  reps: z.number().int().positive('reps must be a positive integer').optional(),
  setType: z.string().optional(),
});

// ── Workout Session Schemas ──────────────────────────────────────────────────

export const SessionQuerySchema = z.object({
  search: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  timeWindow: z.enum(['7d', '30d', '90d', 'ytd']).optional(),
  sortBy: z.enum(['start_time', 'duration_minutes', 'title']).default('start_time'),
  order: z.enum(['asc', 'desc']).default('desc'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const CreateSessionSchema = z.object({
  title: z.string().max(200).optional(),
  startTime: z.string().datetime({ offset: true }).optional().or(z.string()),
  endTime: z.string().datetime({ offset: true }).optional().or(z.string()),
  durationMinutes: z.number().int().min(0).optional(),
  sets: z.array(WorkoutSetInputSchema).min(1, 'sets must contain at least 1 set'),
});

export const UpdateSessionSchema = z.object({
  title: z.string().max(200).optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  durationMinutes: z.number().int().min(0).optional(),
  sets: z.array(WorkoutSetInputSchema).optional(),
});
