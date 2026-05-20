import type { MetadataRoute } from 'next';
import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const seo = await listEntity('seo_settings').catch(() => [] as any[]);
  const cfg = seo[0] || {};

  const disallow = Array.isArray(cfg.robots_disallow) && cfg.robots_disallow.length
    ? cfg.robots_disallow
    : ['/admin', '/api', '/cart', '/checkout', '/account', '/login', '/register', '/signup', '/*?sort=', '/*?filter=', '/*?utm_'];

  const textDisallow = String(cfg.robots_txt || '')
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => /^disallow\s*:/i.test(line))
    .map((line: string) => line.replace(/^disallow\s*:/i, '').trim())
    .filter(Boolean);

  const mergedDisallow = Array.from(new Set([...disallow, ...textDisallow]));

  const defaultRules: MetadataRoute.Robots['rules'] = {
    userAgent: '*',
    allow: '/',
    disallow: mergedDisallow
  };

  return { rules: defaultRules, sitemap: [`${siteUrl.replace(/\/$/, '')}/sitemap.xml`, `${siteUrl.replace(/\/$/, '')}/api/blog/rss`] };
}
