import { NextResponse } from 'next/server';
import { db } from '@repo/db';
import { workoutSessions } from '@repo/db';
import { eq, and, ilike, gte, lte, asc, desc } from 'drizzle-orm';
import { createSession } from '@/lib/workouts/session';
import { getSessionById } from '@/lib/workouts/session';

// GET /api/workouts/sessions
// Query params: search, startDate, endDate, timeWindow(7d|30d|90d|ytd), sortBy, order, limit, offset
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const timeWindow = searchParams.get('timeWindow');
    const sortBy = searchParams.get('sortBy') ?? 'start_time';
    const order = searchParams.get('order') ?? 'desc';
    const limit = Math.min(Number(searchParams.get('limit') ?? 20), 100);
    const offset = Number(searchParams.get('offset') ?? 0);

    let query = db
      .select()
      .from(workoutSessions)
      .where(eq(workoutSessions.userId, userId))
      .$dynamic();

    if (search) {
      query = query.where(
        and(eq(workoutSessions.userId, userId), ilike(workoutSessions.title, `%${search}%`))
      );
    }

    if (startDate) {
      query = query.where(
        and(eq(workoutSessions.userId, userId), gte(workoutSessions.startTime, new Date(startDate)))
      );
    }
    if (endDate) {
      query = query.where(
        and(eq(workoutSessions.userId, userId), lte(workoutSessions.startTime, new Date(endDate)))
      );
    }

    if (timeWindow && !startDate && !endDate) {
      const now = new Date();
      const windows: Record<string, Date> = {
        '7d': new Date(now.getTime() - 7 * 86400000),
        '30d': new Date(now.getTime() - 30 * 86400000),
        '90d': new Date(now.getTime() - 90 * 86400000),
        ytd: new Date(now.getFullYear(), 0, 1),
      };
      if (windows[timeWindow]) {
        query = query.where(
          and(eq(workoutSessions.userId, userId), gte(workoutSessions.startTime, windows[timeWindow]))
        );
      }
    }

    const sortCol =
      sortBy === 'duration_minutes' ? workoutSessions.durationMinutes
      : sortBy === 'title' ? workoutSessions.title
      : workoutSessions.startTime;

    query = query
      .orderBy(order === 'asc' ? asc(sortCol) : desc(sortCol))
      .limit(limit)
      .offset(offset);

    const sessions = await query;
    return NextResponse.json(sessions);
  } catch (error) {
    console.error('[GET /api/workouts/sessions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/workouts/sessions
export async function POST(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const body = await request.json();

    if (!Array.isArray(body.sets) || body.sets.length === 0) {
      return NextResponse.json({ error: 'sets array is required and must not be empty' }, { status: 400 });
    }

    const session = await createSession(
      {
        title: body.title,
        startTime: body.startTime ? new Date(body.startTime) : undefined,
        endTime: body.endTime ? new Date(body.endTime) : undefined,
        durationMinutes: body.durationMinutes,
        sets: body.sets,
      },
      userId
    );

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('[POST /api/workouts/sessions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
