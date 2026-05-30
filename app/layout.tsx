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
  const siteMetaTitle = settings.site_meta_title || siteTitle || 'Noosheh Poosh';
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com');
  return {
    title: {
      default: siteMetaTitle,
      template: `%s | ${siteMetaTitle}`
    },
    description: settings.site_tagline || 'فروشگاه آنلاین نوشه پوش',
    metadataBase: new URL(siteUrl),
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
  const siteUrl = normalizeSiteUrl(settings.site_url || process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com');
  const siteName = settings.site_title || 'Noosheh';
  const org = organizationSchema({ siteUrl, siteName, logo: settings.site_icon });
  const web = websiteSchema({ siteUrl, siteName });
  return (
    <html lang="fa" dir="rtl">
      <body><JsonLd id="schema-org" data={org} /><JsonLd id="schema-website" data={web} /><CartProvider><CompareProvider>{children}</CompareProvider></CartProvider></body>
    </html>
  );
}
