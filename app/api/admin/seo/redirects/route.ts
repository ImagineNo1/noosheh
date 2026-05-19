import { NextResponse } from 'next/server';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { validateRedirect } from '@/lib/seo/schemas';
import { createRedirect, listRedirects } from '@/lib/seo/store';

function hasRedirectLoop(fromPath: string, toPath?: string) {
  return !!toPath && fromPath.toLowerCase() === toPath.toLowerCase();
}

export async function GET(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await listRedirects());
}

export async function POST(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const payload = await request.json();
  const parsed = validateRedirect(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (hasRedirectLoop(String(payload.fromPath), payload.toPath ? String(payload.toPath) : undefined)) {
    return NextResponse.json({ error: 'Redirect loop detected' }, { status: 400 });
  }
  try {
    return NextResponse.json(await createRedirect(parsed.data), { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create redirect';
    if (message.includes('duplicate key')) return NextResponse.json({ error: 'fromPath must be unique' }, { status: 409 });
    throw error;
  }
}
