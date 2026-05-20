import type { MetadataRoute } from 'next';
import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getSiteSettings();
  const siteUrl = (settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com').replace(/\/$/, '');

  const [products, categories, seoMeta, blogPosts, blogCategories, blogTags, blogPages] = await Promise.all([
    listEntity('products').catch(() => [] as any[]),
    listEntity('categories').catch(() => [] as any[]),
    listEntity('seo_meta').catch(() => [] as any[]),
    listEntity('blog_posts').catch(() => [] as any[]),
    listEntity('blog_categories').catch(() => [] as any[]),
    listEntity('blog_tags').catch(() => [] as any[]),
    listEntity('blog_pages').catch(() => [] as any[])
  ]);

  const noindexMap = new Set(seoMeta.filter((m) => m.robots_index === false).map((m) => `${m.entity_type}:${m.entity_id}`));

  const productItems = products
    .filter((p) => p.is_active !== false && !noindexMap.has(`product:${p.id}`) && (p.slug || p.id))
    .map((p) => ({ url: `${siteUrl}/product/${p.id}`, lastModified: p.updated_date ? new Date(p.updated_date) : new Date(), changeFrequency: 'weekly' as const, priority: 0.8 }));

  const categoryItems = categories
    .filter((c) => c.is_active !== false && !noindexMap.has(`category:${c.id}`) && (c.slug || c.title || c.name))
    .map((c) => ({ url: `${siteUrl}/category/${encodeURIComponent(c.slug || c.title || c.name)}`, lastModified: c.updated_date ? new Date(c.updated_date) : new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }));


  const blogPostItems = blogPosts
    .filter((p) => p.status === 'published' && !p.deleted_at && !noindexMap.has(`blog_post:${p.id}`) && (p.slug || p.id))
    .map((p) => ({ url: `${siteUrl}/blog/${encodeURIComponent(p.slug || p.id)}`, lastModified: p.updated_date ? new Date(p.updated_date) : new Date(), changeFrequency: 'weekly' as const, priority: 0.7 }));

  const blogCategoryItems = blogCategories
    .filter((c) => c.slug && !noindexMap.has(`blog_category:${c.id}`))
    .map((c) => ({ url: `${siteUrl}/blog/category/${encodeURIComponent(c.slug)}`, lastModified: c.updated_date ? new Date(c.updated_date) : new Date(), changeFrequency: 'weekly' as const, priority: 0.6 }));

  const blogTagItems = blogTags
    .filter((t) => t.slug && !noindexMap.has(`blog_tag:${t.id}`))
    .map((t) => ({ url: `${siteUrl}/blog/tag/${encodeURIComponent(t.slug)}`, lastModified: t.updated_date ? new Date(t.updated_date) : new Date(), changeFrequency: 'weekly' as const, priority: 0.5 }));

  const blogPageItems = blogPages
    .filter((p) => p.status === 'published' && !noindexMap.has(`blog_page:${p.id}`) && p.slug)
    .map((p) => ({ url: `${siteUrl}/pages/${encodeURIComponent(p.slug)}`, lastModified: p.updated_date ? new Date(p.updated_date) : new Date(), changeFrequency: 'monthly' as const, priority: 0.5 }));

  const staticItems: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${siteUrl}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 }
  ];

  return [...staticItems, ...productItems, ...categoryItems, ...blogPostItems, ...blogCategoryItems, ...blogTagItems, ...blogPageItems];
}
