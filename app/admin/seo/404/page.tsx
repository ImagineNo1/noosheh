'use client';

import { useEffect, useState } from 'react';

type NotFoundRow = { id: string; path: string; hit_count?: number; referrer?: string; resolved?: boolean; last_seen_at?: string };

export default function NotFoundPage() {
  const [rows, setRows] = useState<NotFoundRow[]>([]);
  const load = async () => setRows(await fetch('/api/admin/seo/404?resolved=false').then((r) => r.json()));
  useEffect(() => { load(); }, []);

  const resolve = async (id: string) => {
    await fetch(`/api/admin/seo/404/${id}/resolve`, { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: '{}' });
    await load();
  };

  return <div className='space-y-4'>
    <h1 className='text-lg font-bold'>404 Monitor</h1>
    <div className='overflow-auto rounded border'>
      <table className='w-full text-sm'>
        <thead><tr className='bg-secondary/40 text-right'><th className='p-2'>Path</th><th className='p-2'>Hits</th><th className='p-2'>Referrer</th><th className='p-2'>Last Seen</th><th className='p-2'>Action</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className='border-t'><td className='p-2' dir='ltr'>{r.path}</td><td className='p-2'>{r.hit_count || 0}</td><td className='p-2' dir='ltr'>{r.referrer || '-'}</td><td className='p-2'>{r.last_seen_at || '-'}</td><td className='p-2'><button className='rounded border px-2 py-1' onClick={() => resolve(r.id)}>Resolve</button></td></tr>)}</tbody>
      </table>
    </div>
  </div>;
}
