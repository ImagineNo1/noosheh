import { NextResponse } from 'next/server';
import { checkMongoHealth, ensureDefaultAdminUser, findUserByEmail, type UserRecord } from '@/lib/admin-store';
import { getBearerToken, isJwtConfigured, signJwt, verifyJwt } from '@/lib/jwt';
import { verifyPassword } from '@/lib/password';

function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function GET(request: Request) {
  const mongo = await checkMongoHealth();
  if (!mongo.ok) {
    return NextResponse.json({ authenticated: false, configured: isJwtConfigured(), db_connected: false, db_error: mongo.error }, { status: 503 });
  }

  if (!isJwtConfigured()) return NextResponse.json({ authenticated: false, configured: false, db_connected: true });
  await ensureDefaultAdminUser();
  const payload = verifyJwt(getBearerToken(request));
  if (payload?.role !== 'admin' || !payload.email) return NextResponse.json({ authenticated: false, configured: true, db_connected: true });
  const user = await findUserByEmail(String(payload.email));
  return NextResponse.json({ authenticated: user?.role === 'admin', configured: true, db_connected: true, user: user?.role === 'admin' ? publicUser(user) : null });
}

export async function POST(request: Request) {
  if (!isJwtConfigured()) {
    return NextResponse.json({ error: 'JWT_SECRET is not configured' }, { status: 500 });
  }

  await ensureDefaultAdminUser();
  const { email, username, password } = await request.json().catch(() => ({ email: '', username: '', password: '' }));
  const identifier = String(email || username || '').trim();
  const user = await findUserByEmail(identifier);
  if (!user || user.role !== 'admin' || !verifyPassword(String(password || ''), user.password_hash)) {
    return NextResponse.json({ error: 'Invalid admin credentials' }, { status: 401 });
  }

  return NextResponse.json({
    token: signJwt({ sub: user.id, email: user.email, role: user.role, name: user.name || '' }),
    user: publicUser(user)
  });
}
