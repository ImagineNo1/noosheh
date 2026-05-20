'use client';

import { useEffect, useState } from 'react';

type NotFoundRow = { id: string; path: string; hit_count?: number; referrer?: string; resolved?: boolean; last_seen_at?: string };

export default function NotFoundPage() {
  const [rows, setRows] = useState<NotFoundRow[]>([]);
  const [error, setError] = useState('');
  const load = async () => {
    try {
      setError('');
      const res = await fetch('/api/admin/seo/404?resolved=false', { cache: 'no-store' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'خطا در دریافت گزارش 404');
      setRows(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setRows([]);
      setError(err?.message || 'خطای ناشناخته');
    }
  };
  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    try {
      setError('');
      const res = await fetch(`/api/admin/seo/404/${id}/resolve`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: '{}' });
      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || 'Resolve ناموفق بود');
      await load();
    } catch (err: any) {
      setError(err?.message || 'خطا در resolve کردن 404');
    }
  };

  return <div className='space-y-4'>
    <h1 className='text-lg font-bold'>404 Monitor</h1>
    {error && <p className='rounded border border-destructive/30 bg-destructive/10 p-2 text-sm text-destructive'>{error}</p>}
    <div className='overflow-auto rounded border'>
      <table className='w-full text-sm'>
        <thead><tr className='bg-secondary/40 text-right'><th className='p-2'>Path</th><th className='p-2'>Hits</th><th className='p-2'>Referrer</th><th className='p-2'>Last Seen</th><th className='p-2'>Action</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className='border-t'><td className='p-2' dir='ltr'>{r.path}</td><td className='p-2'>{r.hit_count || 0}</td><td className='p-2' dir='ltr'>{r.referrer || '-'}</td><td className='p-2'>{r.last_seen_at || '-'}</td><td className='p-2'><button className='rounded border px-2 py-1' onClick={() => resolve(r.id)}>Resolve</button></td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
