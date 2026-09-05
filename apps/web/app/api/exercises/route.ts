import { NextResponse } from 'next/server';
import { db, exercises } from '@repo/db';
import { ilike } from 'drizzle-orm';
import { getAllExercises } from '@/lib/exercises/query';
import { ExerciseQuerySchema, CreateExerciseSchema } from '@/lib/validations';

// GET /api/exercises?search=&sortBy=name&order=asc&limit=20&offset=0
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = ExerciseQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { data, total } = await getAllExercises(parsed.data);
    const { limit, offset } = parsed.data;

    return NextResponse.json({
      data,
      meta: {
        total,
        limit,
        offset,
        hasMore: offset + data.length < total,
      },
    });
  } catch (error) {
    console.error('[GET /api/exercises]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/exercises
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = CreateExerciseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { name, targetMuscle } = result.data;

    // Case-insensitive check
    const [existing] = await db.select().from(exercises).where(ilike(exercises.name, name)).limit(1);
    if (existing) {
      return NextResponse.json({ error: 'An exercise with this name already exists' }, { status: 400 });
    }

    const [created] = await db
      .insert(exercises)
      .values({ name, targetMuscle })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/exercises]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
