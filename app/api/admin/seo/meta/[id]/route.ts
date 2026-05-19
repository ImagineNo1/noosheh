import { NextResponse } from 'next/server';
import { deleteEntity, listEntity, updateEntity } from '@/lib/admin-store';
import { ensureAdmin } from '../../_utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const all = await listEntity('seo_meta', '-updated_date');
  const record = all.find((x) => x.id === params.id);
  if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json();
  if (payload.custom_schema) {
    try { JSON.parse(payload.custom_schema); } catch { return NextResponse.json({ error: 'Invalid custom_schema JSON-LD' }, { status: 400 }); }
  }
  const updated = await updateEntity('seo_meta', params.id, payload);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const ok = await deleteEntity('seo_meta', params.id);
  return NextResponse.json({ ok });
}
