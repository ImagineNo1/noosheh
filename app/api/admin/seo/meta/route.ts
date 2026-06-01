import { NextResponse } from 'next/server';
import { createEntity, listEntity } from '@/lib/admin-store';
import { ensureAdmin } from '../_utils';

export async function GET(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const all = await listEntity('seo_meta', '-updated_date');
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json();
  if (!payload.entity_type || !payload.entity_id) return NextResponse.json({ error: 'entity_type and entity_id are required' }, { status: 400 });
  if (typeof payload.custom_schema === 'string' && payload.custom_schema.length > 50000) return NextResponse.json({ error: 'custom_schema too large' }, { status: 400 });
  if (payload.custom_schema) {
    try { JSON.parse(payload.custom_schema); } catch { return NextResponse.json({ error: 'Invalid custom_schema JSON-LD' }, { status: 400 }); }
  }
  const created = await createEntity('seo_meta', payload);
  return NextResponse.json(created, { status: 201 });
}
