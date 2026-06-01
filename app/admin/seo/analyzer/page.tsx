'use client';

import { useEntityList } from '../../_components/hooks';

export default function AnalyzerPage() {
  const { data, isLoading } = useEntityList<any>('SeoMeta', '-created_date', 200);
  if (isLoading) return <p>loading...</p>;
  return <div className='space-y-4'>
    <div className='rounded-xl border bg-card p-4'><h1 className='text-lg font-bold'>SEO Analyzer</h1><p className='text-sm text-muted-foreground'>این صفحه خروجی امتیازها و وضعیت متا را نمایش می‌دهد.</p></div>
    <div className='rounded-xl border bg-card p-4'>
      <table className='w-full text-sm'>
        <thead><tr className='text-right text-muted-foreground'><th>Entity</th><th>Entity ID</th><th>Score</th><th>Title</th><th>Description</th></tr></thead>
        <tbody>{data.map((r: any) => <tr key={r.id} className='border-t'><td className='py-2'>{r.entity_type}</td><td className='py-2' dir='ltr'>{r.entity_id}</td><td className='py-2'>{r.seo_score || 0}</td><td className='py-2'>{r.meta_title ? '✅' : '❌'}</td><td className='py-2'>{r.meta_description ? '✅' : '❌'}</td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
