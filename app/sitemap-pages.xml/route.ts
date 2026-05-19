import { NextResponse } from 'next/server';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export async function GET() {
  const urls = [`${site}/`, `${site}/contact`, `${site}/faq`].map((u) => `<url><loc>${u}</loc></url>`).join('');
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
}
