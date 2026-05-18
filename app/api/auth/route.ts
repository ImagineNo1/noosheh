import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, updateUserPassword, type UserRecord } from '@/lib/admin-store';
import { getBearerToken, isJwtConfigured, signJwt, verifyJwt } from '@/lib/jwt';
import { hashPassword, verifyPassword } from '@/lib/password';

function publicUser(user: UserRecord) {
  return { id: user.id, name: user.name, email: user.email, role: user.role, created_date: user.created_date };
}

function issueSession(user: UserRecord) {
  return {
    token: signJwt({ sub: user.id, email: user.email, role: user.role, name: user.name || '' }),
    user: publicUser(user)
  };
}

function encodeResetToken(email: string) {
  return Buffer.from(JSON.stringify({ email, purpose: 'password-reset' })).toString('base64url');
}

function decodeResetToken(token: string) {
  try {
    const parsed = JSON.parse(Buffer.from(token, 'base64url').toString('utf8')) as { email?: string; purpose?: string };
    return parsed.purpose === 'password-reset' && parsed.email ? parsed.email.toLowerCase() : '';
  } catch {
    return '';
  }
}

export async function GET(request: Request) {
  if (!isJwtConfigured()) return NextResponse.json({ authenticated: false, error: 'JWT_SECRET is not configured' }, { status: 500 });
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ authenticated: false, user: null });
  const user = await findUserByEmail(String(payload.email));
  return NextResponse.json({ authenticated: Boolean(user), user: user ? publicUser(user) : null });
}

export async function POST(request: Request) {
  if (!isJwtConfigured()) return NextResponse.json({ error: 'JWT_SECRET is not configured' }, { status: 500 });
  const body = await request.json().catch(() => ({}));
  const mode = String(body.mode || 'login');
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  if (mode === 'reset_request') {
    const token = email ? encodeResetToken(email) : '';
    return NextResponse.json({ ok: true, reset_url: token ? `/reset-password?token=${encodeURIComponent(token)}` : '' });
  }

  if (mode === 'reset_password') {
    const resetToken = String(body.resetToken || '');
    const newPassword = String(body.newPassword || '');
    const resetEmail = decodeResetToken(resetToken);
    if (!resetEmail || newPassword.length < 6) return NextResponse.json({ error: 'Invalid reset token or password' }, { status: 400 });
    const updated = await updateUserPassword(resetEmail, hashPassword(newPassword));
    if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  }

  if (mode === 'register') {
    try {
      const user = await createUser({ name: String(body.name || ''), email, password_hash: hashPassword(password) });
      return NextResponse.json(issueSession(user), { status: 201 });
    } catch (error) {
      if (error instanceof Error && error.message === 'USER_EXISTS') {
        return NextResponse.json({ error: 'User already exists' }, { status: 409 });
      }
      throw error;
    }
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  return NextResponse.json(issueSession(user));
}
