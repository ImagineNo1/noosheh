import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { listEntity } from '@/lib/admin-store';

export async function GET(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const email = String(payload.email);
  const reviews = await listEntity('reviews', '-created_date', '200');
  return NextResponse.json(reviews.filter((review) => review.user_email === email));
}
