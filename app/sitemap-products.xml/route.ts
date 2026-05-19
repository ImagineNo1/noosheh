import { NextResponse } from 'next/server';
import { listEntity } from '@/lib/admin-store';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export async function GET() {
  const products = await listEntity('products', '-updated_date', '50000').catch(() => []);
  const urls = (products as any[]).filter((p) => p.is_active !== false && p.slug).map((p) => `<url><loc>${site}/product/${String(p.slug).toLowerCase()}</loc><lastmod>${p.updated_date || p.created_date || new Date().toISOString()}</lastmod></url>`).join('');
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
