'use client';

import { useEntityList } from '../../_components/hooks';

export default function RobotsPage() {
  const { data } = useEntityList<any>('SeoSettings');
  const content = data[0]?.robots_txt || `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api`;
  return <div className='space-y-4'>
    <div className='rounded-xl border bg-card p-4'><h1 className='text-lg font-bold'>مدیریت Robots</h1><p className='text-sm text-muted-foreground'>پیش‌نمایش قوانین robots. برای ویرایش به تنظیمات SEO بروید.</p></div>
    <pre className='overflow-auto rounded-xl border bg-secondary/30 p-4 text-xs' dir='ltr'>{content}</pre>
  </div>;
}
