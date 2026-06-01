'use client';

import { useEntityList } from '../../_components/hooks';

export default function SitemapPage() {
  const { data: p = [] } = useEntityList<any>('Product');
  const { data: c = [] } = useEntityList<any>('Category');
  const { data: bp = [] } = useEntityList<any>('BlogPost');
  return <div className='space-y-4'>
    <div className='rounded-xl border bg-card p-4'><h1 className='text-lg font-bold'>مدیریت Sitemap</h1><p className='text-sm text-muted-foreground'>بررسی وضعیت محتوای قابل ورود به نقشه سایت.</p></div>
    <div className='grid gap-3 sm:grid-cols-3'>{[['محصول', p.length], ['دسته‌بندی', c.length], ['مقالات', bp.length]].map(([k, v]) => <div key={String(k)} className='rounded-xl border bg-card p-4'><p className='text-xs text-muted-foreground'>{String(k)}</p><p className='text-2xl font-bold'>{String(v)}</p></div>)}</div>
    <div className='rounded-xl border bg-card p-4 text-sm'><p>آدرس sitemap اصلی: <code>/sitemap.xml</code></p><p className='text-muted-foreground mt-2'>فقط صفحات public/published/indexable وارد sitemap می‌شوند.</p></div>
  </div>;
}
