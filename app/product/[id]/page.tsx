import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { cache } from 'react';
import { getCachedSiteSettings, listCachedEntity, listCachedProducts } from '@/lib/public-data';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, productSchema } from '@/lib/seo/schema';
import { productCanonicalUrl, productHref, productIdentifierMatches } from '@/lib/product-normalization';

export const revalidate = 300;

async function resolveParamId(params: { id: string } | Promise<{ id: string }>) {
  const resolved = await params;
  return resolved?.id ? String(resolved.id) : '';
}

const getProductContext = cache(async function getProductContext(id: string) {
  const [settings, products, seoMetas, reviews] = await Promise.all([
    getCachedSiteSettings(),
    listCachedProducts('-created_date', '0'),
    listCachedEntity('seo_meta').catch(() => [] as any[]),
    listCachedEntity('reviews').catch(() => [] as any[])
  ]);
  const product = products.find((item) => productIdentifierMatches(item, id)) || null;
  return { settings, products, seoMetas, reviews, product };
});

export async function generateMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }): Promise<Metadata> {
  const id = await resolveParamId(params);
  try {
    const { settings, seoMetas, product } = await getProductContext(id);
    const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
    const siteName = settings.site_title || 'Noosheh';
    if (!product) return generateSeoMetadata({ title: 'محصول یافت نشد', description: 'محصول مورد نظر یافت نشد.', path: `/product/${id}`, siteUrl, siteName, robots: { index: false, follow: false } });
    const seo = seoMetas.find((m) => m.entity_type === 'product' && m.entity_id === product.id) || {};
    return generateSeoMetadata({
      title: seo.meta_title || product.title || product.name,
      description: seo.meta_description || product.short_description || product.description || settings.site_tagline || '',
      path: productHref(product),
      siteUrl,
      siteName,
      defaultOgImage: seo.og_image || product.cover_image || product.images?.[0],
      robots: { index: seo.robots_index !== false, follow: seo.robots_follow !== false, noarchive: !!seo.robots_noarchive, nosnippet: !!seo.robots_nosnippet, noimageindex: !!seo.robots_noimageindex },
      canonicalUrl: productCanonicalUrl(seo.canonical_url, product, siteUrl),
      og: { title: seo.og_title, description: seo.og_description, image: seo.og_image || product.cover_image || product.images?.[0], type: 'website' },
      twitter: { title: seo.twitter_title, description: seo.twitter_description, image: seo.twitter_image || product.cover_image || product.images?.[0], card: seo.twitter_card },
      keywords: [product.title, product.category, product.brand, 'خرید لباس زنانه'].filter(Boolean) as string[]
    });
  } catch {
    return {
      title: 'محصول',
      description: 'مشاهده جزئیات محصول',
      robots: { index: false, follow: false }
    };
  }
}

export default async function ProductPage({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const id = await resolveParamId(params);
  try {
    const { settings, products: normalizedProducts, reviews, product } = await getProductContext(id);
    const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL;
    const productReviews = reviews.filter((review: any) => review.product_id === product?.id);
    return <>
      {product ? <JsonLd id={`schema-product-${product.id}`} data={productSchema({ siteUrl, product, reviews: productReviews })} /> : null}
      {product ? <JsonLd id={`schema-breadcrumb-product-${product.id}`} data={breadcrumbSchema({ siteUrl, items: [{ name: 'خانه', path: '/' }, ...(product.category ? [{ name: product.category, path: `/category/${encodeURIComponent(product.category)}` }] : []), { name: product.title, path: productHref(product) }] })} /> : null}
      <ProductDetailClient params={{ id }} initialProducts={normalizedProducts} />
    </>;
  } catch {
    return <ProductDetailClient params={{ id }} />;
  }
}
