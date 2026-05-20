export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { listEntity } from '@/lib/admin-store';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const category = searchParams.get('category') || '';
  const posts = await listEntity('blog_posts', '-created_date');
  const filtered = posts.filter((p: any) => p.status === 'published' && !p.deleted_at).filter((p: any) => {
    const matchesQ = !q || p.title?.includes(q) || p.excerpt?.includes(q);
    const matchesCat = !category || p.category === category;
    return matchesQ && matchesCat;
  });
  return NextResponse.json(filtered);
}
