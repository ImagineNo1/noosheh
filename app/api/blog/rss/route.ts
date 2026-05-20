import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

function esc(s: string) { return s.replace(/[<>&'\"]/g, (c) => ({ '<':'&lt;','>':'&gt;','&':'&amp;','\"':'&quot;',"'":'&apos;' }[c] || c)); }

export async function GET() {
  const settings = await getSiteSettings();
  const siteUrl = (settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');
  const posts = await listEntity('blog_posts', '-updated_date').catch(() => [] as any[]);
  const items = posts.filter((p:any)=>p.status==='published' && !p.deleted_at).slice(0, 50).map((p:any)=>`<item><title>${esc(p.title||'')}</title><link>${siteUrl}/blog/${encodeURIComponent(p.slug||p.id)}</link><guid>${siteUrl}/blog/${encodeURIComponent(p.slug||p.id)}</guid><pubDate>${new Date(p.updated_date||p.created_date||Date.now()).toUTCString()}</pubDate><description>${esc(p.excerpt||'')}</description></item>`).join('');
  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(settings.site_name||'Blog')}</title><link>${siteUrl}/blog</link><description>${esc(settings.site_description||'')}</description>${items}</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
