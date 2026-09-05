import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'forge_jwt_super_secret_key_32_characters_long_min'
);

export type TokenPayload = {
  userId: string;
  username: string;
};

/** Sign a JWT token valid for 30 days */
export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(JWT_SECRET_KEY);
}

/** Verify a JWT token and return decoded payload */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    if (typeof payload.userId === 'string' && typeof payload.username === 'string') {
      return { userId: payload.userId, username: payload.username };
    }
    return null;
  } catch {
    return null;
  }
}

/** Extract authenticated userId from Authorization Bearer token or x-user-id header fallback */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    const token = authHeader.substring(7).trim();
    const payload = await verifyToken(token);
    if (payload?.userId) return payload.userId;
  }

  // Fallback for development & direct header testing
  const xUserId = request.headers.get('x-user-id');
  if (xUserId) return xUserId;

  return null;
}
