export type SeoMetaInput = Record<string, any>;

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function truncate(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, Math.max(0, max - 1)).trim()}…`;
}

export function generateAutoSeoMeta({ entity, entityType, siteUrl }: { entity?: Record<string, any>; entityType: string; siteUrl?: string }) {
  const title = String(entity?.title || entity?.name || '').trim();
  const shortDescription = stripHtml(String(entity?.short_description || entity?.excerpt || entity?.description || entity?.content || ''));
  const siteName = 'نوشه';
  const keyword = String(entity?.category || entity?.brand || entity?.product_type || title).trim();
  const slug = String(entity?.slug || entity?.code || entity?.id || '').trim();
  const canonicalPath = entityType === 'product' ? `product/${slug}` : entityType === 'blog_post' ? `blog/${slug}` : `${entityType}/${slug}`;
  const metaTitle = truncate(`${title} | خرید و بررسی | ${siteName}`.trim(), 60);
  const metaDescription = truncate(
    shortDescription || `مشاهده ${title} با مشخصات کامل، قیمت به‌روز و ارسال سریع از ${siteName}.`,
    160
  );

  const normalizedSiteUrl = String(siteUrl || process.env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/$/, '');

  return {
    meta_title: metaTitle,
    meta_description: metaDescription,
    focus_keyword: keyword,
    canonical_url: slug && normalizedSiteUrl ? `${normalizedSiteUrl}/${canonicalPath}` : '',
    og_title: metaTitle,
    og_description: metaDescription,
    og_image: entity?.cover_image || entity?.image || entity?.images?.[0] || '',
    twitter_title: metaTitle,
    twitter_description: metaDescription,
    twitter_image: entity?.cover_image || entity?.image || entity?.images?.[0] || '',
    robots_index: true,
    robots_follow: true,
    schema_type: entityType === 'product' ? 'Product' : 'WebPage'
  };
}

export function analyzeSeoContent({ entity, seoMeta }: { entity?: Record<string, any>; seoMeta?: SeoMetaInput; entityType?: string }) {
  const title = (seoMeta?.meta_title || entity?.title || entity?.name || '').trim();
  const description = (seoMeta?.meta_description || entity?.short_description || '').trim();
  const keyword = (seoMeta?.focus_keyword || '').trim().toLowerCase();
  const slug = String(entity?.slug || '').toLowerCase();
  const canonical = (seoMeta?.canonical_url || '').trim();
  const hasSchema = Boolean(seoMeta?.custom_schema || seoMeta?.schema_type);
  const hasOgImage = Boolean(seoMeta?.og_image || entity?.cover_image || entity?.image);

  const checks = [] as Array<{ status: 'pass' | 'warning' | 'error' | 'info'; label: string }>;
  const errors: string[] = [];
  const warnings: string[] = [];
  const passed: string[] = [];

  const push = (ok: boolean, label: string, bad: 'warning' | 'error' = 'warning') => {
    if (ok) {
      checks.push({ status: 'pass', label });
      passed.push(label);
    } else {
      checks.push({ status: bad, label });
      (bad === 'error' ? errors : warnings).push(label);
    }
  };

  push(title.length >= 30 && title.length <= 60, 'طول عنوان بین 30 تا 60 کاراکتر باشد', 'error');
  push(description.length >= 70 && description.length <= 160, 'طول توضیحات بین 70 تا 160 کاراکتر باشد', 'warning');
  push(Boolean(keyword), 'کلمه کلیدی اصلی تعیین شود');
  push(!keyword || title.toLowerCase().includes(keyword), 'کلمه کلیدی در عنوان استفاده شود');
  push(!keyword || description.toLowerCase().includes(keyword), 'کلمه کلیدی در توضیحات استفاده شود');
  push(!keyword || slug.includes(keyword), 'کلمه کلیدی در slug استفاده شود');
  push(Boolean(canonical), 'canonical URL تنظیم شود');
  push(hasSchema, 'schema تنظیم شود');
  push(hasOgImage, 'تصویر شاخص (OG/featured) تنظیم شود');
  push(seoMeta?.robots_index !== false || seoMeta?.robots_follow !== false, 'robots برای ایندکس صحیح تنظیم شود');

  const seoScore = Math.max(0, Math.min(100, Math.round((passed.length / Math.max(1, checks.length)) * 100)));
  const readabilityScore = Math.max(0, Math.min(100, 100 - Math.max(0, description.length - 180) / 2));

  return {
    seoScore,
    readabilityScore: Math.round(readabilityScore),
    checks,
    errors,
    warnings,
    passed,
    suggestions: checks.filter((c) => c.status !== 'pass').map((c) => ({ severity: c.status === 'error' ? 'error' : 'warning', text: c.label }))
  };
}

export function generateJsonLd(type: string, data: any, siteUrl = '') {
  if (!data) return null;
  if (type === 'Product') {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: data.title || data.name,
      description: data.short_description || data.description,
      image: Array.isArray(data.images) ? data.images.map((x: any) => (typeof x === 'string' ? x : x?.url)).filter(Boolean) : [],
      sku: data.code,
      offers: {
        '@type': 'Offer',
        priceCurrency: 'IRR',
        price: data.discount_price || data.price,
        availability: Number(data.stock || 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `${siteUrl}/product/${data.id || data.slug || ''}`
      }
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': type || 'WebPage',
    name: data.title || data.name || '',
    url: data.url || siteUrl || ''
  };
}
