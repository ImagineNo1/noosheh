import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { analyzeSeoContent } from '@/lib/seo/analyzer';

export async function POST(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  return NextResponse.json(analyzeSeoContent(payload ?? {}));
}
