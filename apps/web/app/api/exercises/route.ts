import { NextResponse } from 'next/server';
import { db, exercises } from '@repo/db';
import { eq } from 'drizzle-orm';
import { getAllExercises } from '@/lib/exercises/query';

// GET /api/exercises?search=&sortBy=name&order=asc&limit=20&offset=0
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const params = {
      search: searchParams.get('search') ?? undefined,
      sortBy: (searchParams.get('sortBy') ?? 'name') as 'name' | 'target_muscle',
      order: (searchParams.get('order') ?? 'asc') as 'asc' | 'desc',
      limit: Math.min(Number(searchParams.get('limit') ?? 20), 100),
      offset: Number(searchParams.get('offset') ?? 0),
    };

    const data = await getAllExercises(params);
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GET /api/exercises]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/exercises
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, targetMuscle } = body;

    if (!name || !targetMuscle) {
      return NextResponse.json({ error: 'name and targetMuscle are required' }, { status: 400 });
    }

    const [existing] = await db.select().from(exercises).where(eq(exercises.name, name)).limit(1);
    if (existing) {
      return NextResponse.json({ error: 'An exercise with this name already exists' }, { status: 400 });
    }

    const [created] = await db
      .insert(exercises)
      .values({ name: String(name).trim(), targetMuscle: String(targetMuscle).trim() })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('[POST /api/exercises]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
