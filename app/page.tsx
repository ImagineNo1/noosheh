export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StoreHeader from '@/components/store/StoreHeader';
import Footer from '@/components/store/Footer';
import { StoreHome } from '@/components/store/HomeSections';
import { getSiteSettings } from '@/lib/site-settings';
import { listEntity } from '@/lib/admin-store';
import { normalizeStorefrontProducts, productHref } from '@/lib/product-normalization';
import { generateSeoMetadata, normalizeSiteUrl } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { itemListSchema } from '@/lib/seo/schema';
import type { Product } from '@/app/admin/types';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle = settings.site_title || 'Noosheh';
  const siteMetaTitle = settings.site_meta_title || `${siteTitle} | بوتیک لباس زیر و لباس خواب زنانه`;
  const siteTagline = settings.site_meta_description || settings.site_tagline || 'خرید لباس زیر، لباس خواب، ست زنانه و محصولات راحتی از نوشه با ارسال سریع، پرداخت امن و تجربه بوتیک پریمیوم.';
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);

  return generateSeoMetadata({
    title: siteMetaTitle,
    description: siteTagline,
    path: '/',
    siteUrl,
    siteName: siteTitle,
    defaultOgImage: settings.default_og_image || settings.home_hero_rect_image || '/store/noosheh-hero-editorial.png',
    keywords: ['لباس زیر زنانه', 'لباس خواب زنانه', 'ست لباس زیر', 'نوشه']
  });
}

export default async function Home() {
  const [settings, products] = await Promise.all([
    getSiteSettings(),
    listEntity('products', '-created_date', '100').then((items) => normalizeStorefrontProducts(items as Product[])).catch(() => [] as Product[])
  ]);
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);
  const activeProducts = products.filter((product) => product.is_active !== false).slice(0, 12);

  return (
    <main>
      <JsonLd id="schema-home-products" data={itemListSchema({ siteUrl, name: 'محصولات منتخب نوشه', path: '/', items: activeProducts.map((product) => ({ name: product.title || product.name || 'محصول نوشه', path: productHref(product) })) })} />
      <StoreHeader />
      <StoreHome products={products} settings={settings} />
      <Footer />
    </main>
  );
}
