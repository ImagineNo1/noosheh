'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/admin/seo', label: 'داشبورد' },
  { href: '/admin/seo/settings', label: 'تنظیمات پایه' },
  { href: '/admin/seo/analyzer', label: 'آنالایزر صفحات' },
  { href: '/admin/seo/redirects', label: 'ریدایرکت‌ها' },
  { href: '/admin/seo/404', label: 'مانیتور ۴۰۴' },
  { href: '/admin/seo/robots', label: 'Robots' },
  { href: '/admin/seo/sitemap', label: 'Sitemap' }
];

export default function Layout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="seo-shell">
      <nav className="seo-topnav" aria-label="بخش‌های سئو">
        {nav.map((item) => {
          const active = item.href === '/admin/seo' ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={active ? 'active' : ''}>{item.label}</Link>;
        })}
      </nav>
      {children}
    </div>
  );
}
