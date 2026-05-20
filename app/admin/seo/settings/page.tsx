'use client';

import { useEffect, useState } from 'react';
import { useEntityList } from '../../_components/hooks';
import { adminApi } from '../../admin-api';

const labels: Record<string, string> = {
  site_name: 'نام سایت',
  site_description: 'توضیحات سایت',
  site_url: 'آدرس سایت',
  default_og_image: 'تصویر پیش‌فرض OG',
  title_separator: 'جداکننده عنوان',
  robots_txt: 'متن robots.txt'
};

export default function SeoSettingsPage() {
  const { data, reload } = useEntityList<any>('SeoSettings');
  const [form, setForm] = useState<any>({ site_name: '', site_description: '', site_url: '', default_og_image: '', title_separator: '|', robots_txt: '' });
  useEffect(() => { if (data[0]) setForm((f: any) => ({ ...f, ...data[0] })); }, [data]);

  const save = async () => {
    if (data[0]) await adminApi.update('SeoSettings', data[0].id, form); else await adminApi.create('SeoSettings', form);
    await reload();
    alert('تنظیمات SEO ذخیره شد');
  };

  return <div className='max-w-3xl space-y-4'>
    <div className='rounded-xl border bg-card p-4'><h1 className='text-lg font-bold'>تنظیمات سئو</h1><p className='text-sm text-muted-foreground'>این مقادیر در metadata، canonical و schema پیش‌فرض استفاده می‌شوند.</p></div>
    <div className='rounded-xl border bg-card p-4 space-y-3'>
      {Object.keys(form).map((k) => <div key={k} className='space-y-1'><label className='text-sm font-semibold'>{labels[k] || k}</label><p className='text-xs text-muted-foreground'>فیلد {labels[k] || k} را با دقت وارد کنید.</p>{k === 'robots_txt' ? <textarea value={form[k] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [k]: e.target.value }))} className='min-h-28 w-full rounded border p-2 text-sm' dir='ltr' /> : <input value={form[k] || ''} onChange={(e) => setForm((f: any) => ({ ...f, [k]: e.target.value }))} className='w-full rounded border p-2' dir={k.includes('url') ? 'ltr' : undefined} />}</div>)}
      <button onClick={save} className='rounded bg-primary px-4 py-2 text-primary-foreground'>ذخیره</button>
    </div>
  </div>;
}
