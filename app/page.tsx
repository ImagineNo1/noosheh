export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import StoreHeader from '@/components/store/StoreHeader';
import Footer from '@/components/store/Footer';
import { StoreHome } from '@/components/store/HomeSections';
import { getSiteSettings } from '@/lib/site-settings';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteTagline = settings.site_tagline || 'خرید آنلاین محصولات جدید، پرفروش و تخفیف‌دار نوشه پوش';

  return {
    title: 'صفحه اصلی',
    description: siteTagline
  };
}

export default function Home() {
  return (
    <main>
      <StoreHeader />
      <StoreHome />
      <Footer />
    </main>
  );
}
