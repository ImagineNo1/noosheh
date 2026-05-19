import { NextResponse } from 'next/server';
import { analyzeSeoContent } from '@/lib/seo/seoHelpers';
import { ensureAdmin } from '../_utils';

export async function POST(request: Request) {
  const denied = ensureAdmin(request); if (denied) return denied;
  const payload = await request.json();
  const result = analyzeSeoContent({ entity: payload.entity || {}, seoMeta: payload.seoMeta || {}, entityType: payload.entityType || 'page' });
  return NextResponse.json(result);
}
