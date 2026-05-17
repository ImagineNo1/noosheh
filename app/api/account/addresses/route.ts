import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateEntity } from '@/lib/admin-store';

export async function GET(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json((user as any).addresses || []);
}

export async function POST(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const item = { id: randomUUID(), label: String(body.label || 'آدرس'), text: String(body.text || ''), city: String(body.city || ''), province: String(body.province || ''), postal_code: String(body.postal_code || '') };
  const current = (user as any).addresses || [];
  await updateEntity('users', user.id, { ...(user as any), addresses: [item, ...current] });
  return NextResponse.json(item, { status: 201 });
}
