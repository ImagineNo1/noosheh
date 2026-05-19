'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Layout({ children }: { children: ReactNode }) {
  const p = usePathname();
  const nav = ['', 'settings', 'redirects', '404', 'robots', 'sitemap', 'analyzer'];
  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap gap-2'>
        {nav.map((n) => {
          const href = '/admin/seo' + (n ? '/' + n : '');
          const a = p === href || p.startsWith(href + '/');
          return (
            <Link key={href} href={href} className={`px-3 py-1.5 rounded border text-sm ${a ? 'bg-primary text-primary-foreground' : 'bg-card'}`}>
              {n || 'داشبورد'}
            </Link>
          );
        })}
      </div>
      {children}
    </div>
  );
}
