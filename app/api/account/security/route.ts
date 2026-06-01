import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateUserPassword } from '@/lib/admin-store';
import { hashPassword, verifyPassword } from '@/lib/password';

export async function POST(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const current = String(body.current || '');
  const newPassword = String(body.newPassword || '');
  if (newPassword.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  if (!verifyPassword(current, user.password_hash)) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
  await updateUserPassword(user.email, hashPassword(newPassword));
  return NextResponse.json({ ok: true });
}
