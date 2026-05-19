import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { validateRedirect } from '@/lib/seo/schemas';
import { deleteRedirect, updateRedirect } from '@/lib/seo/store';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = validateRedirect({ ...payload, fromPath: payload.fromPath || '/x', statusCode: payload.statusCode || 301, toPath: payload.toPath || '/x' });
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  return NextResponse.json(await updateRedirect(params.id, payload));
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json({ ok: await deleteRedirect(params.id) });
}
