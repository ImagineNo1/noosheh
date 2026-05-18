import { NextResponse } from 'next/server';
import { createEntity, listEntity, resolveEntity } from '@/lib/admin-store';
import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';

function canCreatePublicly(entityName: string) {
  return entityName === 'Order' || entityName === 'Review';
}

export async function GET(request: Request, { params }: { params: { entity: string } }) {
  const entity = resolveEntity(params.entity);
  if (!entity) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const records = await listEntity(entity, searchParams.get('sort'), searchParams.get('limit'));
  return NextResponse.json(records);
}

export async function POST(request: Request, { params }: { params: { entity: string } }) {
  const entity = resolveEntity(params.entity);
  if (!entity) return NextResponse.json({ error: 'Unknown entity' }, { status: 404 });
  if (isJwtConfigured() && !canCreatePublicly(params.entity) && !isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }
  const payload = await request.json();
  try {
    const record = await createEntity(entity, payload);
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid payload';
    if (message.startsWith('VALIDATION:')) {
      return NextResponse.json({ error: message.replace('VALIDATION:', '') }, { status: 400 });
    }
    throw error;
  }
}
