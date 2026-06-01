import type { Metadata } from 'next';

const DEFAULT_SITE_URL = 'https://noosheh.com';

export type RobotsInput = {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
};

export function normalizeSiteUrl(siteUrl?: string) {
  const raw = (siteUrl || '').trim();
  if (!raw) return DEFAULT_SITE_URL;
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    return new URL(withProtocol).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
}

export function toAbsoluteUrl(pathOrUrl: string, siteUrl: string) {
  const base = normalizeSiteUrl(siteUrl);
  if (!pathOrUrl) return base;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${base.replace(/\/$/, '')}/${pathOrUrl.replace(/^\//, '')}`;
}

export function normalizeOptionalUrl(url?: string, siteUrl?: string) {
  const raw = (url || '').trim();
  if (!raw) return '';
  try {
    const value = /^https?:\/\//i.test(raw) ? raw : toAbsoluteUrl(raw, siteUrl || DEFAULT_SITE_URL);
    return new URL(value).toString();
  } catch {
    return '';
  }
}

export function stripHtml(input?: string) {
  return (input || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateText(input: string, limit: number) {
  const clean = stripHtml(input);
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 3)).trimEnd()}...`;
}

export function buildRobotsMeta(robots?: RobotsInput) {
  return {
    index: robots?.index !== false,
    follow: robots?.follow !== false,
    noarchive: Boolean(robots?.noarchive),
    nosnippet: Boolean(robots?.nosnippet),
    noimageindex: Boolean(robots?.noimageindex)
  };
}

export function applyMetaTemplate(template: string, vars: Record<string, string | number | undefined>) {
  return Object.entries(vars).reduce((acc, [k, v]) => acc.replaceAll(`%${k}%`, String(v ?? '')), template || '').replace(/\s+/g, ' ').trim();
}

export function generateCanonicalUrl(path: string, siteUrl: string, options?: { lowercase?: boolean; trailingSlash?: boolean }) {
  const absolute = toAbsoluteUrl(path, siteUrl);
  const url = new URL(absolute);
  url.search = '';
  url.hash = '';
  if (options?.lowercase !== false) url.pathname = url.pathname.toLowerCase();
  if (options?.trailingSlash) {
    if (!url.pathname.endsWith('/')) url.pathname += '/';
  } else if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }
  return url.toString();
}

const validOpenGraphTypes = new Set([
  'website',
  'article',
  'book',
  'profile',
  'music.song',
  'music.album',
  'music.playlist',
  'music.radio_station',
  'video.movie',
  'video.episode',
  'video.tv_show',
  'video.other'
]);

function normalizeOpenGraphType(type?: string) {
  const value = (type || '').trim();
  return validOpenGraphTypes.has(value) ? value : 'website';
}

export function generateSeoMetadata(input: {
  title?: string;
  description?: string;
  path: string;
  siteUrl?: string;
  siteName: string;
  defaultOgImage?: string;
  robots?: RobotsInput;
  canonicalUrl?: string;
  og?: Record<string, string | undefined>;
  twitter?: Record<string, string | undefined>;
  locale?: string;
  keywords?: string[];
}): Metadata {
  const title = truncateText(input.title || input.siteName, 60);
  const description = truncateText(input.description || '', 160);
  const normalizedSiteUrl = normalizeSiteUrl(input.siteUrl);
  const canonical = normalizeOptionalUrl(input.canonicalUrl, normalizedSiteUrl) || generateCanonicalUrl(input.path, normalizedSiteUrl);
  const robots = buildRobotsMeta(input.robots);
  const ogImage = normalizeOptionalUrl(input.og?.image, normalizedSiteUrl) || normalizeOptionalUrl(input.defaultOgImage, normalizedSiteUrl);
  const twitterImage = normalizeOptionalUrl(input.twitter?.image, normalizedSiteUrl) || ogImage;

  return {
    title,
    description,
    metadataBase: new URL(normalizedSiteUrl),
    alternates: { canonical, languages: { 'fa-IR': canonical, fa: canonical } },
    robots,
    keywords: input.keywords,
    openGraph: {
      title: input.og?.title || title,
      description: input.og?.description || description,
      siteName: input.siteName,
      url: canonical,
      locale: input.locale || 'fa_IR',
      type: normalizeOpenGraphType(input.og?.type) as any,
      images: ogImage ? [ogImage] : []
    },
    twitter: {
      card: (input.twitter?.card as any) || 'summary_large_image',
      title: input.twitter?.title || title,
      description: input.twitter?.description || description,
      images: twitterImage ? [twitterImage] : []
    }
  };
}
