import type { Metadata } from 'next';
import StoreHeader from '@/components/store/StoreHeader';
import Footer from '@/components/store/Footer';
import { StoreHome } from '@/components/store/HomeSections';

export const metadata: Metadata = {
  title: 'فروشگاه نوشه پوش | صفحه اصلی',
  description: 'خرید آنلاین محصولات جدید، پرفروش و تخفیف‌دار نوشه پوش'
};

export default function Home() {
  return (
    <main>
      <StoreHeader />
      <StoreHome />
      <Footer />
    </main>
  );
}
