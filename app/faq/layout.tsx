import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سوالات متداول',
  description: 'پاسخ سوالات رایج درباره خرید، ارسال، بازگشت کالا، انتخاب سایز و محصولات نوشه.',
  alternates: { canonical: '/faq' },
  openGraph: {
    title: 'سوالات متداول نوشه',
    description: 'راهنمای خرید و پاسخ سوالات رایج مشتریان نوشه.',
    url: '/faq',
    type: 'website',
    locale: 'fa_IR'
  },
  twitter: { card: 'summary_large_image', title: 'سوالات متداول نوشه' }
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
