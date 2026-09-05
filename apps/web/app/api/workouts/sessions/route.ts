import { NextResponse } from 'next/server';
import { db, workoutSessions } from '@repo/db';
import { eq, and, ilike, gte, lte, asc, desc, count, SQL } from 'drizzle-orm';
import { createSession } from '@/lib/workouts/session';
import { SessionQuerySchema, CreateSessionSchema } from '@/lib/validations';

// GET /api/workouts/sessions
export async function GET(request: Request) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) return NextResponse.json({ error: 'x-user-id header is required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const rawParams = Object.fromEntries(searchParams.entries());
    const parsed = SessionQuerySchema.safeParse(rawParams);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: parsed.error.format() }, { status: 400 });
    }

    const { search, startDate, endDate, timeWindow, sortBy, order, limit, offset } = parsed.data;

    // Collect all filter conditions in a single SQL[] array to prevent Drizzle .where() overwrite bug
    const filters: SQL[] = [eq(workoutSessions.userId, userId)];

    if (search) {
      filters.push(ilike(workoutSessions.title, `%${search}%`));
    }

    if (startDate) {
      filters.push(gte(workoutSessions.startTime, new Date(startDate)));
    }
    if (endDate) {
      filters.push(lte(workoutSessions.startTime, new Date(endDate)));
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
        filters.push(gte(workoutSessions.startTime, windows[timeWindow]));
      }
    }

    const sortCol =
      sortBy === 'duration_minutes' ? workoutSessions.durationMinutes
      : sortBy === 'title' ? workoutSessions.title
      : workoutSessions.startTime;

    const combinedWhere = and(...filters);

    const [countResult] = await db
      .select({ total: count() })
      .from(workoutSessions)
      .where(combinedWhere);

    const sessions = await db
      .select()
      .from(workoutSessions)
      .where(combinedWhere)
      .orderBy(order === 'asc' ? asc(sortCol) : desc(sortCol))
      .limit(limit)
      .offset(offset);

    const totalNum = Number(countResult?.total ?? 0);

    return NextResponse.json({
      data: sessions,
      meta: {
        total: totalNum,
        limit,
        offset,
        hasMore: offset + sessions.length < totalNum,
      },
    });
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
    const result = CreateSessionSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'Validation failed', details: result.error.format() }, { status: 400 });
    }

    const { title, startTime, endTime, durationMinutes, sets } = result.data;

    const session = await createSession(
      {
        title,
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined,
        durationMinutes,
        sets,
      },
      userId
    );

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('[POST /api/workouts/sessions]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
