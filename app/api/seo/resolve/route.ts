import { NextResponse } from 'next/server';
import { listRedirects } from '@/lib/seo/store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const path = (searchParams.get('path') || '/').toLowerCase();
  const redirects = await listRedirects().catch(() => [] as any[]);
  const found = (redirects as any[]).find((r) => r.isActive !== false && String(r.fromPath || '').toLowerCase() === path);
  if (!found) return NextResponse.json({ found: false });
  return NextResponse.json({
    found: true,
    toPath: found.toPath,
    statusCode: found.statusCode,
    id: found.id
  });
}
