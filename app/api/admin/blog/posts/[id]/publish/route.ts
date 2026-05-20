import { updateEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return Response.json({ error: 'Admin authentication required' }, { status: 401 });
  const record = await updateEntity('blog_posts', params.id, { status: 'published', publish_at: new Date().toISOString() });
  if (!record) return Response.json({ error: 'Record not found' }, { status: 404 });
  return Response.json(record);
}
