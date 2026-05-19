import type { Metadata } from 'next';

export type RobotsInput = {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
};

export function toAbsoluteUrl(pathOrUrl: string, siteUrl: string) {
  if (!pathOrUrl) return siteUrl;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${siteUrl.replace(/\/$/, '')}/${pathOrUrl.replace(/^\//, '')}`;
}

export function truncateText(input: string, limit: number) {
  const clean = (input || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  return `${clean.slice(0, Math.max(0, limit - 1)).trimEnd()}…`;
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

export function generateSeoMetadata(input: {
  title?: string;
  description?: string;
  path: string;
  siteUrl: string;
  siteName: string;
  defaultOgImage?: string;
  robots?: RobotsInput;
  canonicalUrl?: string;
  og?: Record<string, string | undefined>;
  twitter?: Record<string, string | undefined>;
}): Metadata {
  const title = truncateText(input.title || input.siteName, 60);
  const description = truncateText(input.description || '', 160);
  const canonical = input.canonicalUrl || generateCanonicalUrl(input.path, input.siteUrl);
  const robots = buildRobotsMeta(input.robots);

  return {
    title,
    description,
    metadataBase: new URL(input.siteUrl),
    alternates: { canonical },
    robots,
    openGraph: {
      title: input.og?.title || title,
      description: input.og?.description || description,
      siteName: input.siteName,
      url: canonical,
      type: (input.og?.type as any) || 'website',
      images: [input.og?.image || input.defaultOgImage].filter(Boolean) as string[]
    },
    twitter: {
      card: (input.twitter?.card as any) || 'summary_large_image',
      title: input.twitter?.title || title,
      description: input.twitter?.description || description,
      images: [input.twitter?.image || input.defaultOgImage].filter(Boolean) as string[]
    }
  };
}
