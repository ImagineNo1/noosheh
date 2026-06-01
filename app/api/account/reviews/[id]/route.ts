import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { deleteEntity, listEntity } from '@/lib/admin-store';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const reviews = await listEntity('reviews', '-created_date', '200');
  const review = reviews.find((item) => item.id === params.id);
  if (!review || review.user_email !== String(payload.email)) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
  if (review.status !== 'pending') return NextResponse.json({ error: 'Only pending reviews can be deleted' }, { status: 400 });
  await deleteEntity('reviews', params.id);
  return NextResponse.json({ ok: true });
}
