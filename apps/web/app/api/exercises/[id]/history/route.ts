import { NextResponse } from 'next/server';
import { getExerciseHistory } from '@/lib/exercises/query';
import { getUserIdFromRequest } from '@/lib/auth';

type Params = { params: Promise<{ id: string }> };

// GET /api/exercises/[id]/history?limit=15&offset=0
export async function GET(request: Request, { params }: Params) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized: Bearer token or x-user-id header is required' }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get('limit') ?? 15), 50);
    const offset = Number(searchParams.get('offset') ?? 0);

    const history = await getExerciseHistory(id, userId, { limit, offset });
    if (!history) return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });

    return NextResponse.json(history);
  } catch (error) {
    console.error('[GET /api/exercises/[id]/history]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
