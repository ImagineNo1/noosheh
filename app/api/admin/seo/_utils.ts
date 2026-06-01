import { isAdminRequest, isJwtConfigured } from '@/lib/jwt';
import { NextResponse } from 'next/server';

export function ensureAdmin(request: Request) {
  if (isJwtConfigured() && !isAdminRequest(request)) {
    return NextResponse.json({ error: 'Admin authentication required' }, { status: 401 });
  }
  return null;
}

export function sanitizePath(input: string) {
  if (!input) return '/';
  const value = input.trim();
  if (!value.startsWith('/')) return `/${value}`;
  return value;
}
