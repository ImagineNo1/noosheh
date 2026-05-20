import { createEntity } from '@/lib/admin-store';
import { sanitizeHtml } from '@/app/api/admin/blog/_lib/validators';
const ipHits = new Map<string, { count: number; ts: number }>();
export async function POST(request: Request) {
  const body = await request.json();
  const ip = request.headers.get('x-forwarded-for') || 'local';
  const now = Date.now();
  const hit = ipHits.get(ip) || { count: 0, ts: now };
  if (now - hit.ts < 60_000 && hit.count >= 5) return Response.json({ error: 'rate limit exceeded' }, { status: 429 });
  ipHits.set(ip, now - hit.ts < 60_000 ? { count: hit.count + 1, ts: hit.ts } : { count: 1, ts: now });
  if (!body.post_id || !body.author_name || !body.author_email || !body.content) return Response.json({ error: 'invalid payload' }, { status: 400 });
  const record = await createEntity('blog_comments', { ...body, content: sanitizeHtml(body.content), status: 'pending' });
  return Response.json(record, { status: 201 });
}
