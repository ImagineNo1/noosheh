import { NextResponse } from 'next/server';
const site = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Noosheh Blog</title><link>${site}</link><description>Blog feed</description></channel></rss>`;
  return new NextResponse(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
