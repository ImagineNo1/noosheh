import type { MetadataRoute } from 'next';
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/sitemap-products.xml`, lastModified: new Date() },
    { url: `${siteUrl}/sitemap-categories.xml`, lastModified: new Date() },
    { url: `${siteUrl}/sitemap-pages.xml`, lastModified: new Date() },
    { url: `${siteUrl}/sitemap-blog.xml`, lastModified: new Date() },
    { url: `${siteUrl}/sitemap-brands.xml`, lastModified: new Date() }
  ];
}
