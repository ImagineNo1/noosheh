import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Noosheh Poosh Landing',
  description: 'Fashion landing page mock in Next.js'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
