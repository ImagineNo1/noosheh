import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { deleteSeoMeta, getSeoMetaById, updateSeoMeta } from '@/lib/seo/store';
import { validateSeoMeta } from '@/lib/seo/schemas';

function unauthorized(request: Request) {
  return isJwtConfigured() && !isAdminRequest(request);
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (unauthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const record = await getSeoMetaById(params.id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (unauthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = validateSeoMeta({ ...payload, entityType: payload.entityType || 'Page', entityId: payload.entityId || params.id });
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await updateSeoMeta(params.id, payload));
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (unauthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: await deleteSeoMeta(params.id) });
}
