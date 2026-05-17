import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/lib/cart-context';

export const metadata: Metadata = {
  title: 'Noosheh Poosh',
  description: 'فروشگاه آنلاین نوشه پوش'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body><CartProvider>{children}</CartProvider></body>
    </html>
  );
}
