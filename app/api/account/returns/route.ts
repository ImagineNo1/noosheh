import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateEntity } from '@/lib/admin-store';

export async function GET(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json((user as any).returns || []);
}

export async function POST(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const body = await request.json().catch(() => ({}));
  const orderId = String(body.order_id || '');
  const item = {
    id: randomUUID(),
    user_email: String(payload.email),
    order_id: orderId,
    order_number: String(body.order_number || orderId.slice(-8).toUpperCase()),
    product_name: String(body.product_name || ''),
    reason: String(body.reason || ''),
    description: String(body.description || ''),
    status: 'submitted',
    created_date: new Date().toISOString()
  };
  const current = (user as any).returns || [];
  await updateEntity('users', user.id, { ...(user as any), returns: [item, ...current] });
  return NextResponse.json(item, { status: 201 });
}
