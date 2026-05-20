export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { listEntity } from '@/lib/admin-store';

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const posts = await listEntity('blog_posts', '-created_date');
  const post = posts.find((p: any) => p.slug === params.slug && p.status === 'published' && !p.deleted_at);
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(post);
}
