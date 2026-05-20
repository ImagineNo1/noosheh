import { deleteEntity, updateEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { sanitizeHtml, slugify } from '../../_lib/validators';

function unauthorized() { return Response.json({ error: 'Admin authentication required' }, { status: 401 }); }

export async function GET() { return Response.json({ error: 'Not implemented: use list with filters' }, { status: 501 }); }

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return unauthorized();
  const body = await request.json();
  const record = await updateEntity('blog_posts', params.id, {
    ...body,
    ...(body.slug ? { slug: slugify(body.slug) } : {}),
    ...(body.content ? { content: sanitizeHtml(body.content) } : {})
  });
  if (!record) return Response.json({ error: 'Record not found' }, { status: 404 });
  return Response.json(record);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return unauthorized();
  const hard = new URL(request.url).searchParams.get('hard') === '1';
  if (hard) {
    const deleted = await deleteEntity('blog_posts', params.id);
    return Response.json({ ok: deleted });
  }
  const record = await updateEntity('blog_posts', params.id, { deleted_at: new Date().toISOString(), status: 'archived' });
  if (!record) return Response.json({ error: 'Record not found' }, { status: 404 });
  return Response.json({ ok: true, softDeleted: true });
}
