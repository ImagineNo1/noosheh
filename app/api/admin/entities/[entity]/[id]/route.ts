import { NextResponse } from 'next/server';
import { deleteEntity, resolveEntity, updateEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';

function requireAdmin(request: Request) {
  return !isJwtConfigured() || isAdminRequest(request);
}

function canUpdatePublicly(entityName: string, payload: Record<string, unknown>) {
  if (entityName !== 'BlogPost') return false;
  const keys = Object.keys(payload);
  return keys.length > 0 && keys.every((key) => key === 'views_count');
}

export async function PATCH(request: Request, { params }: { params: { entity: string; id: string } }) {
  const entity = resolveEntity(params.entity);
  if (!entity) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  const payload = await request.json();
  if (!requireAdmin(request) && !canUpdatePublicly(params.entity, payload)) return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  const record = await updateEntity(entity, params.id, payload);
  if (!record) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  return NextResponse.json(record);
}

export async function DELETE(request: Request, { params }: { params: { entity: string; id: string } }) {
  if (!requireAdmin(request)) return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  const entity = resolveEntity(params.entity);
  if (!entity) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  const deleted = await deleteEntity(entity, params.id);
  if (!deleted) return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}
