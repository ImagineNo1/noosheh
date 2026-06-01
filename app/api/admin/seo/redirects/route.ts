import { NextResponse } from 'next/server';
import { createEntity, listEntity } from '@/lib/admin-store';
import { ensureAdmin, sanitizePath } from '../_utils';

export async function GET(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const all = await listEntity('redirects', '-created_date');
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json();
  const fromPath = sanitizePath(payload.fromPath || payload.from_path || '');
  const toPath = sanitizePath(payload.toPath || payload.to_path || '/');
  const statusCode = Number(payload.statusCode || payload.status_code || 301);
  if (fromPath === toPath) return NextResponse.json({ error: 'Redirect loop detected' }, { status: 400 });
  if (![301, 302, 307, 308, 410].includes(statusCode)) return NextResponse.json({ error: 'Invalid statusCode' }, { status: 400 });
  const all = await listEntity('redirects', '-created_date');
  if (all.some((r) => r.from_path === fromPath)) return NextResponse.json({ error: 'fromPath must be unique' }, { status: 409 });
  if (all.some((r) => r.from_path === toPath)) return NextResponse.json({ error: 'Redirect chain detected' }, { status: 400 });
  const created = await createEntity('redirects', { ...payload, from_path: fromPath, to_path: toPath, status_code: statusCode, is_active: payload.is_active !== false, hit_count: 0 });
  return NextResponse.json(created, { status: 201 });
}
