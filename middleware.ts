import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const EXCLUDED = ['/api', '/_next', '/favicon.ico', '/robots.txt', '/sitemap.xml'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (EXCLUDED.some((prefix) => pathname.startsWith(prefix))) return NextResponse.next();

  const url = new URL('/api/seo/resolve', request.url);
  url.searchParams.set('path', pathname.toLowerCase());

  try {
    const response = await fetch(url.toString());
    if (!response.ok) return NextResponse.next();
    const data = await response.json() as { found?: boolean; toPath?: string; statusCode?: number };
    if (!data.found) return NextResponse.next();
    if (data.statusCode === 410) return new NextResponse('Gone', { status: 410 });
    if (!data.toPath) return NextResponse.next();
    const destination = new URL(data.toPath, request.url);
    return NextResponse.redirect(destination, data.statusCode || 301);
  } catch {
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!.*\\..*).*)']
};
