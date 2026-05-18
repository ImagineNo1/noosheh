import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateEntity } from '@/lib/admin-store';

async function getUser(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return null;
  return findUserByEmail(String(payload.email));
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const current = ((user as any).addresses || []) as any[];
  let updated: any = null;
  let next = current.map((address) => {
    if (address.id !== params.id) return body.is_default ? { ...address, is_default: false } : address;
    updated = { ...address, ...body, text: body.text ?? body.address ?? address.text, address: body.address ?? address.address, is_default: body.is_default ?? address.is_default };
    return updated;
  });
  if (!updated) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  if (!next.some((address) => address.is_default) && next[0]) next = next.map((address, index) => ({ ...address, is_default: index === 0 }));
  await updateEntity('users', user.id, { ...(user as any), addresses: next });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const user = await getUser(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const current = ((user as any).addresses || []) as any[];
  const next = current.filter((address) => address.id !== params.id);
  if (next.length === current.length) return NextResponse.json({ error: 'Address not found' }, { status: 404 });
  if (!next.some((address) => address.is_default) && next[0]) next[0] = { ...next[0], is_default: true };
  await updateEntity('users', user.id, { ...(user as any), addresses: next });
  return NextResponse.json({ ok: true });
}
