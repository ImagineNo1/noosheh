import { NextResponse } from 'next/server';
import { listEntity } from '@/lib/admin-store';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export async function GET() {
  const categories = await listEntity('categories', '-updated_date', '50000').catch(() => []);
  const urls = (categories as any[]).filter((c) => c.is_active !== false && c.slug).map((c) => `<url><loc>${site}/category/${String(c.slug).toLowerCase()}</loc><lastmod>${c.updated_date || c.created_date || new Date().toISOString()}</lastmod></url>`).join('');
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
