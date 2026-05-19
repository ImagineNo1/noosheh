import type { Metadata } from 'next';
import type { RobotsDirectives } from '@/lib/seo/types';

export function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, Math.max(0, max - 1)).trim()}…` : text;
}

export function generateCanonicalUrl(path: string, siteUrl: string) {
  return new URL(path.toLowerCase(), siteUrl).toString();
}

export function buildRobotsMeta(robots?: RobotsDirectives): Metadata['robots'] {
  if (!robots) return undefined;
  return {
    index: robots.index,
    follow: robots.follow,
    noarchive: robots.noarchive,
    nosnippet: robots.nosnippet,
    noimageindex: robots.noimageindex
  };
}

type GenerateSeoMetadataInput = {
  title?: string;
  description?: string;
  canonicalPath?: string;
  siteUrl: string;
  siteName: string;
  robots?: RobotsDirectives;
  ogImage?: string;
};

export function generateSeoMetadata(input: GenerateSeoMetadataInput): Metadata {
  const title = truncate(input.title || input.siteName, 60);
  const description = truncate(input.description || '', 160);
  const canonical = input.canonicalPath ? generateCanonicalUrl(input.canonicalPath, input.siteUrl) : undefined;
  return {
    title,
    description,
    alternates: canonical ? { canonical } : undefined,
    robots: buildRobotsMeta(input.robots),
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      siteName: input.siteName,
      images: input.ogImage ? [{ url: input.ogImage }] : undefined
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: input.ogImage ? [input.ogImage] : undefined
    }
  };
}
