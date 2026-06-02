export const revalidate = 300;

import type { Metadata } from 'next';
import StoreHeader from '@/components/store/StoreHeader';
import Footer from '@/components/store/Footer';
import { StoreHome } from '@/components/store/HomeSections';
import type { Category } from '@/app/admin/types';
import { productHref } from '@/lib/product-normalization';
import { getCachedSiteSettings, listCachedEntity, listCachedProducts } from '@/lib/public-data';
import { generateSeoMetadata, normalizeSiteUrl } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { itemListSchema } from '@/lib/seo/schema';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getCachedSiteSettings();
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
  const [settings, products, categories] = await Promise.all([
    getCachedSiteSettings(),
    listCachedProducts('-created_date', '100'),
    listCachedEntity('categories', 'sort_order', '100').then((items) => items as Category[]).catch(() => [] as Category[])
  ]);
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);
  const activeProducts = products.filter((product) => product.is_active !== false).slice(0, 12);

  return (
    <main>
      <JsonLd id="schema-home-products" data={itemListSchema({ siteUrl, name: 'محصولات منتخب نوشه', path: '/', items: activeProducts.map((product) => ({ name: product.title || product.name || 'محصول نوشه', path: productHref(product) })) })} />
      <StoreHeader promoText={settings.promo_banner_text} logoText={settings.site_title || 'Noosheh'} categories={categories} />
      <StoreHome products={products} settings={settings} categories={categories} />
      <Footer />
    </main>
  );
}
