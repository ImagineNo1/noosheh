import { NextResponse } from 'next/server';
import { listEntity } from '@/lib/admin-store';
import { ensureAdmin } from '../_utils';

export async function GET(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const { searchParams } = new URL(request.url);
  const minHits = Number(searchParams.get('minHits') || 0);
  const resolved = searchParams.get('resolved');
  let all = await listEntity('not_found_logs', '-last_seen_at');
  if (Number.isFinite(minHits) && minHits > 0) all = all.filter((x) => Number(x.hit_count || 0) >= minHits);
  if (resolved === 'true') all = all.filter((x) => x.resolved === true);
  if (resolved === 'false') all = all.filter((x) => x.resolved !== true);
  return NextResponse.json(all);
}
