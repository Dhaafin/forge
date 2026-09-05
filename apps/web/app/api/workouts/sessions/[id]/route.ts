import { NextResponse } from 'next/server';
import { db, workoutSessions } from '@repo/db';
import { eq, and } from 'drizzle-orm';
import { updateSession, deleteSession } from '@/lib/workouts/session';
import { UpdateSessionSchema } from '@/lib/validations';

type Params = { params: Promise<{ id: string }> };

// PUT /api/workouts/sessions/[id]
export async function PUT(request: Request, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const { id } = await params;

    const [existing] = await db
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId)))
      .limit(1);

    if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    const body = await request.json();
    const result = UpdateSessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { title, startTime, endTime, durationMinutes, sets } = result.data;

    const session = await updateSession(
      id,
      {
        title,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        durationMinutes,
        sets,
      },
      userId
    );

    return NextResponse.json(session);
  } catch (error: any) {
    const msg = error?.message ?? 'Internal server error';
    const status = msg.startsWith('Set ID') ? 400 : 500;
    console.error('[PUT /api/workouts/sessions/[id]]', error);
    return NextResponse.json({ error: msg }, { status });
  }
}

// DELETE /api/workouts/sessions/[id]
export async function DELETE(request: Request, { params }: Params) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const { id } = await params;

    const [existing] = await db
      .select({ id: workoutSessions.id })
      .from(workoutSessions)
      .where(and(eq(workoutSessions.id, id), eq(workoutSessions.userId, userId)))
      .limit(1);

    if (!existing) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    await deleteSession(id, userId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DELETE /api/workouts/sessions/[id]]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
