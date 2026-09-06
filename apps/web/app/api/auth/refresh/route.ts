import { NextResponse } from 'next/server';
import { db, users } from '@repo/db';
import { eq } from 'drizzle-orm';
import { verifyToken, signToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const authHeader = request.headers.get('authorization');
    
    // Accept token from body (refreshToken or token) or Authorization header
    let tokenToVerify = body.refreshToken || body.token;
    if (!tokenToVerify && authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      tokenToVerify = authHeader.substring(7).trim();
    }

    if (!tokenToVerify) {
      return NextResponse.json({ error: 'Refresh token is required' }, { status: 400 });
    }

    const payload = await verifyToken(tokenToVerify);
    if (!payload?.userId) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    const [existingUser] = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Issue a fresh access token
    const newToken = await signToken({
      userId: existingUser.id,
      username: existingUser.username,
    });

    return NextResponse.json({
      message: 'Token refreshed successfully',
      token: newToken,
      user: {
        id: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
