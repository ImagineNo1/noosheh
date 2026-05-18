import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateEntity } from '@/lib/admin-store';

export async function GET(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ name: user.name || '', email: user.email, created_date: user.created_date });
}

export async function PUT(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const updated = await updateEntity('users', user.id, { ...user, name: String(body.name || user.name || '') });
  return NextResponse.json({ name: updated?.name || '', email: updated?.email || user.email, created_date: updated?.created_date || user.created_date });
}
