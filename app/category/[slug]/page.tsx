import type { Metadata } from 'next';
import { cache } from 'react';
import CategoryClient from './CategoryClient';
import { getCachedSiteSettings, listCachedEntity, listCachedProducts } from '@/lib/public-data';
import { generateSeoMetadata, normalizeSiteUrl } from '@/lib/seo/seo-core';
import JsonLd from '@/components/seo/JsonLd';
import { breadcrumbSchema, categoryPath, collectionPageSchema, itemListSchema } from '@/lib/seo/schema';
import { productHref } from '@/lib/product-normalization';
import { safeDecodeURIComponent } from '@/lib/utils';
import type { Category } from '@/app/admin/types';

export const revalidate = 300;

function categoryNameFromSlug(slug: string, category?: Partial<Category>) {
  if (slug === 'all') return 'همه محصولات';
  return category?.title || category?.name || safeDecodeURIComponent(slug);
}

function categoryDescription(name: string, siteName: string, custom?: string) {
  return custom || `خرید ${name} از ${siteName}؛ مشاهده محصولات جدید، پرفروش و منتخب با امکان بررسی قیمت، رنگ، سایز و موجودی.`;
}

const getCategoryContext = cache(async function getCategoryContext(slugParam: string) {
  const [settings, categories, products, seoMetas] = await Promise.all([
    getCachedSiteSettings(),
    listCachedEntity('categories').catch(() => [] as Category[]),
    listCachedProducts('-created_date', '200'),
    listCachedEntity('seo_meta').catch(() => [] as any[])
  ]);
  const slug = safeDecodeURIComponent(slugParam);
  const category = (categories as Category[]).find((item) => item.slug === slug || item.title === slug || item.name === slug);
  const seo = category ? (seoMetas.find((item) => item.entity_type === 'category' && item.entity_id === category.id) || {}) : {};
  const name = categoryNameFromSlug(slug, category);
  const siteName = settings.site_title || 'Noosheh';
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);
  const filteredProducts = products.filter((product) => product.is_active !== false).filter((product) => slug === 'all' || product.category === slug || product.category === category?.title || product.category === category?.name);

  return { settings, categories: categories as Category[], products, filteredProducts, category, seo, slug, name, siteName, siteUrl };
});

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const ctx = await getCategoryContext(params.slug);
  const description = categoryDescription(ctx.name, ctx.siteName, ctx.seo.meta_description || (ctx.category as any)?.description);
  const title = ctx.seo.meta_title || (ctx.slug === 'all' ? `خرید محصولات نوشه` : `خرید ${ctx.name}`);

  return generateSeoMetadata({
    title,
    description,
    path: `/category/${params.slug}`,
    siteUrl: ctx.siteUrl,
    siteName: ctx.siteName,
    defaultOgImage: ctx.seo.og_image || ctx.category?.image || ctx.settings.default_og_image || '/store/noosheh-hero-editorial.png',
    robots: { index: ctx.seo.robots_index !== false, follow: ctx.seo.robots_follow !== false },
    canonicalUrl: ctx.seo.canonical_url,
    og: { title: ctx.seo.og_title, description: ctx.seo.og_description, image: ctx.seo.og_image, type: 'website' },
    twitter: { title: ctx.seo.twitter_title, description: ctx.seo.twitter_description, image: ctx.seo.twitter_image, card: ctx.seo.twitter_card },
    keywords: [ctx.name, `خرید ${ctx.name}`, 'لباس زنانه نوشه']
  });
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const ctx = await getCategoryContext(params.slug);
  const description = categoryDescription(ctx.name, ctx.siteName, ctx.seo.meta_description || (ctx.category as any)?.description);
  const categoryUrl = `/category/${params.slug}`;
  const siblingCategories = ctx.categories.filter((category) => category.is_active !== false && (category.slug || category.title || category.name)).slice(0, 8);
  const itemList = ctx.filteredProducts.slice(0, 24).map((product) => ({ name: product.title || product.name || 'محصول نوشه', path: productHref(product) }));

  return (
    <>
      <JsonLd id={`schema-category-${params.slug}`} data={collectionPageSchema({ siteUrl: ctx.siteUrl, name: ctx.name, path: categoryUrl, description, items: itemList })} />
      <JsonLd id={`schema-category-breadcrumb-${params.slug}`} data={breadcrumbSchema({ siteUrl: ctx.siteUrl, items: [{ name: 'خانه', path: '/' }, { name: ctx.name, path: categoryUrl }] })} />
      <JsonLd id={`schema-category-items-${params.slug}`} data={itemListSchema({ siteUrl: ctx.siteUrl, name: `محصولات ${ctx.name}`, path: categoryUrl, items: itemList })} />
      <CategoryClient
        params={params}
        initialProducts={ctx.products}
        initialCategories={ctx.categories}
        categoryTitle={ctx.name}
        categoryDescription={description}
        relatedCategories={siblingCategories.map((category) => ({ label: category.title || category.name || category.slug || '', href: categoryPath(category) }))}
      />
    </>
  );
}
