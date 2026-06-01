import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تماس با نوشه',
  description: 'راه‌های ارتباط با پشتیبانی نوشه برای پیگیری سفارش، مشاوره خرید و سوالات محصولات.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'تماس با نوشه',
    description: 'ارتباط با تیم پشتیبانی فروشگاه نوشه.',
    url: '/contact',
    type: 'website',
    locale: 'fa_IR'
  },
  twitter: { card: 'summary_large_image', title: 'تماس با نوشه' }
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
