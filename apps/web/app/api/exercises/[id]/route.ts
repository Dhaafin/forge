import { NextResponse } from 'next/server';
import { db, exercises } from '@repo/db';
import { workoutSets } from '@repo/db';
import { eq } from 'drizzle-orm';

type Params = { params: Promise<{ id: string }> };

// PUT /api/exercises/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, targetMuscle } = body;

    if (!name || !targetMuscle) {
      return NextResponse.json({ error: 'name and targetMuscle are required' }, { status: 400 });
    }

    const [existing] = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });

    const [updated] = await db
      .update(exercises)
      .set({ name: String(name).trim(), targetMuscle: String(targetMuscle).trim() })
      .where(eq(exercises.id, id))
      .returning();

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/exercises/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/exercises/[id]
export async function DELETE(_: Request, { params }: Params) {
  try {
    const { id } = await params;

    const [existing] = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });

    // Integrity protection: exercise linked to historical sets cannot be deleted
    const [linked] = await db
      .select({ id: workoutSets.id })
      .from(workoutSets)
      .where(eq(workoutSets.exerciseId, id))
      .limit(1);

    if (linked) {
      return NextResponse.json(
        { error: 'Cannot delete: this exercise is linked to existing workout sets. Remove those sets first.' },
        { status: 400 }
      );
    }

    await db.delete(exercises).where(eq(exercises.id, id));
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/exercises/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
