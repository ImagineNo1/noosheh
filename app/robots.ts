import type { MetadataRoute } from 'next';
import { listEntity } from '@/lib/admin-store';
import { getCachedSiteSettings } from '@/lib/public-data';
import { normalizeSiteUrl } from '@/lib/seo/seo-core';

export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getCachedSiteSettings();
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);
  const seo = await listEntity('seo_settings').catch(() => [] as any[]);
  const cfg = seo[0] || {};

  const defaultDisallow = [
    '/admin',
    '/admin/',
    '/api',
    '/api/',
    '/account',
    '/account/',
    '/checkout',
    '/checkout/',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/search',
    '/gen',
    '/track-order',
    '/*?sort=',
    '/*?filter=',
    '/*?price=',
    '/*?utm_',
    '/*?fbclid=',
    '/*?gclid='
  ];

  const configuredDisallow = Array.isArray(cfg.robots_disallow) ? cfg.robots_disallow : [];
  const textDisallow = String(cfg.robots_txt || '')
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => /^disallow\s*:/i.test(line))
    .map((line: string) => line.replace(/^disallow\s*:/i, '').trim())
    .filter(Boolean);

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/category/', '/product/', '/blog/', '/pages/', '/faq', '/contact'],
      disallow: Array.from(new Set([...defaultDisallow, ...configuredDisallow, ...textDisallow]))
    },
    sitemap: [`${siteUrl}/sitemap.xml`],
    host: siteUrl
  };
}
