import { NextResponse } from 'next/server';
import { db, exercises, workoutSets } from '@repo/db';
import { eq, and, ne, ilike } from 'drizzle-orm';
import { UpdateExerciseSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

// PUT /api/exercises/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const result = UpdateExerciseSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { name, targetMuscle } = result.data;

    const [existing] = await db.select().from(exercises).where(eq(exercises.id, id)).limit(1);
    if (!existing) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });

    // Collision check: prevent updating to a name that another exercise already uses
    const [nameConflict] = await db
      .select({ id: exercises.id })
      .from(exercises)
      .where(and(ilike(exercises.name, name), ne(exercises.id, id)))
      .limit(1);

    if (nameConflict) {
      return NextResponse.json({ error: 'Another exercise with this name already exists' }, { status: 400 });
    }

    const [updated] = await db
      .update(exercises)
      .set({ name, targetMuscle })
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
