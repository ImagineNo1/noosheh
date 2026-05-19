import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/cart', '/checkout', '/account', '/*?sort=', '/*?filter=', '/*?utm_']
      }
    ],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/sitemap.xml`
  };
}
