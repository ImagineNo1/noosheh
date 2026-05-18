import type { Metadata, Viewport } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { CompareProvider } from '@/components/store/ProductCompare';
import { getSiteSettings } from '@/lib/site-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_title || 'Noosheh Poosh',
    description: settings.site_tagline || 'فروشگاه آنلاین نوشه پوش',
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body><CartProvider><CompareProvider>{children}</CompareProvider></CartProvider></body>
    </html>
  );
}
