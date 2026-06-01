import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { findUserByEmail, updateEntity } from '@/lib/admin-store';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const user = await findUserByEmail(String(payload.email));
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const current = ((user as any).wishlist || []) as any[];
  const next = current.filter((item) => item.id !== params.id);
  if (next.length === current.length) return NextResponse.json({ error: 'Wishlist item not found' }, { status: 404 });
  await updateEntity('users', user.id, { ...(user as any), wishlist: next });
  return NextResponse.json({ ok: true });
}
