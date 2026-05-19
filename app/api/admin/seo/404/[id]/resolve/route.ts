import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { resolveNotFound } from '@/lib/seo/store';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json().catch(() => ({}));
  return NextResponse.json(await resolveNotFound(params.id, payload?.redirectId));
}
