import { NextResponse } from 'next/server';
import { getBearerToken, verifyJwt } from '@/lib/jwt';
import { listEntity } from '@/lib/admin-store';

export async function GET(request: Request) {
  const payload = verifyJwt(getBearerToken(request));
  if (!payload?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const orders = await listEntity('orders', '-created_date', '100');
  const email = String(payload.email);
  return NextResponse.json(orders.filter((o) => o.customer_email === email || o.user_email === email));
}
