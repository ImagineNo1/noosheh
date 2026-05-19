import type { MetadataRoute } from 'next';
import { listEntity } from '@/lib/admin-store';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([
    listEntity('products', '-updated_date', '5000').catch(() => []),
    listEntity('categories', '-updated_date', '1000').catch(() => [])
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/contact`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${siteUrl}/faq`, changeFrequency: 'monthly', priority: 0.5 }
  ];

  const productUrls = products
    .filter((p: any) => p.is_active !== false && p.slug)
    .map((p: any) => ({ url: `${siteUrl}/product/${String(p.slug).toLowerCase()}`, lastModified: p.updated_date ? new Date(p.updated_date) : undefined, changeFrequency: 'weekly' as const, priority: 0.8 }));
  const categoryUrls = categories
    .filter((c: any) => c.is_active !== false && c.slug)
    .map((c: any) => ({ url: `${siteUrl}/category/${String(c.slug).toLowerCase()}`, lastModified: c.updated_date ? new Date(c.updated_date) : undefined, changeFrequency: 'weekly' as const, priority: 0.7 }));

  return [...staticPages, ...productUrls, ...categoryUrls];
}
