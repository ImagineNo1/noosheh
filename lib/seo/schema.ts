export function toAbsoluteUrl(pathOrUrl: string, siteUrl: string) {
  if (!pathOrUrl) return siteUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl.replace(/\/$/, '')}/${pathOrUrl.replace(/^\//, '')}`;
}

export function organizationSchema(input: { siteUrl: string; siteName: string; logo?: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: input.siteName,
    url: input.siteUrl,
    logo: input.logo ? toAbsoluteUrl(input.logo, input.siteUrl) : undefined
  };
}

export function websiteSchema(input: { siteUrl: string; siteName: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: input.siteName,
    url: input.siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${input.siteUrl.replace(/\/$/, '')}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };
}

export function productSchema(input: { siteUrl: string; product: any }) {
  const p = input.product;
  const images = [p.cover_image, ...(Array.isArray(p.images) ? p.images : [])]
    .map((x: any) => (typeof x === 'string' ? x : x?.url))
    .filter(Boolean)
    .map((x: string) => toAbsoluteUrl(x, input.siteUrl));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title || p.name,
    image: images,
    description: p.short_description || p.description,
    sku: p.code || p.id,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'IRR',
      price: p.discount_price || p.price,
      availability: Number(p.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${input.siteUrl.replace(/\/$/, '')}/product/${p.id}`
    }
  };
}

export function breadcrumbSchema(input: { siteUrl: string; items: Array<{ name: string; path: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.path, input.siteUrl)
    }))
  };
}

export function blogPostingSchema(input: { siteUrl: string; post: any }) {
  const post = input.post;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo_description || '',
    image: post.cover_image ? [toAbsoluteUrl(post.cover_image, input.siteUrl)] : [],
    datePublished: post.created_date,
    dateModified: post.updated_date || post.created_date,
    mainEntityOfPage: toAbsoluteUrl(`/blog/${post.slug || post.id}`, input.siteUrl),
    author: {
      '@type': 'Person',
      name: post.author_name || 'تیم محتوا'
    }
  };
}

export function collectionPageSchema(input: { siteUrl: string; name: string; path: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: input.name,
    url: toAbsoluteUrl(input.path, input.siteUrl)
  };
}

export function itemListSchema(input: { siteUrl: string; name: string; path: string; items: Array<{ name: string; path: string }> }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: input.name,
    url: toAbsoluteUrl(input.path, input.siteUrl),
    itemListElement: input.items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: toAbsoluteUrl(item.path, input.siteUrl)
    }))
  };
}
