import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateEntity } from '@/lib/admin-store';

function normalizeAddress(body: any) {
  const address = String(body.address || body.text || '');
  return {
    id: body.id || randomUUID(),
    label: String(body.label || 'آدرس'),
    text: String(body.text || address),
    full_name: String(body.full_name || ''),
    phone: String(body.phone || ''),
    province: String(body.province || ''),
    city: String(body.city || ''),
    address,
    postal_code: String(body.postal_code || ''),
    unit: String(body.unit || ''),
    notes: String(body.notes || ''),
    is_default: Boolean(body.is_default)
  };
}

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
  const current = (user as any).addresses || [];
  const item = normalizeAddress({ ...body, is_default: body.is_default || current.length === 0 });
  const next = item.is_default ? current.map((address: any) => ({ ...address, is_default: false })) : current;
  await updateEntity('users', user.id, { ...(user as any), addresses: [item, ...next] });
  return NextResponse.json(item, { status: 201 });
}
