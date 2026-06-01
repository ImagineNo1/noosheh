import type { MetadataRoute } from 'next';
import { listEntity } from '@/lib/admin-store';
import { normalizeStorefrontProducts, productHref } from '@/lib/product-normalization';
import { getCachedSiteSettings } from '@/lib/public-data';
import { generateCanonicalUrl, normalizeSiteUrl } from '@/lib/seo/seo-core';

export const revalidate = 300;

type SitemapEntry = MetadataRoute.Sitemap[number];

function cleanPath(path: string) {
  return path.startsWith('/') ? path : `/${path}`;
}

function sitemapItem(siteUrl: string, path: string, priority: number, changeFrequency: SitemapEntry['changeFrequency'], lastModified?: string | Date): SitemapEntry {
  return {
    url: generateCanonicalUrl(cleanPath(path), siteUrl),
    lastModified: lastModified ? new Date(lastModified) : new Date(),
    changeFrequency,
    priority
  };
}

function noindexSet(seoMeta: any[]) {
  return new Set(seoMeta.filter((item) => item.robots_index === false).map((item) => `${item.entity_type}:${item.entity_id}`));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await getCachedSiteSettings();
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);

  const [products, categories, seoMeta, blogPosts, blogCategories, blogTags, blogPages] = await Promise.all([
    listEntity('products').catch(() => [] as any[]),
    listEntity('categories').catch(() => [] as any[]),
    listEntity('seo_meta').catch(() => [] as any[]),
    listEntity('blog_posts').catch(() => [] as any[]),
    listEntity('blog_categories').catch(() => [] as any[]),
    listEntity('blog_tags').catch(() => [] as any[]),
    listEntity('blog_pages').catch(() => [] as any[])
  ]);

  const noindex = noindexSet(seoMeta);
  const normalizedProducts = normalizeStorefrontProducts(products as any[]);

  const staticItems: MetadataRoute.Sitemap = [
    sitemapItem(siteUrl, '/', 1, 'daily'),
    sitemapItem(siteUrl, '/category/all', 0.9, 'daily'),
    sitemapItem(siteUrl, '/blog', 0.7, 'weekly'),
    sitemapItem(siteUrl, '/faq', 0.45, 'monthly'),
    sitemapItem(siteUrl, '/contact', 0.4, 'monthly'),
    sitemapItem(siteUrl, '/order-tracking', 0.25, 'yearly')
  ];

  const categoryItems = categories
    .filter((category) => category.is_active !== false && !noindex.has(`category:${category.id}`) && (category.slug || category.title || category.name))
    .map((category) => sitemapItem(siteUrl, `/category/${encodeURIComponent(category.slug || category.title || category.name)}`, 0.75, 'weekly', category.updated_date || category.created_date));

  const productItems = normalizedProducts
    .filter((product) => product.is_active !== false && !noindex.has(`product:${product.id}`) && (product.slug || product.id))
    .map((product) => sitemapItem(siteUrl, productHref(product), 0.85, 'weekly', product.updated_date || product.created_date));

  const blogPostItems = blogPosts
    .filter((post) => post.status === 'published' && !post.deleted_at && !noindex.has(`blog_post:${post.id}`) && (post.slug || post.id))
    .map((post) => sitemapItem(siteUrl, `/blog/${encodeURIComponent(post.slug || post.id)}`, 0.65, 'weekly', post.updated_date || post.publish_at || post.created_date));

  const blogCategoryItems = blogCategories
    .filter((category) => category.slug && !noindex.has(`blog_category:${category.id}`))
    .map((category) => sitemapItem(siteUrl, `/blog/category/${encodeURIComponent(category.slug)}`, 0.5, 'weekly', category.updated_date || category.created_date));

  const blogTagItems = blogTags
    .filter((tag) => tag.slug && !noindex.has(`blog_tag:${tag.id}`))
    .map((tag) => sitemapItem(siteUrl, `/blog/tag/${encodeURIComponent(tag.slug)}`, 0.35, 'monthly', tag.updated_date || tag.created_date));

  const pageItems = blogPages
    .filter((page) => page.status === 'published' && !noindex.has(`blog_page:${page.id}`) && page.slug)
    .map((page) => sitemapItem(siteUrl, `/pages/${encodeURIComponent(page.slug)}`, 0.45, 'monthly', page.updated_date || page.created_date));

  const unique = new Map<string, SitemapEntry>();
  [...staticItems, ...categoryItems, ...productItems, ...blogPostItems, ...blogCategoryItems, ...blogTagItems, ...pageItems].forEach((item) => unique.set(item.url, item));
  return [...unique.values()];
}
