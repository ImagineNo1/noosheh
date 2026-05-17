import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';
import { CompareProvider } from '@/components/store/ProductCompare';

export const metadata: Metadata = {
  title: 'Noosheh Poosh',
  description: 'فروشگاه آنلاین نوشه پوش'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body><CartProvider><CompareProvider>{children}</CompareProvider></CartProvider></body>
    </html>
  );
}
