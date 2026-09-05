import { NextResponse } from 'next/server';
import { db, users } from '@repo/db';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // In a real app, hash password and compare, generate JWT/Session
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Login successful (simulated)',
      user: {
        id: user[0].id,
        email: user[0].email,
        name: user[0].name,
      },
      token: 'simulated_jwt_token_for_expo'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
