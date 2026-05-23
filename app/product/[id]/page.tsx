import type { Metadata } from 'next';
import ProductDetailClient from './ProductDetailClient';
import { listEntity } from '@/lib/admin-store';
import { getSiteSettings } from '@/lib/site-settings';
import { generateSeoMetadata } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { productSchema } from '@/lib/seo/schema';

export const dynamic = 'force-dynamic';

function isSeoTemporarilyDisabled(settings: Record<string, string>) {
  const raw = (settings.seo_enabled ?? settings.seo_product_enabled ?? '').toString().trim().toLowerCase();
  return raw === 'false' || raw === '0' || raw === 'off';
}

async function resolveParamId(params: { id: string } | Promise<{ id: string }>) {
  const resolved = await params;
  return resolved?.id ? String(resolved.id) : '';
}

export async function generateMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }): Promise<Metadata> {
  const id = await resolveParamId(params);
  try {
    const [settings, products, seoMetas] = await Promise.all([
      getSiteSettings(),
      listEntity('products').catch(() => [] as any[]),
      listEntity('seo_meta').catch(() => [] as any[])
    ]);
    const product = products.find((p) => p.id === id || p.code === id);
    if (isSeoTemporarilyDisabled(settings)) {
      return {
        title: product?.title || product?.name || 'محصول',
        description: product?.short_description || product?.description || 'مشاهده جزئیات محصول',
        robots: { index: false, follow: false }
      };
    }

    const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
    const siteName = settings.site_title || 'Noosheh';
    if (!product) return generateSeoMetadata({ title: 'محصول یافت نشد', description: 'محصول مورد نظر یافت نشد.', path: `/product/${id}`, siteUrl, siteName, robots: { index: false, follow: false } });
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
    const settings = await getSiteSettings();
    const products = await listEntity('products').catch(() => [] as any[]);
    const product = products.find((p) => p.id === id || p.code === id);
    const siteUrl = settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
    const seoDisabled = isSeoTemporarilyDisabled(settings);
    return <>
      {!seoDisabled && product ? <JsonLd id={`schema-product-${product.id}`} data={productSchema({ siteUrl, product })} /> : null}
      <ProductDetailClient params={{ id }} />
    </>;
  } catch {
    return <ProductDetailClient params={{ id }} />;
  }
}
