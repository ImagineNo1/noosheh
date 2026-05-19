import type { MetadataRoute } from 'next';
import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const seo = await listEntity('seo_settings').catch(() => [] as any[]);
  const robotsTxt = seo[0]?.robots_txt as string | undefined;

  const defaultRules: MetadataRoute.Robots['rules'] = {
    userAgent: '*',
    allow: '/',
    disallow: ['/admin', '/api', '/cart', '/checkout', '/account', '/*?sort=', '/*?filter=', '/*?utm_']
  };

  if (!robotsTxt) return { rules: defaultRules, sitemap: [`${siteUrl.replace(/\/$/, '')}/sitemap.xml`] };

  return { rules: defaultRules, sitemap: [`${siteUrl.replace(/\/$/, '')}/sitemap.xml`] };
}
