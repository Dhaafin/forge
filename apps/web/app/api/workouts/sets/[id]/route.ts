import { NextResponse } from 'next/server';
import { updateSet, deleteSet } from '@/lib/workouts/set';
import { UpdateWorkoutSetSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

// PUT /api/workouts/sets/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const result = UpdateWorkoutSetSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { weightKg, reps, setType } = result.data;

    const updated = await updateSet(id, { weightKg, reps, setType }, userId);
    if (!updated) return NextResponse.json({ error: 'Set not found or unauthorized' }, { status: 404 });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('[PUT /api/workouts/sets/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/workouts/sets/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const { id } = await params;
    const deleted = await deleteSet(id, userId);

    if (!deleted) return NextResponse.json({ error: 'Set not found or unauthorized' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/workouts/sets/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
