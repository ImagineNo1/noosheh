import { NextResponse } from 'next/server';
import { updateEntity } from '@/lib/admin-store';
import { ensureAdmin } from '../../../_utils';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json().catch(() => ({}));
  const updated = await updateEntity('not_found_logs', params.id, { resolved: true, redirect_id: payload.redirectId || payload.redirect_id || '' });
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
