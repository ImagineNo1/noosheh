import { NextResponse } from 'next/server';
import { deleteEntity, updateEntity } from '@/lib/admin-store';
import { ensureAdmin, sanitizePath } from '../../_utils';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json();
  const next: Record<string, any> = { ...payload };
  if (payload.fromPath || payload.from_path) next.from_path = sanitizePath(payload.fromPath || payload.from_path);
  if (payload.toPath || payload.to_path) next.to_path = sanitizePath(payload.toPath || payload.to_path);
  const updated = await updateEntity('redirects', params.id, next);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const ok = await deleteEntity('redirects', params.id);
  return NextResponse.json({ ok });
}
