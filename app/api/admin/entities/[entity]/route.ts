import { NextResponse } from 'next/server';
import { createEntity, listEntity, resolveEntity } from '@/lib/admin-store';

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
  const payload = await request.json();
  const record = await createEntity(entity, payload);
  return NextResponse.json(record, { status: 201 });
}
