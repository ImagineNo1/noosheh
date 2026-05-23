import type { Metadata } from 'next';
import CategoryClient from './CategoryClient';
import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import { safeDecodeURIComponent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const [settings, categories, seoMetas] = await Promise.all([
    getSiteSettings(),
    listEntity('categories').catch(() => [] as any[]),
    listEntity('seo_meta').catch(() => [] as any[])
  ]);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const siteName = settings.site_title || 'Noosheh';
  const slug = safeDecodeURIComponent(params.slug);
  const category = categories.find((c) => c.slug === slug || c.title === slug || c.name === slug);
  const seo = category ? (seoMetas.find((m) => m.entity_type === 'category' && m.entity_id === category.id) || {}) : {};
  const title = seo.meta_title || category?.title || category?.name || 'دسته‌بندی محصولات';
  const desc = seo.meta_description || `مشاهده محصولات ${title} در ${siteName}`;
  return generateSeoMetadata({ title, description: desc, path: `/category/${params.slug}`, siteUrl, siteName, robots: { index: seo.robots_index !== false, follow: seo.robots_follow !== false }, canonicalUrl: seo.canonical_url, og: { title: seo.og_title, description: seo.og_description, image: seo.og_image, type: 'website' }, twitter: { title: seo.twitter_title, description: seo.twitter_description, image: seo.twitter_image, card: seo.twitter_card } });
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  return <CategoryClient params={params} />;
}
