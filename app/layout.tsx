export const dynamic = 'force-dynamic';

import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { CompareProvider } from '@/components/store/ProductCompare';
import { getSiteSettings } from '@/lib/site-settings';
import JsonLd from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { normalizeSiteUrl } from '@/lib/seo/seo-core';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTitle = settings.site_title || 'Noosheh';
  const siteMetaTitle = settings.site_meta_title || siteTitle;
  const siteDescription = settings.site_meta_description || settings.site_tagline || 'فروشگاه آنلاین نوشه برای خرید لباس زیر، لباس خواب و محصولات راحتی زنانه با تجربه خرید امن.';
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);
  const ogImage = settings.default_og_image || settings.home_hero_rect_image || '/store/noosheh-hero-editorial.png';

  return {
    title: {
      default: siteMetaTitle,
      template: `%s | ${siteTitle}`
    },
    description: siteDescription,
    metadataBase: new URL(siteUrl),
    alternates: { canonical: '/', languages: { 'fa-IR': '/', fa: '/' } },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      locale: 'fa_IR',
      siteName: siteTitle,
      title: siteMetaTitle,
      description: siteDescription,
      url: siteUrl,
      images: [ogImage]
    },
    twitter: {
      card: 'summary_large_image',
      title: siteMetaTitle,
      description: siteDescription,
      images: [ogImage]
    },
    manifest: '/manifest.json',
    icons: settings.site_icon
      ? {
          icon: settings.site_icon,
          shortcut: settings.site_icon,
          apple: settings.site_icon
        }
      : undefined
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL);
  const siteName = settings.site_title || 'Noosheh';
  const org = organizationSchema({
    siteUrl,
    siteName,
    logo: settings.organization_logo || settings.site_icon,
    phone: settings.organization_phone || settings.support_phone,
    address: settings.organization_address || settings.store_address,
    sameAs: [settings.instagram_url, settings.twitter_url, settings.linkedin_url].filter(Boolean)
  });
  const web = websiteSchema({ siteUrl, siteName });

  return (
    <html lang="fa-IR" dir="rtl">
      <body>
        <JsonLd id="schema-org" data={org} />
        <JsonLd id="schema-website" data={web} />
        <CartProvider>
          <CompareProvider>{children}</CompareProvider>
        </CartProvider>
      </body>
    </html>
  );
}
