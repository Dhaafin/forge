import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { workoutSessions } from '@repo/db';
import { eq, and } from 'drizzle-orm';
import { updateSession, deleteSession, getSessionById } from '@/lib/workouts/session';

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
    const session = await updateSession(
      id,
      {
        title: body.title,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        durationMinutes: body.durationMinutes,
        sets: body.sets,
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
