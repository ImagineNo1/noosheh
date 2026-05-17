import { NextResponse } from 'next/server';
import { deleteEntity, resolveEntity, updateEntity } from '@/lib/admin-store';

export async function PATCH(request: Request, { params }: { params: { entity: string; id: string } }) {
  const entity = resolveEntity(params.entity);
  if (!entity) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  const payload = await request.json();
  const record = await updateEntity(entity, params.id, payload);
  if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function DELETE(_request: Request, { params }: { params: { entity: string; id: string } }) {
  const entity = resolveEntity(params.entity);
  if (!entity) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  const deleted = await deleteEntity(entity, params.id);
  if (!deleted) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
