import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'پیگیری سفارش',
  description: 'پیگیری وضعیت سفارش‌های ثبت‌شده در فروشگاه نوشه با شماره سفارش و اطلاعات تماس.',
  alternates: { canonical: '/order-tracking' },
  openGraph: {
    title: 'پیگیری سفارش نوشه',
    description: 'وضعیت سفارش خود را در فروشگاه نوشه پیگیری کنید.',
    url: '/order-tracking',
    type: 'website',
    locale: 'fa_IR'
  },
  twitter: { card: 'summary_large_image', title: 'پیگیری سفارش نوشه' }
};

export default function OrderTrackingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
