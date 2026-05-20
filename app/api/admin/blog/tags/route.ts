import { createEntity, listEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
export async function GET(request: Request) { if (isJwtConfigured() && !isAdminRequest(request)) return Response.json({ error: 'Admin authentication required' }, { status: 401 }); return Response.json(await listEntity('blog_tags', '-created_date')); }
export async function POST(request: Request) { if (isJwtConfigured() && !isAdminRequest(request)) return Response.json({ error: 'Admin authentication required' }, { status: 401 }); const body=await request.json(); return Response.json(await createEntity('blog_tags', body), {status:201}); }
