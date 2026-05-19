import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { validateSeoMeta } from '@/lib/seo/schemas';
import { createSeoMeta, listSeoMeta } from '@/lib/seo/store';

export async function GET(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await listSeoMeta());
}

export async function POST(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = validateSeoMeta(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await createSeoMeta(parsed.data), { status: 201 });
}
