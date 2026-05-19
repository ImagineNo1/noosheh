import { NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { analyze404 } from '@/lib/seo/store';

function hashIp(ip: string) {
  return createHash('sha256').update(ip).digest('hex');
}

export async function POST(request: Request) {
  const payload = await request.json().catch(() => ({}));
  const path = typeof payload.path === 'string' ? payload.path : '/';
  const referrer = typeof payload.referrer === 'string' ? payload.referrer : undefined;
  const userAgent = request.headers.get('user-agent') || undefined;
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  await analyze404(path, referrer, userAgent);
  const ipHash = ip ? hashIp(ip) : undefined;
  return NextResponse.json({ ok: true, ipHash: ipHash ? `${ipHash.slice(0, 8)}...` : undefined });
}
