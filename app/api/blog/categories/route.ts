export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { listEntity } from '@/lib/admin-store';

export async function GET() {
  try {
    const categories = await listEntity('blog_categories', '-created_date');
    return NextResponse.json(categories);
  } catch {
    return NextResponse.json([]);
  }
}
