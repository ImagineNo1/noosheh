import { productHref, stringifyProductValue } from '@/lib/product-normalization';
import { normalizeSiteUrl, stripHtml, toAbsoluteUrl } from '@/lib/seo/seo-core';

function compact<T extends Record<string, any>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined && item !== '' && !(Array.isArray(item) && item.length === 0))) as T;
}

function imageList(values: unknown[], siteUrl: string) {
  return values
    .map((item: any) => (typeof item === 'string' ? item : item?.url))
    .filter(Boolean)
    .map((item: string) => toAbsoluteUrl(item, siteUrl));
}

function totalStock(product: any) {
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.reduce((sum: number, variant: any) => sum + Number(variant.stock ?? variant.inventory ?? 0), 0);
  }
  return Number(product.stock ?? 0);
}

export function organizationSchema(input: { siteUrl?: string; siteName: string; logo?: string; phone?: string; address?: string; sameAs?: string[] }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  return compact({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: input.siteName,
    url: siteUrl,
    logo: input.logo ? toAbsoluteUrl(input.logo, siteUrl) : undefined,
    sameAs: input.sameAs?.filter(Boolean),
    contactPoint: input.phone ? [{ '@type': 'ContactPoint', telephone: input.phone, contactType: 'customer support', areaServed: 'IR', availableLanguage: ['fa-IR', 'fa'] }] : undefined,
    address: input.address ? { '@type': 'PostalAddress', streetAddress: input.address, addressCountry: 'IR' } : undefined
  });
}

export function websiteSchema(input: { siteUrl?: string; siteName: string }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: input.siteName,
    url: siteUrl,
    inLanguage: 'fa-IR',
    publisher: { '@id': `${siteUrl}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function productSchema(input: { siteUrl?: string; product: any; reviews?: any[] }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  const p = input.product;
  const images = imageList([p.cover_image, ...(Array.isArray(p.images) ? p.images : [])], siteUrl);
  const price = Number(p.discount_price || p.price || 0);
  const reviews = (input.reviews || []).filter((review) => review.status === 'approved' || review.is_approved === true);
  const aggregateRating = Number(p.avg_rating || 0) > 0 && Number(p.review_count || reviews.length || 0) > 0
    ? {
        '@type': 'AggregateRating',
        ratingValue: Number(p.avg_rating || 0).toFixed(1),
        reviewCount: Number(p.review_count || reviews.length)
      }
    : undefined;

  return compact({
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${siteUrl}${productHref(p)}#product`,
    name: p.title || p.name,
    image: images,
    description: stripHtml(p.short_description || p.description || p.details || ''),
    sku: p.code || p.id,
    mpn: p.code || p.id,
    brand: p.brand ? { '@type': 'Brand', name: p.brand } : { '@type': 'Brand', name: 'Noosheh' },
    category: p.category,
    material: p.material,
    color: Array.isArray(p.colors) ? p.colors.join(', ') : undefined,
    size: Array.isArray(p.sizes) ? p.sizes.join(', ') : undefined,
    aggregateRating,
    review: reviews.slice(0, 10).map((review) => compact({
      '@type': 'Review',
      reviewRating: { '@type': 'Rating', ratingValue: Number(review.rating || 0), bestRating: 5, worstRating: 1 },
      author: { '@type': 'Person', name: review.user_name || 'مشتری نوشه' },
      reviewBody: review.comment,
      datePublished: review.created_date
    })),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price,
      availability: totalStock(p) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      url: `${siteUrl}${productHref(p)}`,
      seller: { '@id': `${siteUrl}/#organization` }
    }
  });
}

export function breadcrumbSchema(input: { siteUrl?: string; items: Array<{ name: string; path: string }> }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path, siteUrl)
    }))
  };
}

export function blogPostingSchema(input: { siteUrl?: string; post: any }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  const post = input.post;
  return compact({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${siteUrl}/blog/${post.slug || post.id}#article`,
    headline: post.title,
    description: stripHtml(post.excerpt || post.seo_description || ''),
    image: post.cover_image ? [toAbsoluteUrl(post.cover_image, siteUrl)] : [],
    datePublished: post.publish_at || post.created_date,
    dateModified: post.updated_date || post.publish_at || post.created_date,
    mainEntityOfPage: toAbsoluteUrl(`/blog/${post.slug || post.id}`, siteUrl),
    inLanguage: 'fa-IR',
    author: {
      '@type': 'Person',
      name: post.author_name || 'تیم نوشه'
    },
    publisher: { '@id': `${siteUrl}/#organization` }
  });
}

export function collectionPageSchema(input: { siteUrl?: string; name: string; path: string; description?: string; items?: Array<{ name: string; path: string }> }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  return compact({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${toAbsoluteUrl(input.path, siteUrl)}#collection`,
    name: input.name,
    description: input.description,
    url: toAbsoluteUrl(input.path, siteUrl),
    inLanguage: 'fa-IR',
    isPartOf: { '@id': `${siteUrl}/#website` },
    mainEntity: input.items?.length ? itemListSchema({ siteUrl, name: input.name, path: input.path, items: input.items }) : undefined
  });
}

export function itemListSchema(input: { siteUrl?: string; name: string; path: string; items: Array<{ name: string; path: string }> }) {
  const siteUrl = normalizeSiteUrl(input.siteUrl);
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    url: toAbsoluteUrl(input.path, siteUrl),
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: toAbsoluteUrl(item.path, siteUrl)
    }))
  };
}

export function categoryPath(category: any) {
  return `/category/${encodeURIComponent(stringifyProductValue(category?.slug || category?.title || category?.name || 'all'))}`;
}
