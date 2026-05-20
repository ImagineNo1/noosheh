import { createEntity, listEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return Response.json({ error: 'Admin authentication required' }, { status: 401 });
  const posts = await listEntity('blog_posts', '-created_date');
  const src = posts.find((p: any) => p.id === params.id);
  if (!src) return Response.json({ error: 'Record not found' }, { status: 404 });
  const copy = await createEntity('blog_posts', { ...src, id: undefined, title: `${src.title} (Copy)`, slug: `${src.slug}-copy-${Date.now()}`, status: 'draft' });
  return Response.json(copy, { status: 201 });
}
