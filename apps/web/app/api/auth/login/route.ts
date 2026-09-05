import { NextResponse } from 'next/server';
import { db, users } from '@repo/db';
import { eq } from 'drizzle-orm';
import { LoginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = LoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Username and password are required', details: result.error.format() }, { status: 400 });
    }

    const { username } = result.data;
    const normalizedUsername = username.toLowerCase();
    const [existingUser] = await db.select().from(users).where(eq(users.username, normalizedUsername)).limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Login successful (simulated)',
      user: {
        id: existingUser.id,
        username: existingUser.username,
        name: existingUser.name,
      },
      token: 'simulated_jwt_token_for_expo'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
