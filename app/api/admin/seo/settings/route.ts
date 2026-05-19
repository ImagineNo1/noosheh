import { NextResponse } from 'next/server';
import { createEntity, listEntity, updateEntity } from '@/lib/admin-store';
import { ensureAdmin } from '../_utils';

export async function GET(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const all = await listEntity('seo_settings', '-updated_date');
  return NextResponse.json(all[0] || null);
}

export async function PATCH(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json();
  const all = await listEntity('seo_settings', '-updated_date');
  const existing = all[0];
  const next = existing ? await updateEntity('seo_settings', existing.id, payload) : await createEntity('seo_settings', payload);
  return NextResponse.json(next);
}
