import { NextResponse } from 'next/server';
import { getBearerToken, isJwtConfigured, signJwt, verifyJwt } from '@/lib/jwt';

export async function GET(request: Request) {
  if (!isJwtConfigured()) return NextResponse.json({ authenticated: true, configured: false });
  const payload = verifyJwt(getBearerToken(request));
  return NextResponse.json({ authenticated: payload?.role === 'admin', configured: true });
}

export async function POST(request: Request) {
  if (!isJwtConfigured()) {
    return NextResponse.json({ token: '', configured: false });
  }

  const { secret } = await request.json().catch(() => ({ secret: '' }));
  if (!secret || secret !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Invalid admin secret' }, { status: 401 });
  }

  return NextResponse.json({ token: signJwt({ role: 'admin' }), configured: true });
}
