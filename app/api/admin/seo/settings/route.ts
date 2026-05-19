import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { validateSeoSettings } from '@/lib/seo/schemas';
import { getSeoSettings, upsertSeoSettings } from '@/lib/seo/store';

export async function GET(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await getSeoSettings());
}

export async function PATCH(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = validateSeoSettings(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await upsertSeoSettings(parsed.data));
}
