import { createEntity, listEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { badRequest, requireString, sanitizeHtml, slugify } from '../_lib/validators';

function unauthorized() { return Response.json({ error: 'Admin authentication required' }, { status: 401 }); }

export async function GET(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return unauthorized();
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get('q') || '').trim();
  const status = searchParams.get('status') || '';
  const author = searchParams.get('author') || '';
  const category = searchParams.get('category') || '';
  const tag = searchParams.get('tag') || '';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get('pageSize') || 20)));
  const all = await listEntity('blog_posts', searchParams.get('sort') || '-created_date');
  const filtered = all.filter((p: any) => (!q || p.title?.includes(q) || p.excerpt?.includes(q)) && (!status || p.status===status) && (!author || p.author_name===author) && (!category || p.category===category) && (!tag || p.tags?.includes(tag)));
  const total = filtered.length;
  const items = filtered.slice((page-1)*pageSize, page*pageSize);
  return Response.json({ items, total, page, pageSize });
}

export async function POST(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return unauthorized();
  const body = await request.json();
  const titleError = requireString(body.title, 'title');
  if (titleError) return badRequest(titleError);
  const contentError = requireString(body.content, 'content');
  if (contentError) return badRequest(contentError);
  const record = await createEntity('blog_posts', {
    ...body,
    slug: body.slug ? slugify(body.slug) : slugify(body.title),
    content: sanitizeHtml(body.content),
    status: body.status || 'draft',
    deleted_at: null
  });
  return Response.json(record, { status: 201 });
}
