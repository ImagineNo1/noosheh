import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';
import { generateSeoMetadata } from '@/lib/seo/seo-core';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const [settings, products, seoMetas] = await Promise.all([
    getSiteSettings(),
    listEntity('products').catch(() => [] as any[]),
    listEntity('seo_meta').catch(() => [] as any[])
  ]);
  const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  const siteName = settings.site_title || 'Noosheh';
  const product = products.find((p) => p.id === params.id || p.code === params.id);
  if (!product) return generateSeoMetadata({ title: 'محصول یافت نشد', description: 'محصول مورد نظر یافت نشد.', path: `/product/${params.id}`, siteUrl, siteName, robots: { index: false, follow: false } });
  const seo = seoMetas.find((m) => m.entity_type === 'product' && m.entity_id === product.id) || {};
  return generateSeoMetadata({
    title: seo.meta_title || product.title || product.name,
    description: seo.meta_description || product.short_description || product.description || settings.site_tagline || '',
    path: `/product/${product.id}`,
    siteUrl,
    siteName,
    defaultOgImage: seo.og_image || product.cover_image || product.images?.[0],
    robots: { index: seo.robots_index !== false, follow: seo.robots_follow !== false, noarchive: !!seo.robots_noarchive, nosnippet: !!seo.robots_nosnippet, noimageindex: !!seo.robots_noimageindex },
    canonicalUrl: seo.canonical_url,
    og: { title: seo.og_title, description: seo.og_description, image: seo.og_image, type: seo.og_type || 'product' },
    twitter: { title: seo.twitter_title, description: seo.twitter_description, image: seo.twitter_image, card: seo.twitter_card }
  });
}

export default function ProductPage({ params }: { params: { id: string } }) {
  return <ProductDetailClient params={params} />;
}
