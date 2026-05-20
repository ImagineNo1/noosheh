'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { key: 'dashboard', href: '/admin/seo', label: 'داشبورد' },
  { key: 'settings', href: '/admin/seo/settings', label: 'تنظیمات' },
  { key: 'redirects', href: '/admin/seo/redirects', label: 'ریدایرکت' },
  { key: '404', href: '/admin/seo/404', label: '۴۰۴' },
  { key: 'robots', href: '/admin/seo/robots', label: 'Robots' },
  { key: 'sitemap', href: '/admin/seo/sitemap', label: 'Sitemap' },
  { key: 'analyzer', href: '/admin/seo/analyzer', label: 'آنالایزر' }
];

export default function Layout({ children }: { children: ReactNode }) {
  const p = usePathname();
  return (
    <div className='space-y-4'>
      <div className='rounded-xl border bg-card p-3'>
        <p className='mb-2 text-xs text-muted-foreground'>راهنمای سریع: هر بخش برای مدیریت ایندکس، متادیتا و بهبود رتبه صفحات است.</p>
        <div className='flex flex-wrap gap-2'>
          {nav.map((item) => {
            const active = item.href === '/admin/seo' ? p === item.href : p === item.href || p.startsWith(item.href + '/');
            return <Link key={item.key} href={item.href} className={`px-3 py-1.5 rounded border text-sm ${active ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>{item.label}</Link>;
          })}
        </div>
      </div>
      {children}
    </div>
  );
}
