'use client';

import Link from 'next/link';
import { useEntityList } from '../_components/hooks';

export default function SeoDashboardPage() {
  const { data: seo = [] } = useEntityList<any>('SeoMeta');
  const { data: redirects = [] } = useEntityList<any>('Redirect');
  const { data: logs = [] } = useEntityList<any>('NotFoundLog');

  const unresolved404 = logs.filter((x: any) => !x.resolved).length;
  const avgScore = seo.length ? Math.round(seo.reduce((s: number, m: any) => s + (m.seo_score || 0), 0) / seo.length) : 0;
  const missingTitle = seo.filter((x: any) => !x.meta_title).length;
  const missingDescription = seo.filter((x: any) => !x.meta_description).length;

  const stats = [
    ['SEO Items', seo.length],
    ['Avg Score', avgScore],
    ['Redirects', redirects.length],
    ['404 Unresolved', unresolved404],
    ['بدون عنوان', missingTitle],
    ['بدون توضیحات', missingDescription]
  ];

  return <div className='space-y-5'>
    <div>
      <h1 className='text-xl font-extrabold'>SEO Dashboard</h1>
      <p className='text-sm text-muted-foreground'>نمای کلی سلامت سئوی محتوا و مدیریت خطاها</p>
    </div>

    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {stats.map(([k, v]) => <div key={String(k)} className='rounded-xl border bg-card p-4'><p className='text-xs text-muted-foreground'>{String(k)}</p><p className='mt-1 text-2xl font-extrabold'>{String(v)}</p></div>)}
    </div>

    <div className='rounded-xl border bg-card p-4'>
      <h2 className='mb-3 text-sm font-bold'>Quick Actions</h2>
      <div className='flex flex-wrap gap-2'>
        <Link className='rounded border px-3 py-1.5 text-sm' href='/admin/seo/settings'>تنظیمات SEO</Link>
        <Link className='rounded border px-3 py-1.5 text-sm' href='/admin/seo/redirects'>مدیریت ریدایرکت</Link>
        <Link className='rounded border px-3 py-1.5 text-sm' href='/admin/seo/404'>مانیتور 404</Link>
        <Link className='rounded border px-3 py-1.5 text-sm' href='/admin/seo/robots'>Robots</Link>
        <Link className='rounded border px-3 py-1.5 text-sm' href='/admin/seo/sitemap'>Sitemap</Link>
      </div>
    </div>
  </div>;
}
